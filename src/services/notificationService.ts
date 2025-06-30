import {
    addDoc,
    collection,
    query,
    where,
    getDocs,
    deleteDoc,
    doc,
    limit,
} from 'firebase/firestore';
import { db } from './config';

export const addNotificationRequest = async (
    courtId: string,
    courtName: string,
    userId: string,
    userEmail: string
): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, 'notificationRequests'), {
            courtId: courtId,
            courtName: courtName,
            userId: userId,
            userEmail: userEmail,
            requestedAt: new Date()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding notification request:", error);
        throw error;
    }
};

export const getNotificationRequestForUser = async (courtId: string, userId: string): Promise<string | null> => {
    try {
        const q = query(
            collection(db, 'notificationRequests'),
            where('courtId', '==', courtId),
            where('userId', '==', userId),
            limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].id;
        }
        return null;
    } catch (error) {
        console.error("Error fetching notification request:", error);
        throw error;
    }
};

export const removeNotificationRequest = async (requestId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'notificationRequests', requestId));
    } catch (error) {
        console.error("Error removing notification request:", error);
        throw error;
    }
};