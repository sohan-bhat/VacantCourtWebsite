import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/CourtCard.css';
import { CourtSummary } from '../data/courtData';

// interface Court {
//   id: number;
//   name: string;
//   type: string;
//   location: string;
//   available: number;
//   total: number;
// }

interface CourtListProps {
  courts: CourtSummary[];
}

function CourtList({ courts }: CourtListProps) {
  return (
    <div className="court-list">
      {courts.length === 0 ? (
        <div className="no-results">No courts found matching your criteria</div>
      ) : (
        courts.map(court => (
          <div key={court.id} className="court-card">
            <div className="court-info">
              <h3>{court.name}</h3>
              <p className="court-type">{court.type}</p>
              <p className="court-location">{court.location}</p>
              <div className="availability-indicator">
                <span className={`availability-status ${court.available > 0 ? 'available' : 'unavailable'}`}>
                  {court.available > 0 ? 'Available' : 'Unavailable'}
                </span>
                <span className="court-count">{court.available} / {court.total} courts</span>
              </div>
            </div>
            <div className="court-actions">
              <Link to={`/court/${court.id}`} className="view-details">View Details</Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default CourtList;