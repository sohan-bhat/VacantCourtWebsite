import { listenToQuery, getDocument as getFirestoreDocument, listenToDocument } from "../services/database/firestoreSerivce";
import type { Unsubscribe } from 'firebase/firestore';

export interface SubCourt {
    id: number;
    name: string;
    surface: string;
    status: 'available' | 'in-use' | 'maintenance';
    nextAvailable: string;
    isConfigured: boolean;
}

export interface Court {
    id: string;
    name: string;
    type: string;
    location: string;
    address: string;
    phone: string;
    hours: string;
    amenities: string[];
    courts: SubCourt[];
    description: string;
    images: string[];
}

export interface CourtCardSummary {
    id: string;
    name: string;
    type: string;
    available: number;
    total: number;
    location: string;
    isConfigured: boolean;
}

export const subscribeToCourtsSummary = (
    onUpdate: (courtsSummary: CourtCardSummary[]) => void,
    onError: (error: Error) => void
): Unsubscribe => {
    return listenToQuery<Court>(
        "Courts",
        (courtDocs) => {
            const configuredDocs = courtDocs.filter(doc =>
                Array.isArray(doc.courts) && doc.courts.every(subcourt => subcourt.isConfigured)
            );

            const summaries = configuredDocs.map((courtDoc): CourtCardSummary => {
                const available = Array.isArray(courtDoc.courts)
                    ? courtDoc.courts.filter(subcourt => subcourt.status === "available").length
                    : 0;
                const total = Array.isArray(courtDoc.courts) ? courtDoc.courts.length : 0;

                return {
                    id: courtDoc.id,
                    name: courtDoc.name,
                    type: courtDoc.type,
                    available,
                    total,
                    location: courtDoc.location,
                    isConfigured: true,
                };
            });
            onUpdate(summaries);
        },
        onError,
        [],
        "name",
        "asc",
        undefined
    );
};

export const fetchCourtById = async (courtId: string): Promise<Court | null> => {
    const data = await getFirestoreDocument<Court>("Courts", courtId);
    if (data) {
        if (!Array.isArray(data.courts) || !data.courts.every(subcourt => subcourt.isConfigured)) {
            return null;
        }
        return data;
    }
    return null;
};

export const subscribeToCourtById = (
    courtId: string,
    onUpdate: (court: Court | null) => void,
    onError: (error: Error) => void
): Unsubscribe => {
    type ListenToDocumentHandler<T> = (data: T | null) => void;
    type ErrorHandler = (error: Error) => void;

        return listenToDocument<Court>(
            "Courts",
            courtId,
            (courtData: Court | null): void => { 
                if (courtData) {
                    if (!Array.isArray(courtData.courts) || !courtData.courts.every((subcourt: SubCourt): boolean => subcourt.isConfigured)) {
                        onUpdate(null); 
                        return;
                    }
                }
                onUpdate(courtData); 
            },
            onError
        );
};