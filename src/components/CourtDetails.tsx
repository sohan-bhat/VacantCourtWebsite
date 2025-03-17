import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CourtSchedule from './CourtSchedule';
import { courtsData, Court } from '../data/courtData';
import '../styles/CourtDetails.css';

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
                setCourtDetails(courtsData[Number(id)]);
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

