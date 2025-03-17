import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/CourtMap.css';
import { CourtCardSummary } from '../data/courtData';

interface CourtMapProps {
    courts: CourtCardSummary[];
}

function CourtMap({ courts }: CourtMapProps) {
    return (
        <div className="court-map-container">
            <div className="map-placeholder">
                <p>Interactive map would be displayed here</p>
                <p>Integration with Google Maps or similar service</p>
            </div>
            <div className="map-court-list">
                {courts.map(court => (
                    <div key={court.id} className="map-court-item">
                        <h4>{court.name}</h4>
                        <p>{court.available} courts available</p>
                        <Link to={`/court/${court.id}`}>Details</Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CourtMap;