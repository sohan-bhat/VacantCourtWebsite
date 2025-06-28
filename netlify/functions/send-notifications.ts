import { Handler, schedule } from '@netlify/functions';
import admin from 'firebase-admin';
import { Resend } from 'resend';

const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
const db = admin.firestore();

const resend = new Resend(process.env.RESEND_API_KEY);

export const handler: Handler = schedule('* * * * *', async () => {
    console.log('Running scheduled notification check...');

    try {
        const requestsSnapshot = await db.collection('notificationRequests').get();

        if (requestsSnapshot.empty) {
            console.log('No pending notification requests. Exiting.');
            return { statusCode: 200, body: 'No pending requests.' };
        }

        const courtIdsWithRequests = new Set<string>();
        requestsSnapshot.forEach(doc => {
            courtIdsWithRequests.add(doc.data().courtId);
        });

        if (courtIdsWithRequests.size === 0) {
            return { statusCode: 200, body: 'No courts to check.' };
        }

        const courtsSnapshot = await db.collection('Courts')
            .where(admin.firestore.FieldPath.documentId(), 'in', Array.from(courtIdsWithRequests))
            .get();

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

        const notificationPromises: Promise<any>[] = [];

        requestsSnapshot.forEach(requestDoc => {
            const requestData = requestDoc.data();
            const courtId = requestData.courtId;

            if (availableCourts.has(courtId)) {
                const courtInfo = availableCourts.get(courtId)!;

                const emailPromise = resend.emails.send({
                    from: 'sohanrambhatdev@gmail.com',
                    to: [requestData.userEmail],
                    subject: `A court is now available at ${courtInfo.name}!`,
                    html: `<p>Hello!</p><p>A court (${courtInfo.availableSubCourts.join(', ')}) has just become available at <strong>${courtInfo.name}</strong>.</p><p>Head to VacantCourt to check it out!</p>`,
                });

                const deletePromise = requestDoc.ref.delete();

                notificationPromises.push(emailPromise, deletePromise);
                console.log(`Queued email for ${requestData.userEmail} for court ${courtInfo.name}`);
            }
        });

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