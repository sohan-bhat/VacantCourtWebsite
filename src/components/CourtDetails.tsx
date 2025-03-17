import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CourtSchedule from './CourtSchedule';
import '../styles/CourtDetails.css';

interface Court {
    id: number;
    name: string;
    type: string;
    address: string;
    phone: string;
    hours: string;
    amenities: string[];
    courts: { id: number; name: string; surface: string; status: 'available' | 'in-use' | 'maintenance'; nextAvailable: string }[];
    description: string;
    images: string[];
}

// Mock data (replace with API calls to your backend)
const mockCourtDetails: Record<number, Court> = {
    1: {
        id: 1,
        name: 'Downtown Tennis Center',
        type: 'Tennis',
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
    // Other court details would be here
};

function CourtDetails() {
    const { id } = useParams();

    const [courtDetails, setCourtDetails] = useState<Court | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState<'info' | 'availability'>('info');

    useEffect(() => {
        // Replace with your API call
        setTimeout(() => {
            if (id) {
                setCourtDetails(mockCourtDetails[Number(id)]);
            }
            setLoading(false);
        }, 500);
    }, [id]);

    if (loading) {
        return <div className="loading">Loading court details...</div>;
    }

    if (!courtDetails) {
        return <div className="error">Court not found</div>;
    }

    // Format date for display
    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    // Generate dates for the next 7 days
    const nextDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        return date;
    });

    return (
        <div className="court-details">
            <div className="court-details-header">
                <Link to="/" className="back-link">← Back to List</Link>
                <h2>{courtDetails.name}</h2>
                <span className="court-type-badge">{courtDetails.type}</span>
            </div>

            <div className="mobile-tabs">
                <button
                    className={activeTab === 'info' ? 'active' : ''}
                    onClick={() => setActiveTab('info')}
                >
                    Information
                </button>
                <button
                    className={activeTab === 'availability' ? 'active' : ''}
                    onClick={() => setActiveTab('availability')}
                >
                    Availability
                </button>
            </div>

            <div className="court-details-content">
                <div className={`court-info-section ${activeTab === 'info' ? 'active' : ''}`}>
                    <div className="court-images">
                        <div className="main-image">
                            <div className="image-placeholder">Court Image</div>
                        </div>
                        <div className="image-thumbnails">
                            {courtDetails.images.map((img, index) => (
                                <div key={index} className="thumbnail-placeholder">Thumbnail</div>
                            ))}
                        </div>
                    </div>

                    <div className="court-description">
                        <h3>About</h3>
                        <p>{courtDetails.description}</p>

                        <div className="court-metadata">
                            <div className="metadata-item">
                                <span className="metadata-label">Address:</span>
                                <span>{courtDetails.address}</span>
                            </div>
                            <div className="metadata-item">
                                <span className="metadata-label">Phone:</span>
                                <span>{courtDetails.phone}</span>
                            </div>
                            <div className="metadata-item">
                                <span className="metadata-label">Hours:</span>
                                <span>{courtDetails.hours}</span>
                            </div>
                        </div>

                        <div className="amenities">
                            <h4>Amenities</h4>
                            <ul>
                                {courtDetails.amenities.map((amenity, index) => (
                                    <li key={index}>{amenity}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className={`court-availability-section ${activeTab === 'availability' ? 'active' : ''}`}>
                    <h3>Court Availability</h3>

                    <div className="date-selector">
                        {nextDays.map((date, index) => (
                            <button
                                key={index}
                                className={selectedDate.toDateString() === date.toDateString() ? 'date-button active' : 'date-button'}
                                onClick={() => setSelectedDate(date)}
                            >
                                {formatDate(date)}
                            </button>
                        ))}
                    </div>

                    <CourtSchedule courts={courtDetails.courts} date={formatDate(selectedDate)} />
                </div>
            </div>
        </div>
    );
}

export default CourtDetails;

