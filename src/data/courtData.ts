export interface SubCourt {
    id: number;
    name: string;
    surface: string;
    status: 'available' | 'in-use' | 'maintenance';
    nextAvailable: string;
}

export interface Court {
    id: number;
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
}

// This object simulates a Firestore-like document store where each key is a document id.
export const courtsData: Record<string, Court> = {
    1: {
        id: 1,
        name: 'Downtown Tennis Center',
        type: 'Tennis',
        available: 3,
        total: 6,
        location: 'Downtown',
        address: '123 Main St, Downtown',
        phone: '(555) 123-4567',
        hours: '6:00 AM - 10:00 PM',
        amenities: ['Restrooms', 'Water fountains', 'Pro shop', 'Changing rooms'],
        courts: [
            { id: 101, name: 'Court 1', surface: 'Hard', status: 'available', nextAvailable: 'N/A' },
            { id: 102, name: 'Court 2', surface: 'Hard', status: 'available', nextAvailable: 'N/A' },
            { id: 103, name: 'Court 3', surface: 'Hard', status: 'in-use', nextAvailable: 'N/A' },
            { id: 104, name: 'Court 4', surface: 'Clay', status: 'in-use', nextAvailable: 'N/A' },
            { id: 105, name: 'Court 5', surface: 'Clay', status: 'in-use', nextAvailable: 'N/A' },
            { id: 106, name: 'Court 6', surface: 'Clay', status: 'maintenance', nextAvailable: 'N/A' },
        ],
        description: 'Downtown Tennis Center offers 6 professional-grade tennis courts in the heart of the city. Featuring both hard and clay surfaces, our facility caters to players of all levels.',
        images: ['court1.jpg', 'court2.jpg', 'court3.jpg']
    },
    // Additional court documents can be added here.
};

// Helper export for Dashboard (as an array of summary documents)
export const mockCourts = Object.values(courtsData).map(court => ({
    id: court.id,
    name: court.name,
    type: court.type,
    available: court.available,
    total: court.total,
    location: court.location,
}));