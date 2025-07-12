import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import sitemap from 'vite-plugin-sitemap';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Fetches all court IDs from Firestore using the Admin SDK.
 * This function is self-contained and runs only during the build process.
 */
const getCourtRoutesForSitemap = async () => {
    if (admin.apps.length === 0) {
        const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
        if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
            console.warn('Firebase admin credentials not found. Skipping dynamic route generation for sitemap.');
            return [];
        }
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey,
            }),
        });
    }

    try {
        const db = admin.firestore();
        const courtsSnapshot = await db.collection('Courts').get();
        if (courtsSnapshot.empty) {
            console.log('No courts found in Firestore for sitemap.');
            return [];
        }
        const courtRoutes = courtsSnapshot.docs.map(doc => `/court/${doc.id}`);
        console.log(`Found ${courtRoutes.length} dynamic court routes for sitemap.xml`);
        return courtRoutes;
    } catch (error) {
        console.error('Error fetching court IDs for sitemap:', error);
        return [];
    }
};

export default defineConfig(async () => {
    

    const staticRoutes = [
        '/',
        '/privacy',
        '/tos',
    ];

    const dynamicCourtRoutes = await getCourtRoutesForSitemap();

    const allRoutes = [...staticRoutes, ...dynamicCourtRoutes];

    return {
        plugins: [
            react(),
            sitemap({
                hostname: 'https://vacantcourt.netlify.app',
                
                dynamicRoutes: allRoutes,
                
                exclude: [
                    '/auth', 
                    '/account', 
                    '/account/profile', 
                    '/account/subscriptions',
                    '/page404',
                ],
                
                robots: [{ userAgent: '*', allow: '/' }],
            }),
        ],
    };
});