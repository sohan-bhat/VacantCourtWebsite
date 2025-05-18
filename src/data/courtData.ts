import { getDocument, queryDocuments } from "../services/database/firestoreSerivce";

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


export const fetchCourts = async(): Promise<CourtCardSummary[]> => {
    const documents = await queryDocuments("Courts", [], "name", "asc", 0);
    if(!documents) return [];

    const configuredDocs = documents.filter((doc) => {
        const data = doc as unknown as Court;
        return data.courts.every(subcourt => subcourt.isConfigured);
    })

    return configuredDocs.map((doc) => {
        const data = doc as unknown as Court
        const available = data.courts.filter(subcourt => subcourt.status === "available").length;
        return {
            id: data.id,
            name: data.name,
            type: data.type,
            available,
            total: data.courts.length,
            location: data.location,
            isConfigured: data.courts.every(subcourt => subcourt.isConfigured) // Update this
        };
    });
};

export const fetchCourtById = async(courtId: string): Promise<Court | null> => {
    const data = await getDocument("Courts", courtId);
    if (data) {
        const court = data as unknown as Court;
        if (!court.courts.every(subcourt => subcourt.isConfigured)) {
            return null;
        };
        return court;
    }
    return null;
}