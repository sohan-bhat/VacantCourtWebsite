import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../styles/CourtMap.css';
import { CourtCardSummary } from '../data/courtData';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button as MuiButton
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';


delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


interface CourtMapProps {
    courts: CourtCardSummary[];
    userLocation: { latitude: number; longitude: number } | null;
    isProximityFilteringActive: boolean;
}

const createStrikethroughIcon = (isUnavailable: boolean) => {
    const defaultIconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
    const defaultIconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
    const defaultShadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';
    const iconSize: [number, number] = [25, 41];

    const htmlContent = `
        <div class="leaflet-marker-icon-wrapper ${isUnavailable ? 'marker-unavailable-strikethrough' : ''}">
            <img src="${defaultIconUrl}" srcset="${defaultIconRetinaUrl} 2x" class="leaflet-marker-icon" alt="" style="width: ${iconSize[0]}px; height: ${iconSize[1]}px;">
        </div>
        <img src="${defaultShadowUrl}" class="leaflet-marker-shadow" alt="" style="width: 41px; height: 41px; left: 0px; top: 0px;">
    `;

    return L.divIcon({
        className: 'custom-leaflet-icon-container',
        html: htmlContent,
        iconSize: iconSize,
        iconAnchor: [iconSize[0] / 2, iconSize[1]],
        popupAnchor: [1, -34],
    });
};

// --- Component to set map bounds ---
interface SetMapBoundsProps {
    bounds: L.LatLngExpression[] | undefined;
}

function SetMapBounds({ bounds }: SetMapBoundsProps) {
    const map = useMap();
    useEffect(() => {
        if (bounds) {
            // Ensure bounds are valid before fitting
            const LBounds = L.latLngBounds(bounds);
            if (LBounds.isValid()) {
                map.fitBounds(LBounds, { padding: [50, 50] }); // Add some padding
            }
        }
    }, [map, bounds]);

    return null;
}

// Define maximum distance for proximity filter (in kilometers)
const MAX_DISTANCE_KM = 40;

function CourtMap({ courts, userLocation, isProximityFilteringActive }: CourtMapProps) {
    const initialCenter: [number, number] = [34.0522, -118.2437]; // Default if no courts and no user location
    const defaultZoomForNoCourtsOrUserLocation = 3;
    const zoomForUserLocationIfNoCourtsInRange = 12; // Zoom when centered on user, but no courts are within proximity filter
    const zoomForSingleCourt = 14;

    const courtsWithCoords = courts.filter(court => court.latitude && court.longitude);

    let mapCenter = initialCenter;
    let mapZoom = defaultZoomForNoCourtsOrUserLocation;
    let boundsToFit: L.LatLngBoundsExpression | undefined = undefined;

    if (isProximityFilteringActive && userLocation) {
        // SCENARIO 1: Proximity ON & User Location available
        const courtsWithinProximity = courtsWithCoords.filter(
            court => court.distanceKm !== undefined && court.distanceKm <= MAX_DISTANCE_KM
        );

        if (courtsWithinProximity.length > 0) {
            boundsToFit = courtsWithinProximity.map(court => [court.latitude!, court.longitude!] as L.LatLngTuple);
        } else {
            // No courts within proximity, center on user, but don't fit bounds
            mapCenter = [userLocation.latitude, userLocation.longitude];
            mapZoom = zoomForUserLocationIfNoCourtsInRange;
        }
    } else if (courtsWithCoords.length > 0) {
        // SCENARIO 2: Proximity OFF (regardless of userLocation) OR No User Location, but courts exist
        // Fit bounds to all available courts.
        boundsToFit = courtsWithCoords.map(court => [court.latitude!, court.longitude!] as L.LatLngTuple);
    } else if (userLocation) {
        // SCENARIO 3: No courts with coords, but user location is available (e.g., proximity on, no nearby results)
        mapCenter = [userLocation.latitude, userLocation.longitude];
        mapZoom = zoomForUserLocationIfNoCourtsInRange; // Center on user if there are no courts at all to show
    }
    // If boundsToFit remains undefined (e.g., no courts with coords, no user location for scenario 3), map uses initialCenter and defaultZoom.


    // Final check: if we are not using fitBounds and there's only one court, focus on it.
    if (!boundsToFit && courtsWithCoords.length === 1) {
        mapCenter = [courtsWithCoords[0].latitude!, courtsWithCoords[0].longitude!];
        mapZoom = zoomForSingleCourt;
    }
    // If after all logic, we're still not fitting bounds and there are no courts to display
    // ensure we have a fallback center and zoom (already initialized).

    return (
        <div className="court-map-container">
            <div className="map-wrapper">
                <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    scrollWheelZoom={true}
                    className="map-component"
                    // Key change to ensure map re-renders when boundsToFit changes,
                    // as map.fitBounds might not trigger a prop change that MapContainer reacts to.
                    key={boundsToFit ? JSON.stringify(boundsToFit) : `${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
                >
                    <TileLayer
                        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {courtsWithCoords.map(court => {
                        const isUnavailable = court.available === 0;
                        return (
                            <Marker
                                key={court.id}
                                position={[court.latitude!, court.longitude!]}
                                icon={createStrikethroughIcon(isUnavailable)}
                            >
                                <Popup>
                                    <strong>{court.name}</strong><br />
                                    {court.available} courts available<br />
                                    <Link to={`/court/${court.id}`}>Details</Link>
                                    <br />
                                    {court.address && (
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(court.address)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ display: 'inline-block', marginTop: '5px', color: '#1e3a8a', textDecoration: 'none', fontWeight: 'bold' }}
                                        >
                                            Get Directions (Google Maps)
                                        </a>
                                    )}
                                </Popup>
                            </Marker>
                        );
                    })}

                    {boundsToFit && <SetMapBounds bounds={boundsToFit} />}

                </MapContainer>
            </div>

            <Grid container spacing={2} className="map-court-list" sx={{ mt: 2 }}>
                {(isProximityFilteringActive && userLocation
                    ? courts.filter(court => court.distanceKm !== undefined && court.distanceKm <= MAX_DISTANCE_KM)
                    : courts
                ).map(court => ( // Map over the potentially filtered list
                    <Grid item xs={12} sm={6} md={4} lg={3} key={court.id}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                borderRadius: 2,
                                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-3px)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                },
                                border: `1px solid ${court.available > 0 ? '#28a745' : '#dc3545'}`
                            }}
                        >
                            <Typography variant="h6" component="h4" sx={{ mb: 1, color: '#1e3a8a', fontWeight: 600 }}>
                                {court.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <LocationOnIcon sx={{ fontSize: '1rem', mr: 0.5, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    {court.location}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <SportsTennisIcon sx={{ fontSize: '1rem', mr: 0.5, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    {court.type}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                {court.available > 0 ? (
                                    <CheckCircleIcon sx={{ fontSize: '1rem', mr: 0.5, color: '#28a745' }} />
                                ) : (
                                    <CancelIcon sx={{ fontSize: '1rem', mr: 0.5, color: '#dc3545' }} />
                                )}
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 500,
                                        color: court.available > 0 ? '#28a745' : '#dc3545'
                                    }}
                                >
                                    {court.available > 0 ? 'Available' : 'Unavailable'} ({court.available}/{court.total})
                                </Typography>
                            </Box>
                            {/* Display Distance if available (it should be if proximity is on and it's shown) */}
                            {court.distanceKm !== undefined && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1, fontWeight: 500 }}>
                                    {court.distanceKm} km away
                                </Typography>
                            )}

                            <Link to={`/court/${court.id}`} style={{ textDecoration: 'none', width: '100%' }}>
                                <MuiButton
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    sx={{ mt: 'auto', bgcolor: '#1e3a8a', '&:hover': { bgcolor: '#172d6e' } }}
                                >
                                    View Details
                                </MuiButton>
                            </Link>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </div>
    );
}

export default CourtMap;