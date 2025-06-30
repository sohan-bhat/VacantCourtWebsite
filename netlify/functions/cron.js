const admin = require('firebase-admin');
const emailjs = require('@emailjs/nodejs');

let firebaseInitialized = false;
try {
  if (admin.apps.length === 0) {
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    if (!privateKey) throw new Error("FIREBASE_PRIVATE_KEY is not set.");
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    console.log("SUCCESS: Firebase Admin SDK initialized.");
    firebaseInitialized = true;
  } else {
    firebaseInitialized = true;
  }
} catch (error) {
  console.error('CRITICAL: Firebase Admin SDK initialization failed!', error);
}

const db = firebaseInitialized ? admin.firestore() : null;

exports.handler = async function(event, context) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting notification check with EmailJS...`);

  if (!firebaseInitialized || !db) {
    console.error(`[${timestamp}] Exiting: Firebase not initialized.`);
    return { statusCode: 500, body: 'Firebase not initialized.' };
  }

  const SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
  const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
  const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
  const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;
  const SITE_BASE_URL = process.env.SITE_BASE_URL;

  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY || !PRIVATE_KEY || !SITE_BASE_URL) {
    console.error(`[${timestamp}] Exiting: Missing one or more EmailJS environment variables.`);
    return { statusCode: 500, body: 'EmailJS environment variables are not fully configured.' };
  }

  try {
    const requestsSnapshot = await db.collection('notificationRequests').get();
    if (requestsSnapshot.empty) {
      console.log(`[${timestamp}] No pending requests found. Exiting.`);
      return { statusCode: 200, body: 'No pending requests.' };
    }
    console.log(`[${timestamp}] Found ${requestsSnapshot.size} total requests.`);

    const courtIdsWithRequests = [...new Set(requestsSnapshot.docs.map(doc => doc.data().courtId))];
    const courtsSnapshot = await db.collection('Courts').where(admin.firestore.FieldPath.documentId(), 'in', courtIdsWithRequests).get();
    const availableCourts = new Map();

    courtsSnapshot.forEach(courtDoc => {
      const courtData = courtDoc.data();
      const availableSubCourts = courtData.courts.filter(sc => sc.status === 'available').map(sc => sc.name);
      if (availableSubCourts.length > 0) {
        availableCourts.set(courtDoc.id, { name: courtData.name, availableSubCourtNames: availableSubCourts });
      }
    });

    if (availableCourts.size === 0) {
      console.log(`[${timestamp}] No requested courts have become available. Exiting.`);
      return { statusCode: 200, body: 'No newly available courts.' };
    }
    console.log(`[${timestamp}] Found ${availableCourts.size} courts that are now available.`);

    const successfulDeletes = [];
    let emailsSent = 0;
    
    for (const requestDoc of requestsSnapshot.docs) {
      const requestData = requestDoc.data();
      const courtId = requestData.courtId;

      if (availableCourts.has(courtId)) {
        const courtInfo = availableCourts.get(courtId);

        const templateParams = {
          to_email: requestData.userEmail,
          court_name: courtInfo.name,
          sub_court_names: courtInfo.availableSubCourtNames.join(', '),
          court_url: `${SITE_BASE_URL}/court/${courtId}`,
        };

        console.log(`Attempting to send email via EmailJS to: ${requestData.userEmail}`);
        
        try {
          await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, {
            publicKey: PUBLIC_KEY,
            privateKey: PRIVATE_KEY,
          });

          console.log(`SUCCESS sending email to ${requestData.userEmail}.`);
          emailsSent++;
          successfulDeletes.push(requestDoc.ref.delete());

        } catch (err) {
          console.error(`ERROR sending EmailJS email to ${requestData.userEmail}:`, err);
        }
      }
    }

    await Promise.all(successfulDeletes);
    console.log(`[${timestamp}] Successfully processed ${emailsSent} notifications. Deleted ${successfulDeletes.length} requests.`);
    return { statusCode: 200, body: `Processed ${emailsSent} notifications.` };

  } catch (error) {
    console.error(`[${timestamp}] FATAL ERROR during execution:`, error);
    return { statusCode: 500, body: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};