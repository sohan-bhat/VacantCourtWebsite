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
    limit,
    FieldValue,
    WhereFilterOp
} from 'firebase/firestore';
import { db } from './config';

// Create a new document
interface DocumentData {
    [key: string]: FieldValue | Partial<unknown> | undefined;
}


export const createDocument = async (collectionName: string, data: DocumentData): Promise<string | undefined> => {
    try {
        const docRef = await addDoc(collection(db, collectionName), data);
        return docRef.id;
    } catch (error) {
        console.error("Document creation error:", error);
        throw error;
    }
}

// Get a document
export const getDocument = async (collectionName: string, id: string): Promise<DocumentData | null> => {
    try {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Document get error:", error);
        throw error;
    }
}

// Update a document
export const updateDocument = async (collectionName: string, id: string, data: DocumentData): Promise<boolean | null> => {
    try {
        const docRef = doc(db, collectionName, id);
        await updateDoc(docRef, data);
        return true;
    } catch (error) {
        console.error("Document update error:", error);
        throw error;
    }
}

// Delete a document
export const deleteDocument = async (collectionName: string, id: string): Promise<boolean | null> => {
    try {
        const docRef = doc(db, collectionName, id);
        await deleteDoc(docRef);
        return true;
    } catch (error) {
        console.error("Document deletion error:", error);
        throw error;
    }
}

// Query documents

interface QueryCondition {
    field: string;
    operator: WhereFilterOp;
    value: string | number | boolean | null | Date;
}

export const queryDocuments = async (collectionName: string, conditions: QueryCondition[], orderByField: string, orderDirection: 'asc' | 'desc', limitCount: number): Promise<Array<DocumentData> | null> => {
    try {
        let q = query(collection(db, collectionName));

        // Add where conditions
        if (conditions.length > 0) {
            conditions.forEach(condition => {
                q = query(q, where(condition.field, condition.operator, condition.value));
            });
        }

        // Add orderBy
        if (orderByField) {
            q = query(q, orderBy(orderByField, orderDirection));
        }
        
        // Add limit
        if (limitCount > 0) {
            q = query(q, limit(limitCount));
        }

        const querySnapshots = await getDocs(q);
        const documents: DocumentData[] = [];

        querySnapshots.forEach((doc) => {
            documents.push({ id: doc.id, ...doc.data() });
        })

        return documents;
    } catch (error) {
        console.error("Document query error:", error);
        throw error;
    }
};