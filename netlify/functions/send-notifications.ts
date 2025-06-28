import { Handler, schedule } from '@netlify/functions';
import admin from 'firebase-admin';
import { Resend } from 'resend';

// --- Initialize Firebase Admin SDK ---
try {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // **THIS IS THE CRITICAL CHANGE**
    // It decodes the Base64 key from your environment variable back into the proper format.
    privateKey: Buffer.from(process.env.FIREBASE_PRIVATE_KEY || '', 'base64').toString('ascii'),
  };

  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
} catch (e) {
  console.error('CRITICAL: Firebase Admin SDK initialization failed!', e);
}

const db = admin.firestore();
const resend = new Resend(process.env.RESEND_API_KEY);

// --- The Main Function Handler ---
export const handler: Handler = schedule('*/10 * * * *', async () => {
    console.log(`[${new Date().toISOString()}] Function starting...`);

    // **CRITICAL ACTION ITEM FOR YOU**
    // You MUST replace this with a domain you have verified in your Resend account.
    // For testing, you can use 'onboarding@resend.dev', but it's not for production.
    const FROM_EMAIL = 'VacantCourt <notify@your-verified-domain.com>';

    // Check if Firebase was initialized correctly
    if (admin.apps.length === 0) {
        console.error("Firebase not initialized. Exiting function.");
        return { statusCode: 500, body: 'Firebase not initialized.' };
    }

    try {
        const requestsSnapshot = await db.collection('notificationRequests').get();

        if (requestsSnapshot.empty) {
            console.log('No pending notification requests found. Exiting normally.');
            return { statusCode: 200, body: 'No pending requests.' };
        }
        console.log(`Found ${requestsSnapshot.size} total notification requests.`);

        // ... (The rest of your logic will go here once initialization is confirmed working)
        // For now, let's just confirm we can read the data.
        
        console.log('Function finished successfully (test run).');
        return { statusCode: 200, body: 'Function ran successfully.' };

    } catch (error) {
        console.error('FATAL ERROR during function execution:', error);
        return {
            statusCode: 500,
            body: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
});