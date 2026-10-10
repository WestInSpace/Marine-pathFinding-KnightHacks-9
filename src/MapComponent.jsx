// src/MapDisplay.jsx
import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { calculatePath } from './pathfinding.js';
import { MAP_CONFIG } from './configs/mapConfig.js';
import { PROTECTED_AREAS } from './configs/obstaclesConfig.js';
import Menu from './Menu.jsx';
import './css/MapDisplay.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
    
    const [boatPosition, setBoatPosition] = useState(null);
    const [portPosition, setPortPosition] = useState(null);

    const obstaclePolygons = PROTECTED_AREAS.map(area => area.coordinates);

    const computedPath = (boatPosition && portPosition)
        ? calculatePath(boatPosition, portPosition, obstaclePolygons)
        : [];

    return (
        <div className="map-display-container">
            <Menu
                interactionMode={interactionMode}
                setInteractionMode={setInteractionMode}
                hasStart={!!boatPosition}
                hasEnd={!!portPosition}
            />

            <MapContainer
                center={MAP_CONFIG.mapCenter}
                zoom={MAP_CONFIG.defaultZoom}
                className="map-container-inner"
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

                {computedPath.length > 0 && (
                    <Polyline
                        positions={computedPath}
                        pathOptions={{ color: 'blue', weight: 4, dashArray: '5, 5' }}
                    />
                )}

                {boatPosition && (
                    <Marker position={boatPosition}>
                        <Popup>Boat Start Position</Popup>
                    </Marker>
                )}

                {portPosition && (
                    <Marker position={portPosition}>
                        <Popup>Destination Port / Safe Anchor</Popup>
                    </Marker>
                )}
            </MapContainer>

            <div className="coordinate-overlay">
                {mouseCoords ? (
                    <span>Lat: {mouseCoords.lat}, Lng: {mouseCoords.lng}</span>
                ) : (
                    <span>Hover over map...</span>
                )}
            </div>
        </div>
    );
}