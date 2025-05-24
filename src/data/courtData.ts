import {
    listenToQuery,
    getDocument as getFirestoreDocument,
    listenToDocument
} from "../services/database/firestoreSerivce";
import type { Unsubscribe } from 'firebase/firestore';

export interface SubCourt {
    id: number | string;
    name: string;
    surface: string;
    status: 'available' | 'in-use' | 'maintenance';
    isConfigured: boolean;
    nextAvailable: string;
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
            const displayableComplexes = courtDocs.filter(doc =>
                Array.isArray(doc.courts) && doc.courts.some(subcourt => subcourt.isConfigured)
            );

            const summaries = displayableComplexes.map((courtDoc): CourtCardSummary => {
                const configuredCourts = Array.isArray(courtDoc.courts)
                    ? courtDoc.courts.filter(subcourt => subcourt.isConfigured)
                    : [];

                const availableConfigured = configuredCourts.filter(subcourt => subcourt.status === "available").length;

                return {
                    id: courtDoc.id,
                    name: courtDoc.name,
                    type: courtDoc.type,
                    available: availableConfigured,
                    total: configuredCourts.length,
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
    return data;
};

export const subscribeToCourtById = (
    courtId: string,
    onUpdate: (court: Court | null) => void,
    onError: (error: Error) => void
): Unsubscribe => {
    return listenToDocument<Court>(
        "Courts",
        courtId,
        (courtData) => {
            onUpdate(courtData);
        },
        onError
    );
};