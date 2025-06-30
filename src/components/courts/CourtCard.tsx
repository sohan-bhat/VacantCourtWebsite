import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/courts/CourtCard.css';
import { CourtCardSummary } from '../../data/courtData';
import {
    CircularProgress,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button
} from '@mui/material';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest'
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import toast from 'react-hot-toast';

import { useAuth } from '../auth/AuthContext';
import { addNotificationRequest, getNotificationRequestForUser, removeNotificationRequest } from '../../services/notificationService';


interface NotificationButtonProps {
    court: CourtCardSummary;
}

function NotificationButton({ court }: NotificationButtonProps) {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    type NotificationState = 'idle' | 'loading' | 'subscribed' | 'error';
    const [state, setState] = useState<NotificationState>('loading');
    const [requestId, setRequestId] = useState<string | null>(null);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);

    useEffect(() => {
        if (!currentUser) {
            setState('idle');
            return;
        }

        let isMounted = true;
        setState('loading');

        getNotificationRequestForUser(court.id, currentUser.uid)
            .then(existingRequestId => {
                if (isMounted) {
                    if (existingRequestId) {
                        setRequestId(existingRequestId);
                        setState('subscribed');
                    } else {
                        setState('idle');
                    }
                }
            })
            .catch(() => {
                if (isMounted) setState('error');
            });

        return () => { isMounted = false; };
    }, [currentUser, court.id]);

    const handleBellClick = () => {
        if (!currentUser) {
            setAuthModalOpen(true);
        } else if (state === 'idle') {
            setConfirmModalOpen(true);
        } else if (state === 'subscribed') {
            handleUnsubscribe();
        }
    };

    const handleSubscribe = async () => {
        if (!currentUser || !currentUser.email) {
            toast.error("Your email is not available. Cannot subscribe.");
            return;
        }
        setConfirmModalOpen(false);
        setState('loading');
        try {
            const newRequestId = await addNotificationRequest(
                court.id,
                court.name,
                currentUser.uid,
                currentUser.email
            );
            setRequestId(newRequestId);
            setState('subscribed');
            toast.success(`You'll be notified for ${court.name}!`);
        } catch {
            setState('error');
            toast.error('Could not set notification. Please try again.');
        }
    };

    const handleUnsubscribe = async () => {
        if (!requestId) return;
        setState('loading');
        try {
            await removeNotificationRequest(requestId);
            setRequestId(null);
            setState('idle');
            toast.success('Notification cancelled.');
        } catch {
            setState('error');
            toast.error('Could not cancel notification. Please try again.');
        }
    };

    const getTooltipText = () => {
        switch (state) {
            case 'subscribed': return 'You are subscribed. Click to cancel notification.';
            case 'loading': return 'Loading...';
            case 'error': return 'An error occurred. Please refresh.';
            default: return 'Notify me when a court becomes available.';
        }
    };

    return (
        <>
            <Tooltip title={getTooltipText()}>
                <span>
                    <IconButton
                        color={state === 'subscribed' ? 'primary' : 'warning'}
                        size="small"
                        onClick={handleBellClick}
                        disabled={state === 'loading' || state === 'error'}
                        sx={{ ml: 1 }}
                    >
                        {state === 'loading' && <CircularProgress size={20} color="inherit" />}
                        {state === 'idle' && <NotificationsIcon />}
                        {state === 'subscribed' && <NotificationsActiveIcon />}
                        {state === 'error' && <NotificationsIcon color="error" />}
                    </IconButton>
                </span>
            </Tooltip>

            <Dialog open={isConfirmModalOpen} onClose={() => setConfirmModalOpen(false)}>
                <DialogTitle>Confirm Notification</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Do you want to be notified by email when a court at <i>{court.name}</i> becomes available?
                    </DialogContentText>
                    <DialogContentText color="inherit" noWrap>
                        &nbsp;
                    </DialogContentText>
                    <DialogContentText>
                        <strong>Note:</strong> there is a 1-5min delay to notify you after the facility becomes available.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubscribe} color="primary" autoFocus>Yes, Notify Me</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isAuthModalOpen} onClose={() => setAuthModalOpen(false)}>
                <DialogTitle>Sign Up for Notifications</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please sign up or log in to receive notifications when courts become available.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAuthModalOpen(false)}>Cancel</Button>
                    <Button onClick={() => navigate('/auth')} color="primary" autoFocus>Sign Up / Login</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

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
                                        <NotificationButton court={court} />
                                    )}

                                    {!court.isComplexConfigured && (
                                        <Tooltip title="This facility's courts are not yet configured in the system.">
                                            <SettingsSuggestIcon color="disabled" sx={{ mb: 1.5 }} />
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