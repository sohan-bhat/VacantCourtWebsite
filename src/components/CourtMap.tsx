import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../styles/CourtMap.css';
import { CourtCardSummary } from '../data/courtData';

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


function CourtMap({ courts, userLocation, isProximityFilteringActive }: CourtMapProps) {
    const initialCenter: [number, number] = [34.0522, -118.2437];
    const defaultZoom = 10;
    const wideOverviewZoom = 3;

    const courtsWithCoords = courts.filter(court => court.latitude && court.longitude);

    let mapCenter = initialCenter;
    let mapZoom = defaultZoom;

    if (userLocation && isProximityFilteringActive && courtsWithCoords.length > 0) {
        const nearestCourt = courtsWithCoords.find(court => court.distanceKm !== undefined);

        if (nearestCourt) {
            mapCenter = [nearestCourt.latitude!, nearestCourt.longitude!];
            mapZoom = 14;
        } else {
            mapCenter = [userLocation.latitude, userLocation.longitude];
            mapZoom = 14;
        }
    } else if (userLocation) {
        mapCenter = [userLocation.latitude, userLocation.longitude];
        mapZoom = 11;
    } else if (courtsWithCoords.length > 0) {
        const avgLat = courtsWithCoords.reduce((sum, court) => sum + court.latitude!, 0) / courtsWithCoords.length;
        const avgLon = courtsWithCoords.reduce((sum, court) => sum + court.longitude!, 0) / courtsWithCoords.length;
        mapCenter = [avgLat, avgLon];

        if (courtsWithCoords.length === 1) {
            mapZoom = 13;
        } else {
            mapZoom = wideOverviewZoom;
        }
    }


    return (
        <div className="court-map-container">
            <div className="map-wrapper">
                <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom={true} className="map-component" key={mapCenter[0] + '-' + mapCenter[1] + '-' + mapZoom}>
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
                </MapContainer>
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