import { useState, useEffect, useCallback } from 'react';
import CourtCard from '../courts/CourtCard';
import CourtMap from '../courts/CourtMap';
import FilterControls from './FilterControls';
import SearchBar from './SearchBar';
import '../../styles/Dashboard.css';
import { subscribeToCourtsSummary, CourtCardSummary, getDistanceFromLatLonInKm } from '../../data/courtData';
import {
    Button,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Tooltip,
    IconButton,
    useTheme,
    useMediaQuery,
    Switch,
    FormControlLabel,
    Stack
} from '@mui/material';
import LocationDisabledIcon from '@mui/icons-material/LocationDisabled';
import LocationOn from '@mui/icons-material/LocationOn'
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { toast } from 'react-toastify';

const MAX_DISTANCE_KM = 40;

function Dashboard() {
    const [courts, setCourts] = useState<CourtCardSummary[]>([]);
    const [viewMode, setViewMode] = useState('list');
    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [geolocationStatus, setGeolocationStatus] = useState<'idle' | 'pending' | 'granted' | 'denied' | 'error'>('idle');
    const [showGeolocationDialog, setShowGeolocationDialog] = useState(false);

    const [isLocationFilteringEnabled, setIsLocationFilteringEnabled] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        setLoading(true);
        setError(null);
        const unsubscribe = subscribeToCourtsSummary(
            (fetchedCourts) => {
                setCourts(fetchedCourts);
                setLoading(false);
            },
            (err) => {
                console.error(err);
                setError("Failed to load court data. Please try again later.");
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, []);

    const initiateGeolocation = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                    setGeolocationStatus('granted');
                    setIsLocationFilteringEnabled(true);
                },
                (geoError) => {
                    setUserLocation(null);
                    setIsLocationFilteringEnabled(false);
                    const status = geoError.code === geoError.PERMISSION_DENIED ? 'denied' : 'error';
                    setGeolocationStatus(status);
                    if (status === 'error') {
                        toast.error('Failed to get your location. Please try again.');
                    }
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            setGeolocationStatus('error');
            setIsLocationFilteringEnabled(false);
            toast.error('Geolocation is not supported by your browser.');
        }
    }, []);

    const handleGeolocationIconClick = () => {
        if (geolocationStatus === 'pending') {
            return;
        } else if (geolocationStatus === 'granted') {
            initiateGeolocation();
        } else {
            setShowGeolocationDialog(true);
        }
    };

    const handleAllowLocation = () => {
        setShowGeolocationDialog(false);
        initiateGeolocation();
    };

    const handleDenyLocation = () => {
        setShowGeolocationDialog(false);
        setGeolocationStatus('denied');
        setIsLocationFilteringEnabled(false);
    };

    const handleLocationFilterToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsLocationFilteringEnabled(event.target.checked);
        if (event.target.checked) {
            if (geolocationStatus === 'granted') {
                initiateGeolocation();
            }
        }
    };

    const processedCourts = courts.map(court => {
        let distanceKmCalculated: number | undefined;
        if (userLocation && court.latitude !== undefined && court.longitude !== undefined) {
            distanceKmCalculated = getDistanceFromLatLonInKm(
                userLocation.latitude,
                userLocation.longitude,
                court.latitude,
                court.longitude
            );
        }
        return {
            ...court,
            distanceKm: distanceKmCalculated,
        };
    }).sort((a, b) => {
        if (isLocationFilteringEnabled && geolocationStatus === 'granted' && a.distanceKm !== undefined && b.distanceKm !== undefined) {
            return a.distanceKm - b.distanceKm;
        }
        return a.name.localeCompare(b.name);
    });

    const getGeolocationControlUI = () => {
        let element;
        let tooltipTitle = '';
        let iconColor: 'primary' | 'inherit' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'primary';

        switch (geolocationStatus) {
            case 'granted':
                return (
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isLocationFilteringEnabled}
                                onChange={handleLocationFilterToggle}
                                color="success"
                                disabled={false}
                            />
                        }
                        label={
                            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mr: 1 }}>
                                {isMobile ? null : <LocationOn color="success" sx={{ fontSize: '1.1rem' }} />}
                                <Typography
                                    variant="body2"
                                    sx={{
                                        whiteSpace: 'nowrap',
                                        fontWeight: 500,
                                        color: isLocationFilteringEnabled ? theme.palette.success.main : theme.palette.text.secondary,
                                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                    }}
                                >
                                    Proximity
                                </Typography>
                            </Stack>
                        }
                        sx={{
                            mr: { xs: 0, sm: 1 },
                            ml: { xs: 1, sm: 0 },

                            border: `1px solid ${isLocationFilteringEnabled ? theme.palette.success.light : theme.palette.grey[300]}`,
                            borderRadius: theme.shape.borderRadius,
                            py: 0.5,
                            px: 1,
                            bgcolor: isLocationFilteringEnabled ? theme.palette.success.light + '1A' : theme.palette.grey[100],
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                cursor: 'pointer',
                                bgcolor: isLocationFilteringEnabled ? theme.palette.success.light + '33' : theme.palette.grey[200],
                            },
                        }}
                    />
                );
            case 'pending':
                tooltipTitle = 'Locating you...';
                iconColor = 'primary';
                element = <CircularProgress size={20} color="inherit" />;
                break;
            case 'denied':
            case 'error':
                tooltipTitle = 'Location unavailable. Click to enable.';
                iconColor = 'error';
                element = <LocationDisabledIcon />;
                break;
            case 'idle':
            default:
                tooltipTitle = 'Find courts near your location.';
                iconColor = 'inherit';
                element = <MyLocationIcon />;
                break;
        }

        return (
            <Tooltip title={tooltipTitle}>
                <span>
                    <IconButton
                        onClick={handleGeolocationIconClick}
                        color={iconColor}
                        disabled={geolocationStatus === 'pending'}
                        aria-label={tooltipTitle}
                        sx={{ ml: { xs: 1, sm: 2 } }}
                    >
                        {element}
                    </IconButton>
                </span>
            </Tooltip>
        );
    };

    if (error) {
        return <div className="dashboard-error">{error}</div>;
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h2>Find Available Courts Near You!</h2>
                <div className="dashboard-header-controls">
                    <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                    {getGeolocationControlUI()}
                </div>
            </div>

            <FilterControls
                filterType={filterType}
                setFilterType={setFilterType}
                viewMode={viewMode}
                setViewMode={setViewMode}
            />

            {viewMode === 'list' ? (
                <CourtCard
                    courts={processedCourts}
                    loading={loading}
                    isProximityFilteringActive={isLocationFilteringEnabled && geolocationStatus === 'granted'}
                    maxDistanceKm={MAX_DISTANCE_KM}
                    currentFilterType={filterType}
                    currentSearchTerm={searchTerm}
                />
            ) : (
                <CourtMap 
                    courts={processedCourts} 
                    userLocation={userLocation}
                    isProximityFilteringActive={isLocationFilteringEnabled && geolocationStatus === 'granted'}
                />
            )}

            <Dialog
                open={showGeolocationDialog}
                onClose={() => setShowGeolocationDialog(false)}
                maxWidth="sm"
                fullWidth
                fullScreen={isMobile}
                PaperProps={{ sx: { borderRadius: isMobile ? 0 : 2 } }}
            >
                <DialogTitle sx={{ bgcolor: '#1e3a8a', color: 'white', py: 2 }}>
                    Find Courts Near You
                </DialogTitle>
                <DialogContent sx={{ p: { xs: 2, sm: 3 }, pt: { xs: '15px !important', sm: '20px !important' } }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Allow access to your location to see the closest courts first.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        This will allow us to sort available courts by their proximity to you, putting the closest options first. Your location data is used only for this purpose and is not stored on our servers.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'grey.50', flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
                    <Button
                        onClick={handleDenyLocation}
                        variant="outlined"
                        sx={{
                            mr: { sm: 1 }, width: { xs: '100%', sm: 'auto' }, borderColor: '#1e3a8a', color: '#1e3a8a',
                            '&:hover': { borderColor: '#1e3a8a', bgcolor: 'rgba(30, 58, 138, 0.04)' }
                        }}
                    >
                        No Thanks
                    </Button>
                    <Button
                        onClick={handleAllowLocation}
                        variant="contained"
                        sx={{
                            px: 4, width: { xs: '100%', sm: 'auto' }, bgcolor: '#28a745',
                            '&:hover': { bgcolor: '#228d3c' }
                        }}
                    >
                        Allow Location
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Dashboard;