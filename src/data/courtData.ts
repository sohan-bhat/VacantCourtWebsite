import { getDocument, queryDocuments } from "../firebase/firestoreSerivce";

export interface SubCourt {
    id: number;
    name: string;
    surface: string;
    status: 'available' | 'in-use' | 'maintenance';
    nextAvailable: string;
}

export interface Court {
    id: string;
    name: string;
    type: string;
    // Summary fields for Dashboard
    available: number;
    total: number;
    location: string;
    // Detailed fields for CourtDetails
    address: string;
    phone: string;
    hours: string;
    amenities: string[];
    courts: SubCourt[];
    description: string;
    images: string[];
    isConfigured: boolean;
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
        return data.isConfigured;
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
            isConfigured: data.isConfigured
        };
    });
};

export const fetchCourtById = async(courtId: string): Promise<Court | null> => {
    const data = await getDocument("Courts", courtId);
    if (data) {
        const court = data as unknown as Court;
        if (!court.isConfigured) {
            return null;
        };
        return court;
    }
    return null;
}

// This object simulates a Firestore-like document store where each key is a document id.
// export const courtsData: Record<string, Court> = {
    //     "courtId_1": {
    //         id: "courtId_1",
    //         name: 'Downtown Tennis Center',
    //         type: 'Tennis',
    //         location: 'XYZ',
    //         address: '123 Main St, Downtown',
    //         phone: '(555) 123-4567',
    //         hours: '6:00 AM - 10:00 PM',
    //         amenities: ['Restrooms', 'Water fountains']
    //         courts: [
    //             { id: 101, name: 'Court 1', surface: 'Hard', status: 'available'},
    //             { id: 102, name: 'Court 2', surface: 'Hard', status: 'available'},
    //             { id: 103, name: 'Court 3', surface: 'Hard', status: 'in-use'},
    //             { id: 104, name: 'Court 4', surface: 'Clay', status: 'in-use'},
    //             { id: 105, name: 'Court 5', surface: 'Clay', status: 'in-use'},
    //             { id: 106, name: 'Court 6', surface: 'Clay', status: 'maintenance'},
    //         ],
    //         description: 'Downtown Tennis Center offers 6 professional-grade tennis courts in the heart of the city. Featuring both hard and clay surfaces, our facility caters to players of all levels.',
    //         images: ['court1.jpg', 'court2.jpg', 'court3.jpg']
    //     },
//     // Additional court documents can be added here.
// };

// Helper export for Dashboard (as an array of summary documents)
// export const dashboardCourts: CourtCardSummary[] = Object.values(courtsData).map(court => ({
//     id: court.id,
//     name: court.name,
//     type: court.type,
//     available: court.available,
//     total: court.total,
//     location: court.location,
// }));