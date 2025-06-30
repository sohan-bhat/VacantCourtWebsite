const admin = require('firebase-admin');
const { Resend } = require('resend');


let firebaseInitialized = false;

try {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("FIREBASE_PRIVATE_KEY environment variable is not set.");
  }

  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey.replace(/\\n/g, '\n'),
  };

  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("SUCCESS: Firebase Admin SDK initialized successfully.");
    firebaseInitialized = true;
  } else {
    firebaseInitialized = true;
  }
} catch (error) {
  console.error('CRITICAL: Firebase Admin SDK initialization failed!', error);
}

const db = firebaseInitialized ? admin.firestore() : null;
const resend = new Resend(process.env.RESEND_API_KEY);


exports.handler = async function(event, context) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting notification check...`);

  const FROM_EMAIL = 'sohanrambhatdev@gmail.com';

  if (!firebaseInitialized || !db) {
    console.error(`[${timestamp}] Exiting: Firebase not initialized.`);
    return { statusCode: 500, body: 'Firebase not initialized.' };
  }

  try {
    const requestsSnapshot = await db.collection('notificationRequests').get();
    if (requestsSnapshot.empty) {
      console.log(`[${timestamp}] No pending requests found. Exiting.`);
      return { statusCode: 200, body: 'No pending requests.' };
    }
    console.log(`[${timestamp}] Found ${requestsSnapshot.size} total requests.`);

    const courtIdsWithRequests = [...new Set(requestsSnapshot.docs.map(doc => doc.data().courtId))];

    const courtsSnapshot = await db.collection('Courts')
      .where(admin.firestore.FieldPath.documentId(), 'in', courtIdsWithRequests)
      .get();

    const availableCourts = new Map();
    courtsSnapshot.forEach(courtDoc => {
      const courtData = courtDoc.data();
      const availableSubCourts = courtData.courts
        .filter(subCourt => subCourt.status === 'available')
        .map(subCourt => subCourt.name);
      
      if (availableSubCourts.length > 0) {
        availableCourts.set(courtDoc.id, {
          name: courtData.name,
          availableSubCourtNames: availableSubCourts,
        });
      }
    });

    if (availableCourts.size === 0) {
      console.log(`[${timestamp}] No requested courts have become available. Exiting.`);
      return { statusCode: 200, body: 'No newly available courts.' };
    }
    console.log(`[${timestamp}] Found ${availableCourts.size} courts that are now available.`);

    const promises = [];
    requestsSnapshot.forEach(requestDoc => {
      const requestData = requestDoc.data();
      const courtId = requestData.courtId;

      if (availableCourts.has(courtId)) {
        const courtInfo = availableCourts.get(courtId);
        console.log(`Processing notification for ${requestData.userEmail} for court ${courtInfo.name}`);

        const emailPromise = resend.emails.send({
          from: FROM_EMAIL,
          to: [requestData.userEmail],
          subject: `A court is now available at ${courtInfo.name}!`,
          html: `<p>Hello!</p><p>A court (${courtInfo.availableSubCourtNames.join(', ')}) has just become available at <strong>${courtInfo.name}</strong>.</p><p>Head to VacantCourt to check it out!</p>`,
        });
        
        const deletePromise = requestDoc.ref.delete();
        promises.push(emailPromise, deletePromise);
      }
    });

    await Promise.all(promises);
    console.log(`[${timestamp}] Successfully processed ${promises.length / 2} notifications.`);
    return { statusCode: 200, body: `Processed ${promises.length / 2} notifications.` };

  } catch (error) {
    console.error(`[${timestamp}] FATAL ERROR during execution:`, error);
    return {
      statusCode: 500,
      body: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};