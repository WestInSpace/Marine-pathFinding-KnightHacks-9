import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { calculatePath } from './pathfinding.js';
import { MAP_CONFIG } from './mapConfig.js';
import { PROTECTED_AREAS } from './obstaclesConfig.js';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MouseCoordinateTracker({ setCoords }) {
    useMapEvents({
        mousemove(e) {
            setCoords({
                lat: e.latlng.lat.toFixed(4),
                lng: e.latlng.lng.toFixed(4)
            });
        },
        mouseout() {
            setCoords(null);
        }
    });
    return null;
}

export default function MapComponent() {
    const [mouseCoords, setMouseCoords] = useState(null);

    // Extract just the coordinate arrays to pass into the pathfinding algorithm
    const obstaclePolygons = PROTECTED_AREAS.map(area => area.coordinates);

    // Calculate safe path avoiding all configured obstacle zones
    const computedPath = calculatePath(MAP_CONFIG.boatPosition, MAP_CONFIG.portPosition, obstaclePolygons);

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            <MapContainer
                center={MAP_CONFIG.mapCenter}
                zoom={MAP_CONFIG.defaultZoom}
                style={{ width: '100%', height: '100%' }}
            >
                <MouseCoordinateTracker setCoords={setMouseCoords} />

                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Render all Protected Areas dynamically from config */}
                {PROTECTED_AREAS.map((area) => (
                    <Polygon
                        key={area.id}
                        positions={area.coordinates}
                        pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.4 }}
                    >
                        <Popup>{area.name}</Popup>
                    </Polygon>
                ))}

                <Polyline
                    positions={computedPath}
                    pathOptions={{ color: 'blue', weight: 4, dashArray: '5, 5' }}
                />

                <Marker position={MAP_CONFIG.boatPosition}>
                    <Popup>Boat Start Position</Popup>
                </Marker>

                <Marker position={MAP_CONFIG.portPosition}>
                    <Popup>Destination Port / Safe Anchor</Popup>
                </Marker>
            </MapContainer>

            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                zIndex: 1000,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '8px 14px',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                fontFamily: 'monospace',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#333',
                pointerEvents: 'none'
            }}>
                {mouseCoords ? (
                    <span>Lat: {mouseCoords.lat}, Lng: {mouseCoords.lng}</span>
                ) : (
                    <span>Hover over map...</span>
                )}
            </div>
        </div>
    );
}