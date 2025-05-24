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
}

function CourtMap({ courts }: CourtMapProps) {
    const initialCenter: [number, number] = [34.0522, -118.2437];
    const initialZoom = 10;

    const courtsWithCoords = courts.filter(court => court.latitude && court.longitude);
    let mapCenter = initialCenter;
    let mapZoom = initialZoom;

    if (courtsWithCoords.length > 0) {
        const avgLat = courtsWithCoords.reduce((sum, court) => sum + court.latitude!, 0) / courtsWithCoords.length;
        const avgLon = courtsWithCoords.reduce((sum, court) => sum + court.longitude!, 0) / courtsWithCoords.length;
        mapCenter = [avgLat, avgLon];

        if (courtsWithCoords.length === 1) {
            mapZoom = 13;
        } else {
             mapZoom = 11;
        }
    }

    return (
        <div className="court-map-container">
            <div className="map-wrapper">
                <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom={true} className="map-component">
                    <TileLayer
                        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {courtsWithCoords.map(court => (
                        <Marker key={court.id} position={[court.latitude!, court.longitude!]} >
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
                                        Get Directions
                                    </a>
                                )}
                            </Popup>
                        </Marker>
                    ))}
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