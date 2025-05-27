import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import CourtSchedule from './CourtSchedule';
import { Court, subscribeToCourtById } from '../../data/courtData';
import EditCourt from './EditCourt';
import '../../styles/CourtDetails.css';
import {
    CircularProgress,
    IconButton,
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Button,
    useTheme,
    useMediaQuery,
    Grow,
    alpha
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PlaceIcon from '@mui/icons-material/Place';
import DirectionsIcon from '@mui/icons-material/Directions';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';


interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
    isMobile: boolean;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, isMobile, ...other } = props;

    if (isMobile) {
        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                {value === index && (
                    <Box sx={{ p: 0 }}>
                        {children}
                    </Box>
                )}
            </div>
        );
    }
    return <Box sx={{ p: 0 }}>{children}</Box>;
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}


function CourtDetails() {
    const { id } = useParams<{ id: string }>();
    const [courtDetails, setCourtDetails] = useState<Court | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(0);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const [editModalOpen, setEditModalOpen] = useState(false);

    const theme = useTheme();
    const isMobileView = useMediaQuery(theme.breakpoints.down('md'));

    const imagePanelRef = useRef<HTMLDivElement>(null);
    const detailsPanelRef = useRef<HTMLDivElement>(null);
    const [panelsMinHeight, setPanelsMinHeight] = useState<number | 'auto'>('auto');

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
    }, [courtDetails, selectedImageIndex]);


    useEffect(() => {
        if (!isMobileView && imagePanelRef.current && detailsPanelRef.current) {
            const imageHeight = imagePanelRef.current.scrollHeight;
            const detailsHeight = detailsPanelRef.current.scrollHeight;
            setPanelsMinHeight(Math.max(imageHeight, detailsHeight));
        } else {
            setPanelsMinHeight('auto');
        }
    }, [courtDetails, isMobileView, activeTab]);

    const handleOpenEditModal = () => {
        setEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setEditModalOpen(false);
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleImageNav = (direction: 'prev' | 'next') => {
        if (!courtDetails?.images || courtDetails.images.length === 0) return;
        const totalImages = courtDetails.images.length;
        if (direction === 'next') {
            setSelectedImageIndex((prevIndex) => (prevIndex + 1) % totalImages);
        } else {
            setSelectedImageIndex((prevIndex) => (prevIndex - 1 + totalImages) % totalImages);
        }
    };

    const getDirectionsLink = () => {
        if (courtDetails?.address) {
            return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(courtDetails.address)}`;
        } else if (courtDetails?.latitude && courtDetails?.longitude) {
            return `https://www.google.com/maps/dir/?api=1&destination=${courtDetails.latitude},${courtDetails.longitude}`;
        }
        return '#';
    };


    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
    }
    if (error) {
        return <Box sx={{ textAlign: 'center', mt: 4, color: 'error.main' }}>{error}</Box>;
    }
    if (!courtDetails) {
        return <Box sx={{ textAlign: 'center', mt: 4, color: 'error.main' }}>Court not found or is not currently available.</Box>;
    }

    return (
        <>
            <Box className="court-details-page-container">
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    mb: { xs: 2, md: 3 },
                    gap: { xs: 1, md: 1.5 }
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, minWidth: 0 }}>
                        <Link to="/" style={{ textDecoration: 'none' }}>
                            <IconButton color="primary" sx={{ p: 0.5 }}>
                                <ArrowBackIcon />
                            </IconButton>
                        </Link>
                        {!isMobileView ?
                            <Typography variant="h4" component="h2" sx={{
                                ml: { xs: 1, sm: 2 },
                                color: 'primary.dark',
                                fontWeight: 700,
                                flexShrink: 1,
                                minWidth: 0,
                                wordBreak: 'break-word',
                                fontSize: '1.8rem',
                                fontFamily: 'Poppins'
                            }}>
                                {courtDetails.name}
                            </Typography>
                            :
                            <Typography variant="h4" component="h2" sx={{
                                ml: { xs: 1, sm: 2 },
                                color: 'primary.dark',
                                fontWeight: 700,
                                flexShrink: 1,
                                minWidth: 0,
                                wordBreak: 'break-word',
                                fontSize: '1.3rem',
                                fontFamily: 'Poppins'
                            }}>
                                {courtDetails.name}
                            </Typography>

                        }
                        {!isMobileView ?
                            <Box sx={{
                                ml: { xs: 1, sm: 2 },
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.dark,
                                px: '8px', py: '4px',
                                borderRadius: '16px',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                                fontFamily: 'Poppins'
                            }}>
                                {courtDetails.type}
                            </Box>
                            :
                            <Box sx={{
                                ml: { xs: 1, sm: 2 },
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.dark,
                                px: '8px', py: '4px',
                                borderRadius: '16px',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                                fontFamily: 'Poppins'
                            }}>
                                {courtDetails.type}
                            </Box>
                        }
                    </Box>
                    <IconButton onClick={handleOpenEditModal} color="primary" aria-label="edit court" sx={{ flexShrink: 0 }}>
                        <EditIcon />
                    </IconButton>
                </Box>

                {isMobileView && (
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            aria-label="court details tabs"
                            variant="fullWidth"
                            textColor="primary"
                            indicatorColor="primary"
                            sx={{
                                '& .MuiTabs-flexContainer': {
                                    border: `1px solid ${theme.palette.primary.main}`,
                                    borderRadius: theme.shape.borderRadius,
                                    overflow: 'hidden',
                                },
                                '& .MuiTab-root': {
                                    color: theme.palette.primary.main,
                                    '&.Mui-selected': {
                                        color: theme.palette.common.white,
                                        backgroundColor: theme.palette.primary.main,
                                    },
                                    '&:not(:last-of-type)': {
                                        borderRight: `1px solid ${theme.palette.primary.main}`,
                                    },
                                },
                                '& .MuiTabs-indicator': {
                                    display: 'none',
                                },
                            }}
                        >
                            <Tab label="Information" {...a11yProps(0)} />
                            <Tab label="Availability" {...a11yProps(1)} />
                        </Tabs>
                    </Box>
                )}

                <Grid container spacing={isMobileView ? 2 : 3}>
                    {!isMobileView || (isMobileView && activeTab === 0) ? (
                        <Grid item xs={12} md={6}>
                            <Paper elevation={3} sx={{
                                p: 0,
                                borderRadius: theme.shape.borderRadius,
                                height: 'auto',
                                minHeight: isMobileView ? 'auto' : panelsMinHeight,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-start',
                                overflow: 'hidden'
                            }}
                                ref={imagePanelRef}
                            >
                                <Box sx={{
                                    width: '100%',
                                    height: { xs: 200, sm: 250 },
                                    overflow: 'hidden',
                                    position: 'relative',
                                    bgcolor: 'grey.200',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {courtDetails.images && courtDetails.images.length > 0 ? (
                                        <>
                                            <Grow in={true} key={selectedImageIndex}>
                                                <img
                                                    src={courtDetails.images[selectedImageIndex]}
                                                    alt={`${courtDetails.name} - Image ${selectedImageIndex + 1}`}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            </Grow>
                                            {courtDetails.images.length > 1 && (
                                                <>
                                                    <IconButton
                                                        onClick={() => handleImageNav('prev')}
                                                        sx={{
                                                            position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                                                            bgcolor: alpha(theme.palette.common.black, 0.4),
                                                            color: 'white',
                                                            '&:hover': { bgcolor: alpha(theme.palette.common.black, 0.6) },
                                                            p: 1,
                                                            borderRadius: '50%',
                                                            fontSize: '2rem'
                                                        }}
                                                    >
                                                        <ChevronLeftIcon fontSize="inherit" />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={() => handleImageNav('next')}
                                                        sx={{
                                                            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                                                            bgcolor: alpha(theme.palette.common.black, 0.4),
                                                            color: 'white',
                                                            '&:hover': { bgcolor: alpha(theme.palette.common.black, 0.6) },
                                                            p: 1,
                                                            borderRadius: '50%',
                                                            fontSize: '2rem'
                                                        }}
                                                    >
                                                        <ChevronRightIcon fontSize="inherit" />
                                                    </IconButton>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <Typography variant="body1" color="text.secondary">No Images Available</Typography>
                                    )}
                                </Box>

                                {courtDetails.amenities && courtDetails.amenities.length > 0 && (
                                    <Box sx={{ p: { xs: 2, sm: 2.5 }}}>
                                        <Typography variant="h6" component="h3" color="primary.dark" gutterBottom sx={{
                                            fontSize: '1.1rem', fontWeight: 600
                                        }}>
                                            Amenities
                                        </Typography>
                                        <Grid container spacing={1}>
                                            {courtDetails.amenities.map((amenity, index) => (
                                                <Grid item xs={12} sm={6} key={index}>
                                                    <ListItem disableGutters sx={{ py: 0.5 }}>
                                                        <ListItemIcon sx={{ minWidth: 35, color: 'success.main' }}><CheckCircleOutlineIcon /></ListItemIcon>
                                                        <ListItemText primary={<Typography variant="body2" color="text.primary" sx={{
                                                            fontSize: '0.9rem'
                                                        }}>{amenity}</Typography>} />
                                                    </ListItem>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                )}

                            </Paper>
                        </Grid>
                    ) : null}


                    {!isMobileView || (isMobileView && activeTab === 0) ? (
                        <Grid item xs={12} md={6}>
                            <TabPanel value={activeTab} index={0} isMobile={isMobileView}>
                                <Paper elevation={3} sx={{
                                    p: { xs: 2, sm: 2.5 },
                                    borderRadius: theme.shape.borderRadius,
                                    height: 'auto',
                                    minHeight: isMobileView ? 'auto' : panelsMinHeight,
                                    overflowY: isMobileView ? 'visible' : 'auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-start'
                                }}
                                    ref={detailsPanelRef}
                                >
                                    {courtDetails.description && (
                                        <Box sx={{ mb: 3 }}>
                                            <Typography variant="h6" component="h3" color="primary.dark" gutterBottom sx={{
                                                fontSize: '1.1rem', fontWeight: 600
                                            }}>
                                                About
                                            </Typography>
                                            <Typography variant="body1" color="text.secondary" sx={{
                                                fontSize: '1rem', lineHeight: 1.6
                                            }}>
                                                {courtDetails.description}
                                            </Typography>
                                        </Box>
                                    )}

                                    <Box>
                                        <Typography variant="h6" component="h3" color="primary.dark" gutterBottom sx={{
                                            fontSize: '1.1rem', fontWeight: 600
                                        }}>
                                            Contact & Location
                                        </Typography>
                                        <List dense disablePadding>
                                            {courtDetails.location && (
                                                <ListItem disableGutters sx={{ py: 0.5 }}>
                                                    <ListItemIcon sx={{ minWidth: 35, color: 'primary.main' }}><PlaceIcon /></ListItemIcon>
                                                    <ListItemText primary={<Typography variant="body2" color="text.primary" sx={{
                                                        fontSize: '0.9rem', fontWeight: 'bold'
                                                    }}>Location Area: <Typography component="span" variant="body2" color="text.primary" fontWeight={500}>{courtDetails.location}</Typography></Typography>} />
                                                </ListItem>
                                            )}
                                            {courtDetails.address && (
                                                <ListItem disableGutters sx={{ py: 0.5 }}>
                                                    <ListItemIcon sx={{ minWidth: 35, color: 'primary.main' }}><LocationOnIcon /></ListItemIcon>
                                                    <ListItemText primary={<Typography variant="body2" color="text.primary" sx={{
                                                        fontSize: '0.9rem', fontWeight: 'bold'
                                                    }}>Address: <Typography component="span" variant="body2" color="text.primary" fontWeight={500}>{courtDetails.address}</Typography></Typography>} />
                                                </ListItem>
                                            )}
                                            {courtDetails.phone && (
                                                <ListItem disableGutters sx={{ py: 0.5 }}>
                                                    <ListItemIcon sx={{ minWidth: 35, color: 'primary.main' }}><PhoneIcon /></ListItemIcon>
                                                    <ListItemText primary={<Typography variant="body2" color="text.primary" sx={{
                                                        fontSize: '0.9rem', fontWeight: 'bold'
                                                    }}>Phone: <Typography component="span" variant="body2" color="text.primary" fontWeight={500}>{courtDetails.phone}</Typography></Typography>} />
                                                </ListItem>
                                            )}
                                            {courtDetails.hours && (
                                                <ListItem disableGutters sx={{ py: 0.5 }}>
                                                    <ListItemIcon sx={{ minWidth: 35, color: 'primary.main' }}><AccessTimeIcon /></ListItemIcon>
                                                    <ListItemText primary={<Typography variant="body2" color="text.primary" sx={{
                                                        fontSize: '0.9rem', fontWeight: 'bold'
                                                    }}>Hours: <Typography component="span" variant="body2" color="text.primary" fontWeight={500}>{courtDetails.hours}</Typography></Typography>} />
                                                </ListItem>
                                            )}
                                            {courtDetails.address && (
                                                <ListItem disableGutters sx={{ py: 0.5 }}>
                                                    <ListItemIcon sx={{ minWidth: 35, color: 'primary.main' }}>
                                                        <DirectionsIcon />
                                                    </ListItemIcon>
                                                    <ListItemText>
                                                        <a href={getDirectionsLink()} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                                            <Button variant="outlined" size="small"
                                                                sx={{
                                                                    borderColor: 'primary.main', color: 'primary.main',
                                                                    '&:hover': { borderColor: 'primary.dark', bgcolor: alpha(theme.palette.primary.main, 0.04) },
                                                                    fontSize: '0.8rem'
                                                                }}>
                                                                Get Directions
                                                            </Button>
                                                        </a>
                                                    </ListItemText>
                                                </ListItem>
                                            )}
                                        </List>
                                    </Box>
                                </Paper>
                            </TabPanel>
                        </Grid>
                    ) : null}
                </Grid>

                {!isMobileView || (isMobileView && activeTab === 1) ? (
                    <Box sx={{ mt: isMobileView ? 0 : 4 }}>
                        <TabPanel value={activeTab} index={1} isMobile={isMobileView}>
                            <Paper elevation={3} sx={{
                                p: { xs: 2, sm: 2.5 },
                                borderRadius: theme.shape.borderRadius,
                            }}>
                                <Typography variant="h6" component="h3" color="primary.dark" gutterBottom sx={{
                                    fontSize: '1.1rem', fontWeight: 600, fontFamily: 'Poppins'
                                }}>
                                    Court Availability
                                </Typography>
                                {courtDetails.courts && courtDetails.courts.length > 0 ? (
                                    <CourtSchedule courts={courtDetails.courts} />
                                ) : (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontSize: '0.9rem' }}>
                                        No individual courts have been configured for this facility yet.
                                    </Typography>
                                )}
                            </Paper>
                        </TabPanel>
                    </Box>
                ) : null}
            </Box>

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