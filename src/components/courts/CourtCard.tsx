import { Link } from 'react-router-dom';
import '../../styles/courts/CourtCard.css';
import { CourtCardSummary } from '../../data/courtData';
import { CircularProgress, IconButton, Tooltip } from '@mui/material';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest'
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
                        <div key={court.id} className={`court-card ${!court.isComplexConfigured ? 'court-card-unconfigured' : ''}`}>
                            <div className="court-info">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                    <h3 className="court-name" style={{ margin: '0 0 10px 0', flexGrow: 1, opacity: court.isComplexConfigured ? 1 : 0.7 }}>
                                        {court.name}
                                    </h3>
                                    {court.isComplexConfigured && court.available === 0 && (
                                        <Tooltip title="Notify when available (feature coming soon!)">
                                            <IconButton color="warning" size="small" sx={{ ml: 1 }} >
                                                <Notifications />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    {!court.isComplexConfigured && (
                                        <Tooltip title="This facility's courts are not yet configured in the system.">
                                            <SettingsSuggestIcon color="disabled" sx={{mb: 1.5}} />
                                        </Tooltip>
                                    )}
                                </div>
                                
                                <p className="court-type" style={{ opacity: court.isComplexConfigured ? 1 : 0.7 }}>{court.type}</p>
                                <p className="court-location" style={{ opacity: court.isComplexConfigured ? 1 : 0.7 }}>{court.location}</p>

                                <div className="availability-indicator">
                                    {!court.isComplexConfigured ? (
                                        <>
                                            <span className={`availability-status unconfigured`}>
                                                Not Configured
                                            </span>
                                            <span className="court-count unconfigured-count">
                                                ({court.total} total courts)
                                            </span>
                                        </>
                                    ) : court.available > 0 ? (
                                        <>
                                            <span className={`availability-status available`}>
                                                Available
                                            </span>
                                            <span className="court-count">{court.available} / {court.total} courts</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className={`availability-status unavailable`}>
                                                Unavailable
                                            </span>
                                            <span className="court-count">{court.available} / {court.total} courts</span>
                                        </>
                                    )}
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