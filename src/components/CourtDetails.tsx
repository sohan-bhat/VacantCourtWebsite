import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CourtSchedule from './CourtSchedule';
import { Court, subscribeToCourtById } from '../data/courtData';
import EditCourt from './EditCourt';
import '../styles/CourtDetails.css';
import { CircularProgress, IconButton, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

function CourtDetails() {
    const { id } = useParams<{ id: string }>();
    const [courtDetails, setCourtDetails] = useState<Court | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'availability'>('info');
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const [editModalOpen, setEditModalOpen] = useState(false);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            setError("Court ID is missing.");
            setCourtDetails(null);
            return;
        }
        setLoading(true);
        setError(null);
        setCourtDetails(null);
        const unsubscribe = subscribeToCourtById(
            id,
            (fetchedCourt) => {
                setCourtDetails(fetchedCourt);
                setLoading(false);
            },
            (err) => {
                console.error("Failed to subscribe to court details:", err);
                setError("Failed to load court details. Please try again.");
                setLoading(false);
            }
        );
        return () => {
            unsubscribe();
        };
    }, [id]);

    useEffect(() => {
        if (courtDetails && courtDetails.images && courtDetails.images.length > 0) {
            if (selectedImageIndex >= courtDetails.images.length) {
                setSelectedImageIndex(0);
            }
        } else {
            setSelectedImageIndex(0);
        }
    }, [courtDetails]);

    const handleOpenEditModal = () => {
        setEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setEditModalOpen(false);
    };

    if (loading) {
        return <div className="loading"><CircularProgress /></div>;
    }
    if (error) {
        return <div className="error-message">{error}</div>;
    }
    if (!courtDetails) {
        return <div className="error">Court not found or is not currently available.</div>;
    }

    return (
        <>
            <div className="court-details">
                <div className="court-details-header">
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        <Link to="/" className='back-link' style={{ marginRight: '16px' }}>← Back to List</Link>
                        <h2>{courtDetails.name}</h2>
                        <span className="court-type-badge" style={{ marginLeft: '16px' }}>{courtDetails.type}</span>
                    </Box>
                    <IconButton onClick={handleOpenEditModal} color="primary" aria-label="edit court">
                        <EditIcon />
                    </IconButton>
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
                            {courtDetails.images && courtDetails.images.length > 0 ? (
                                <>
                                    <div className="main-image">
                                        <img
                                            src={courtDetails.images[selectedImageIndex]}
                                            alt={`${courtDetails.name} - Image ${selectedImageIndex + 1}`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    </div>
                                    {courtDetails.images.length > 1 && (
                                        <div className="image-thumbnails">
                                            {courtDetails.images.map((image, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => setSelectedImageIndex(index)}
                                                    className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                                                    style={{
                                                        cursor: 'pointer',
                                                        opacity: selectedImageIndex === index ? 1 : 0.6,
                                                        transition: 'opacity 0.3s ease'
                                                    }}
                                                >
                                                    <img
                                                        src={image}
                                                        alt={`${courtDetails.name} thumbnail ${index + 1}`}
                                                        style={{
                                                            width: '100px',
                                                            height: '75px',
                                                            objectFit: 'cover',
                                                            borderRadius: '4px'
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="image-placeholder">No Images Available</div>
                            )}
                        </div>

                        <div className="court-description">
                            {courtDetails.description ?
                                <>
                                    <h3>About</h3>
                                    <p>{courtDetails.description}</p>
                                </>
                                : null
                            }

                            <div className="court-metadata">
                                {courtDetails.location ?
                                    <div className="metadata-item">
                                        <span className="metadata-label"><u>Location Area:</u></span>
                                        <span>{courtDetails.location}</span>
                                    </div>
                                    : null
                                }
                                {courtDetails.address ?
                                    <div className="metadata-item">
                                        <span className="metadata-label"><u>Address:</u></span>
                                        <span>{courtDetails.address}</span>
                                    </div>
                                    : null
                                }
                                {courtDetails.phone ?
                                    <div className="metadata-item">
                                        <span className="metadata-label"><u>Phone:</u></span>
                                        <span>{courtDetails.phone}</span>
                                    </div>
                                    : null
                                }
                                {courtDetails.hours ?
                                    <div className="metadata-item">
                                        <span className="metadata-label"><u>Hours:</u></span>
                                        <span>{courtDetails.hours}</span>
                                    </div>
                                    : null
                                }
                            </div>

                            {courtDetails.amenities && courtDetails.amenities.length > 0 ?
                                <div className="amenities">
                                    <h4>Amenities</h4>
                                    <ul>
                                        {courtDetails.amenities.map((amenity, index) => (
                                            <li key={index}>{amenity}</li>
                                        ))}
                                    </ul>
                                </div>
                                :
                                null
                            }
                        </div>
                    </div>

                    <div className={`court-availability-section ${activeTab === 'availability' ? 'active' : ''}`}>
                        <h3>Court Availability</h3>
                        <CourtSchedule courts={courtDetails.courts}/>
                    </div>
                </div>
            </div>

            {courtDetails && (
                <EditCourt
                    open={editModalOpen}
                    onClose={handleCloseEditModal}
                    court={courtDetails}
                />
            )}
        </>
    );
}

export default CourtDetails;