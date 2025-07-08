import {
    listenToQuery,
    getDocument as getFirestoreDocument,
    listenToDocument
} from "../services/firestoreSerivce";
import type { Unsubscribe } from 'firebase/firestore';

export interface SubCourt {
    id: number | string;
    name: string;
    surface: string;
    status: 'available' | 'in-use' | 'maintenance';
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
    latitude?: number;
    longitude?: number;
    ownerId: string;
    lastUpdatedStatus?: number;
}

export interface CourtCardSummary {
    id: string;
    name: string;
    type: string;
    available: number;
    total: number;
    location: string;
    isComplexConfigured: boolean;
    latitude?: number;
    longitude?: number;
    address: string;
    distanceKm?: number;
    lastUpdatedStatus: { seconds: number } | number | null;
}

export const getDistanceFromLatLonInKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6378;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return parseFloat(distance.toFixed(2));
};

const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
};

export const subscribeToCourtsSummary = (
    onUpdate: (courtsSummary: CourtCardSummary[]) => void,
    onError: (error: Error) => void,
    showOnlyConfigured: boolean
): Unsubscribe => {
    return listenToQuery<Court>(
        "Courts",
        (courtDocs) => {
            console.log('[courtData.ts] Received raw court docs:', courtDocs);

            try {
                let complexesToDisplay = courtDocs;

                if (showOnlyConfigured) {
                    complexesToDisplay = courtDocs.filter(doc =>
                        Array.isArray(doc.courts) && doc.courts.some(subcourt => subcourt.isConfigured)
                    );
                }
                
                if (showOnlyConfigured) {
                    console.log('[courtData.ts] Filtered to configured courts:', complexesToDisplay);
                }

                const summaries = complexesToDisplay.map((courtDoc): CourtCardSummary => {
                    const allSubCourts = Array.isArray(courtDoc.courts) ? courtDoc.courts : [];
                    const configuredSubCourts = allSubCourts.filter(subcourt => subcourt.isConfigured);
                    const availableConfiguredSubCourts = configuredSubCourts.filter(subcourt => subcourt.status === "available").length;
                    const complexHasAtLeastOneConfiguredSubCourt = configuredSubCourts.length > 0;

                    if (!courtDoc.id || !courtDoc.name || !courtDoc.type || !courtDoc.location || !courtDoc.address) {
                        console.error('[courtData.ts] A court document is missing required fields!', courtDoc);
                        throw new Error(`Document with id ${courtDoc.id} is missing required fields.`);
                    }

                    return {
                        id: courtDoc.id,
                        name: courtDoc.name,
                        type: courtDoc.type,
                        available: availableConfiguredSubCourts,
                        total: allSubCourts.length,
                        location: courtDoc.location,
                        isComplexConfigured: complexHasAtLeastOneConfiguredSubCourt,
                        latitude: courtDoc.latitude,
                        longitude: courtDoc.longitude,
                        address: courtDoc.address,
                        lastUpdatedStatus: courtDoc.lastUpdatedStatus ?? null
                    };
                });

                console.log('[courtData.ts] Successfully mapped to summaries:', summaries);
                onUpdate(summaries);

            } catch (error) {
                console.error('[courtData.ts] CRITICAL: Error processing court documents. The UI will not update.', error);
                onError(error as Error);
            }
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