import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from './config';
import { getAuth } from 'firebase/auth';


/**
 * Gets the number of courts owned by a specific user.
 * @param userId The UID of the user.
 * @returns A promise that resolves with the number of courts they own.
 */
export const getUserOwnedCourtsCount = async (userId: string): Promise<number> => {
    const courtsRef = collection(db, 'Courts');
    const q = query(courtsRef, where('ownerId', '==', userId));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
};

export const transferCourtOwnership = async (courtId: string, newOwnerEmail: string): Promise<void> => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        throw new Error("You must be logged in to perform this action.");
    }

    const token = await user.getIdToken();

    const response = await fetch('/.netlify/functions/transferOwnership', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ courtId, newOwnerEmail })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to transfer ownership.');
    }
};