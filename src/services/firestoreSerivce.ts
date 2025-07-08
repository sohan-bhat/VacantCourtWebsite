import {
    collection,
    doc,
    addDoc,
    updateDoc,
    getDoc,
    deleteDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit as firestoreLimit,
    onSnapshot, 
    Unsubscribe,
    QueryConstraint,
    WhereFilterOp as FirebaseWhereFilterOp
} from 'firebase/firestore';
import { db } from './config';
import { getAuth } from 'firebase/auth';

export interface FirestoreDocWithId {
    id: string;
    [key: string]: any;
}

interface CreateDocumentData {
    [key: string]: any;
}
interface UpdateDocumentData {
    [key: string]: any;
}


export const createDocument = async (collectionName: string, data: CreateDocumentData): Promise<string | undefined> => {
    try {
        const docRef = await addDoc(collection(db, collectionName), data);
        return docRef.id;
    } catch (error) {
        console.error("Document creation error:", error);
        throw error;
    }
};

export const getDocument = async <T extends FirestoreDocWithId = FirestoreDocWithId>(collectionName: string, id: string): Promise<T | null> => {
    try {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as T;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Document get error:", error);
        throw error;
    }
};

export const updateDocument = async (collectionName: string, id: string, data: UpdateDocumentData): Promise<boolean> => {
    try {
        const docRef = doc(db, collectionName, id);
        await updateDoc(docRef, data);
        return true;
    } catch (error) {
        console.error("Document update error:", error);
        throw error;
    }
};

export const deleteDocument = async (collectionName: string, id: string): Promise<boolean> => {
    try {
        const docRef = doc(db, collectionName, id);
        await deleteDoc(docRef);
        return true;
    } catch (error) {
        console.error("Document deletion error:", error);
        throw error;
    }
};

export interface QueryCondition {
    field: string;
    operator: FirebaseWhereFilterOp;
    value: any;
}

const buildQueryConstraints = (
    conditions?: QueryCondition[],
    orderByField?: string,
    orderDirection?: 'asc' | 'desc',
    limitCount?: number
): QueryConstraint[] => {
    const constraints: QueryConstraint[] = [];
    if (conditions) {
        conditions.forEach(condition => {
            constraints.push(where(condition.field, condition.operator, condition.value));
        });
    }
    if (orderByField && orderDirection) {
        constraints.push(orderBy(orderByField, orderDirection));
    }
    if (limitCount && limitCount > 0) {
        constraints.push(firestoreLimit(limitCount));
    }
    return constraints;
};

export const queryDocuments = async <T extends FirestoreDocWithId = FirestoreDocWithId>(
    collectionName: string,
    conditions?: QueryCondition[],
    orderByField?: string,
    orderDirection?: 'asc' | 'desc',
    limitCount?: number
): Promise<T[]> => {
    try {
        const constraints = buildQueryConstraints(conditions, orderByField, orderDirection, limitCount);
        const q = query(collection(db, collectionName), ...constraints);
        const querySnapshots = await getDocs(q);
        return querySnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    } catch (error) {
        console.error("Document query error:", error);
        throw error;
    }
};

export const listenToQuery = <T extends FirestoreDocWithId>(
    collectionName: string,
    onUpdate: (data: T[]) => void,
    onError: (error: Error) => void,
    conditions?: QueryCondition[],
    orderByField?: string,
    orderDirection?: 'asc' | 'desc',
    limitCount?: number
): Unsubscribe => {
    try {
        const constraints = buildQueryConstraints(conditions, orderByField, orderDirection, limitCount);
        const q = query(collection(db, collectionName), ...constraints);

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const documents = querySnapshot.docs.map(doc => (
                { id: doc.id, ...doc.data() } as T
            ));
            onUpdate(documents);
        }, (error) => {
            console.error("Error listening to query: ", error);
            onError(error);
        });

        return unsubscribe;
    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error("Error setting up query listener: ", error);
        onError(error);
        return () => {};
    }
};

export const listenToDocument = <T extends FirestoreDocWithId>(
    collectionName: string,
    documentId: string,
    onUpdate: (data: T | null) => void,
    onError: (error: Error) => void
): Unsubscribe => {
    try {
        const docRef = doc(db, collectionName, documentId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                onUpdate({ id: docSnap.id, ...docSnap.data() } as T);
            } else {
                onUpdate(null); 
            }
        }, (error) => {
            console.error(`Error listening to document ${collectionName}/${documentId}: `, error);
            onError(error);
        });
        return unsubscribe;
    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error(`Error setting up document listener ${collectionName}/${documentId}: `, error);
        onError(error);
        return () => {};
    }
};