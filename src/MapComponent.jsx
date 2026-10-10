// src/MapDisplay.jsx
import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { calculatePath } from './pathfinding.js';
import { MAP_CONFIG } from './configs/mapConfig.js';
import { PROTECTED_AREAS } from './configs/obstaclesConfig.js';
import Menu from './Menu.jsx';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle click events on the map canvas
function MapClickHandler({ interactionMode, setBoatPosition, setPortPosition }) {
    useMapEvents({
        click(e) {
            const latLng = [e.latlng.lat, e.latlng.lng];
            if (interactionMode === 'SET_START') {
                setBoatPosition(latLng);
            } else if (interactionMode === 'SET_END') {
                setPortPosition(latLng);
            }
        }
    });
    return null;
}

// Component to track live hover coordinates
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

export default function MapDisplay() {
    const [mouseCoords, setMouseCoords] = useState(null);
    const [interactionMode, setInteractionMode] = useState('DRAG');
    
    // Start and end positions start as null until the user clicks to place them
    const [boatPosition, setBoatPosition] = useState(null);
    const [portPosition, setPortPosition] = useState(null);

    const obstaclePolygons = PROTECTED_AREAS.map(area => area.coordinates);

    // Compute path ONLY if both start and end positions have been selected
    const computedPath = (boatPosition && portPosition)
        ? calculatePath(boatPosition, portPosition, obstaclePolygons)
        : [];

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            {/* Separate UI Menu Component */}
            <Menu
                interactionMode={interactionMode}
                setInteractionMode={setInteractionMode}
                hasStart={!!boatPosition}
                hasEnd={!!portPosition}
            />

            <MapContainer
                center={MAP_CONFIG.mapCenter}
                zoom={MAP_CONFIG.defaultZoom}
                style={{ width: '100%', height: '100%' }}
            >
                <MapClickHandler
                    interactionMode={interactionMode}
                    setBoatPosition={setBoatPosition}
                    setPortPosition={setPortPosition}
                />
                <MouseCoordinateTracker setCoords={setMouseCoords} />

                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Render Protected Areas with custom colors */}
                {PROTECTED_AREAS.map((area) => (
                    <Polygon
                        key={area.id}
                        positions={area.coordinates}
                        pathOptions={{ 
                            color: area.color, 
                            fillColor: area.color, 
                            fillOpacity: 0.4 
                        }}
                    >
                        <Popup>{area.name}</Popup>
                    </Polygon>
                ))}

                {/* Render Path Polyline only when computed */}
                {computedPath.length > 0 && (
                    <Polyline
                        positions={computedPath}
                        pathOptions={{ color: 'blue', weight: 4, dashArray: '5, 5' }}
                    />
                )}

                {/* Start Marker */}
                {boatPosition && (
                    <Marker position={boatPosition}>
                        <Popup>Boat Start Position</Popup>
                    </Marker>
                )}

                {/* End Marker */}
                {portPosition && (
                    <Marker position={portPosition}>
                        <Popup>Destination Port / Safe Anchor</Popup>
                    </Marker>
                )}
            </MapContainer>

            {/* Floating Coordinate Display Box */}
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