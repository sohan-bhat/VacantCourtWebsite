import { Link } from 'react-router-dom';
import '../styles/CourtCard.css';
import { CourtCardSummary } from '../data/courtData';
import { CircularProgress } from '@mui/material'

interface CourtCardProps {
    courts: CourtCardSummary[];
    loading?: boolean
}

function CourtCard({ courts, loading }: CourtCardProps) {
    return (
        <div className="court-list">
            {loading ? (
                <div className='no-results'><CircularProgress /></div>
            ) : (
                (
                    courts.length === 0 ? (
                        <div className="no-results">No courts found matching your criteria</div>
                    ) : (
                        courts.map(court => (      
                            court.isConfigured ? (
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
                            )
                            : null
                        ))
                    )
                )
            )}
        </div>
    );
}

export default CourtCard;