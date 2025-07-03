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
    Button,
    Box,
    Paper,
    RadioGroup,
    FormControlLabel,
    Radio,
    TextField,
    Typography,
    Chip,
    FormControl,
    FormLabel
} from '@mui/material';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest'
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import toast from 'react-hot-toast';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';

import { MuiTelInput, matchIsValidTel } from 'mui-tel-input';

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
    const [notificationMethod, setNotificationMethod] = useState('email');
    const [phoneNumber, setPhoneNumber] = useState('');

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
        if (notificationMethod === 'email') {
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
        } else if (notificationMethod === 'sms') {
            const isValid = matchIsValidTel(phoneNumber);
            if (!isValid) {
                toast.error("Please enter a valid phone number.");
                return;
            }
            setConfirmModalOpen(false);
            toast.success(`SMS notifications are in development. We've noted your interest for ${phoneNumber}!`);
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

            <Dialog open={isConfirmModalOpen} onClose={() => setConfirmModalOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Set Availability Notification</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <DialogContentText>
                            Choose how you'd like to be notified when a court at <strong>{court.name}</strong> becomes available.
                        </DialogContentText>

                        <FormControl>
                            <RadioGroup
                                aria-labelledby="notification-method-group-label"
                                value={notificationMethod}
                                onChange={(e) => setNotificationMethod(e.target.value)}
                                name="notification-method-group"
                            >
                                <Paper
                                    variant="outlined"
                                    sx={{ p: 2, mb: 2, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 1.5, borderColor: notificationMethod === 'email' ? 'primary.main' : 'rgba(0, 0, 0, 0.23)' }}
                                    onClick={() => setNotificationMethod('email')}
                                >
                                    <FormControlLabel value="email" control={<Radio />} label={
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>Email Notification</Typography>
                                        </Box>
                                    } />
                                    <TextField
                                        fullWidth
                                        disabled
                                        id="email-display"
                                        label="Your Email"
                                        defaultValue={currentUser?.email}
                                        variant="outlined"
                                        size="small"
                                    />
                                </Paper>
                                <Tooltip title="SMS notifications are coming soon!">
                                    <span>
                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                p: 2,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1.5,
                                                borderColor: 'rgba(0, 0, 0, 0.23)',
                                                opacity: 0.6
                                            }}
                                        >
                                            <FormControlLabel
                                                disabled
                                                value="sms"
                                                control={<Radio />}
                                                label={
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <SmsIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>SMS Notification</Typography>
                                                    </Box>
                                                }
                                            />
                                            <MuiTelInput
                                                disabled
                                                fullWidth
                                                size="small"
                                                label="Your Phone Number"
                                                defaultCountry="US"
                                                value={phoneNumber}
                                                onChange={(newPhone) => setPhoneNumber(newPhone)}
                                            />
                                        </Paper>
                                    </span>
                                </Tooltip>

                            </RadioGroup>
                        </FormControl>
                        <DialogContentText variant="caption" sx={{ textAlign: 'center', mt: 1 }}>
                            Note: There may be a 1-3 minute delay after a court becomes available.
                        </DialogContentText>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: '16px 24px' }}>
                    <Button onClick={() => setConfirmModalOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleSubscribe}
                        variant="contained"
                        autoFocus
                    >
                        Set Notification
                    </Button>
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