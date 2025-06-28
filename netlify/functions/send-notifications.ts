import { Handler, schedule } from '@netlify/functions';
import admin from 'firebase-admin';
import { Resend } from 'resend';

// --- Initialize Firebase Admin SDK ---
// This SDK is for backend environments and needs service account credentials.
const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // The private key needs to be parsed correctly from the environment variable.
    // Netlify's build process handles replacing `\n` characters.
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Initialize Firebase Admin only once
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
const db = admin.firestore();

// --- Initialize Resend ---
const resend = new Resend(process.env.RESEND_API_KEY);

// --- The Main Function Handler ---
// We wrap the main logic in the `schedule` function from Netlify.
export const handler: Handler = schedule('* * * * *', async () => {
    console.log('Running scheduled notification check...');

    try {
        const requestsSnapshot = await db.collection('notificationRequests').get();

        if (requestsSnapshot.empty) {
            console.log('No pending notification requests. Exiting.');
            return { statusCode: 200, body: 'No pending requests.' };
        }

        // 1. Get a unique list of all courts that users are waiting for.
        const courtIdsWithRequests = new Set<string>();
        requestsSnapshot.forEach(doc => {
            courtIdsWithRequests.add(doc.data().courtId);
        });

        if (courtIdsWithRequests.size === 0) {
            return { statusCode: 200, body: 'No courts to check.' };
        }

        // 2. Fetch the current status of ONLY those courts.
        const courtsSnapshot = await db.collection('Courts')
            .where(admin.firestore.FieldPath.documentId(), 'in', Array.from(courtIdsWithRequests))
            .get();

        // 3. Find which of these courts have at least one sub-court available.
        const availableCourts = new Map<string, { name: string; availableSubCourts: string[] }>();
        courtsSnapshot.forEach(courtDoc => {
            const courtData = courtDoc.data();
            const availableSubCourts = courtData.courts
                .filter((subCourt: any) => subCourt.status === 'available')
                .map((subCourt: any) => subCourt.name);

            if (availableSubCourts.length > 0) {
                availableCourts.set(courtDoc.id, { name: courtData.name, availableSubCourts });
            }
        });

        if (availableCourts.size === 0) {
            console.log('No courts have become available. Exiting.');
            return { statusCode: 200, body: 'No newly available courts.' };
        }

        // 4. Process notifications for each available court
        const notificationPromises: Promise<any>[] = [];

        requestsSnapshot.forEach(requestDoc => {
            const requestData = requestDoc.data();
            const courtId = requestData.courtId;

            // If this user's requested court is in our list of available courts...
            if (availableCourts.has(courtId)) {
                const courtInfo = availableCourts.get(courtId)!;

                // Queue the email to be sent using Resend
                const emailPromise = resend.emails.send({
                    from: 'VacantCourt <notify@your-verified-domain.com>', // IMPORTANT: Replace with your domain verified on Resend
                    to: [requestData.userEmail],
                    subject: `A court is now available at ${courtInfo.name}!`,
                    html: `<p>Hello!</p><p>A court (${courtInfo.availableSubCourts.join(', ')}) has just become available at <strong>${courtInfo.name}</strong>.</p><p>Head to VacantCourt to check it out!</p>`,
                });

                const deletePromise = requestDoc.ref.delete(); // Get ready to delete this fulfilled request

                notificationPromises.push(emailPromise, deletePromise);
                console.log(`Queued email for ${requestData.userEmail} for court ${courtInfo.name}`);
            }
        });

        // 5. Execute all the emails and deletions
        await Promise.all(notificationPromises);

        console.log(`Successfully processed ${notificationPromises.length / 2} notifications.`);
        return { statusCode: 200, body: `Processed ${notificationPromises.length / 2} notifications.` };

    } catch (error) {
        console.error('Error in scheduled notification function:', error);
        return {
            statusCode: 500,
            body: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
});