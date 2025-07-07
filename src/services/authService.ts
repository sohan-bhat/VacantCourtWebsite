import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    UserCredential,
    User as FirebaseUser,
    deleteUser,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    updateProfile,
    updatePassword
} from 'firebase/auth';
import { auth } from './config';
import toast from 'react-hot-toast';

export interface AppUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}

const googleProvider = new GoogleAuthProvider();


/**
 * Signs up a new user with email and password.
 * @param email - The user's email.
 * @param password - The user's password.
 * @returns A promise that resolves with the user credential.
 */
export const signUpWithEmail = async (email: string, password: string): Promise<UserCredential> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential;
    } catch (error) {
        console.error("Error signing up:", error);
        throw error;
    }
};

/**
 * Logs in an existing user with email and password.
 * @param email - The user's email.
 * @param password - The user's password.
 * @returns A promise that resolves with the user credential.
 */
export const loginWithEmail = async (email: string, password: string): Promise<UserCredential> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential;
    } catch (error) {
        console.error("Error logging in:", error);
        throw error;
    }
};

export const signInWithGoogle = async (): Promise<UserCredential> => {
    try {

        const userCredential = await signInWithPopup(auth, googleProvider);
        return userCredential;
    } catch (error: any) {
        if (error.code === 'auth/account-exists-with-different-credential') {
            toast.error('An account already exists with this email. Try logging in with your original method.');
        } else if (error.code === 'auth/popup-closed-by-user') {
            toast.error('Google Sign-In popup was closed.');
        } else {
            toast.error('Error signing in with Google. Please try again.');
        }
        console.error("Error signing in with Google:", error);
        throw error;
    }
};

/**
 * Logs out the current user.
 * @returns A promise that resolves when sign out is complete.
 */
export const logoutUser = async (): Promise<void> => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error logging out:", error);
        throw error;
    }
};


/**
 * Subscribes to authentication state changes.
 * @param callback - A function to call with the user object (or null) when the state changes.
 * @returns The unsubscribe function.
 */
export const onAuthUserChanged = (callback: (user: AppUser | null) => void) => {
    return onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
            const appUser: AppUser = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
            };
            callback(appUser);
        } else {
            callback(null);
        }
    });
};

export const deleteCurrentUserAccount = async (): Promise<void> => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("No user is currently signed in to delete.");
    }
    try {
        await deleteUser(user);
    } catch (error: any) {
        console.error("Error deleting user account:", error);
        throw error;
    }
};

export const sendPasswordResetLink = async (email: string): Promise<void> => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        console.error("Error sending password reset email:", error);
        throw error;
    }
};

/**
 * Updates the current user's profile information (displayName, photoURL).
 * @param updates - An object containing the displayName and/or photoURL to update.
 */
export const updateUserProfile = async (updates: { displayName?: string; photoURL?: string }): Promise<void> => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user is signed in.");

    try {
        await updateProfile(user, updates);
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
};

/**
 * Updates the current user's password. Requires recent login.
 * @param newPassword - The new password for the user.
 */
export const updateUserPassword = async (newPassword: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user is signed in.");

    try {
        await updatePassword(user, newPassword);
    } catch (error) {
        console.error("Error updating password:", error);
        throw error;
    }
};