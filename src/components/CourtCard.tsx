import { Link } from 'react-router-dom';
import '../styles/CourtCard.css';
import { CourtCardSummary } from '../data/courtData';
import { CircularProgress, IconButton } from '@mui/material';
import Notifications from '@mui/icons-material/Notifications';

interface CourtCardProps {
    courts: CourtCardSummary[];
    loading?: boolean;
    isProximityFilteringActive?: boolean;
    maxDistanceKm?: number;
    currentFilterType?: string;
    currentSearchTerm?: string;
}

function CourtCard({
    courts,
    loading,
    isProximityFilteringActive,
    maxDistanceKm,
    currentFilterType,
    currentSearchTerm
}: CourtCardProps) {

    const displayedCourts = courts.filter(court => {
        const matchesType = currentFilterType === 'all' || court.type.toLowerCase() === currentFilterType!.toLowerCase();
        
        const matchesSearch = currentSearchTerm === '' ||
            court.name.toLowerCase().includes(currentSearchTerm!.toLowerCase()) ||
            court.location.toLowerCase().includes(currentSearchTerm!.toLowerCase());

        const passesBasicFilters = matchesType && matchesSearch;

        if (isProximityFilteringActive) {
            return passesBasicFilters &&
                   court.distanceKm !== undefined &&
                   court.distanceKm <= maxDistanceKm!;
        }
        
        return passesBasicFilters;
    });


    let noResultsMessage = "No courts found matching your criteria";

    if (!loading && displayedCourts.length === 0) {
        if (isProximityFilteringActive) {
            noResultsMessage = `No courts found near you. Try adjusting your search or disabling proximity sorting.`;
        } else {
            noResultsMessage = "No courts found matching your current filters.";
        }
    }


    return (
        <div className="court-list">
            {loading ? (
                <div className='no-results'><CircularProgress /></div>
            ) : (
                displayedCourts.length === 0 ? (
                    <div className="no-results">{noResultsMessage}</div>
                ) : (
                    displayedCourts.map(court => (
                        <div key={court.id} className="court-card">
                            <div className="court-info">
                                {court.available > 0 ? (
                                    <h3 className="court-name">
                                        {court.name}
                                    </h3>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                        <h3 className="court-name" style={{ margin: 0, flexGrow: 1 }}>
                                            {court.name}
                                        </h3>
                                        <IconButton
                                            color="warning"
                                            size="small"
                                            sx={{ ml: 1 }}
                                        >
                                            <Notifications />
                                        </IconButton>
                                    </div>
                                )}
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
                )
            )}
        </div>
    );
}

export default CourtCard;