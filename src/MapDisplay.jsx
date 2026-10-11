// src/MapDisplay.jsx
import React, { useMemo, useState } from 'react';
import {
    MapContainer,
    TileLayer,
    Polyline,
    Polygon,
    CircleMarker,
    useMapEvents
} from 'react-leaflet';
import { calculatePath } from './pathfinding.js';
import { toAreas } from './mapData.js';
import { MAP_CONFIG } from './configs/mapConfig.js';
import { PROTECTED_AREAS } from './configs/obstaclesConfig.js';
import Menu from './Menu.jsx';
import Areas from './Areas.jsx';
import Markers from './Markers.jsx';
import Animation from './Animation.jsx';
import RouteTime from './RouteTime.jsx';
import './css/MapDisplay.css';
import customBoundsConfig from './configs/customBoundsConfig.json';

// Validated once: the same areas are drawn on the map and avoided by pathfinding
const AREAS = toAreas(PROTECTED_AREAS);

function MapClickHandler({ interactionMode, setBoatPosition, setPortPosition, setPolygonDraft, isAnimating }) {
    useMapEvents({
        click(e) {
            if (isAnimating) return;
            const latLng = [e.latlng.lat, e.latlng.lng];
            if (interactionMode === 'SET_START') {
                setBoatPosition(latLng);
            } else if (interactionMode === 'SET_END') {
                setPortPosition(latLng);
            } else if (interactionMode === 'EDIT_PROHIBITED_REGIONS') {
                setPolygonDraft(points => [...points, latLng]);
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

    // Polygon states for editing/adding user boundaries
    const [polygonDraft, setPolygonDraft] = useState([]);

    // Import saved data to persist across sessions
    const [userPolygons, setUserPolygons] = useState(
        customBoundsConfig.areas ?? []
    );

    const [boatPosition, setBoatPosition] = useState(null);
    const [portPosition, setPortPosition] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const [speedInput, setSpeedInput] = useState('10');
    const speedKnots = Number(speedInput);

    const obstaclePolygons = [
        ...AREAS.map(area => area.coordinates),
        ...userPolygons.map(area => area.coordinates)
    ];

    const exportCustomBounds = () => {
        const config = {
            version: 1,
            areas: userPolygons
        };

        const blob = new Blob([JSON.stringify(config, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = 'customBoundsConfig.json';
        link.click();

        URL.revokeObjectURL(url);
    };

    const finishPolygon = () => {
        if (polygonDraft.length < 3) {
            window.alert('Add at least 3 points to create a polygon.');
            return;
        }

        setUserPolygons(current => [
            ...current,
            {
                id: crypto.randomUUID(),
                name: 'User prohibited area',
                color: '#e53935',
                category: 'prohibited',
                coordinates: polygonDraft
            }
        ]);

        setPolygonDraft([]);
    };

    const handleClearPoints = () => {
        setIsAnimating(false);
        setBoatPosition(null);
        setPortPosition(null);
    };

    // Memoized so the path is not recomputed on every mouse move
    const computedPath = useMemo(
        () => (boatPosition && portPosition)
            ? calculatePath(boatPosition, portPosition, obstaclePolygons)
            : [],
        [boatPosition, portPosition]
    );

    // Start marker is hidden while animating (the Animation component shows the boat instead)
    const routePoints = [
        boatPosition && !isAnimating && { id: 'start', name: 'Boat Start Position', color: 'blue', position: boatPosition },
        portPosition && { id: 'end', name: 'Destination Port / Safe Anchor', color: 'green', position: portPosition },
    ].filter(Boolean);

    return (
        <div className="map-display-container">
            <div className="map-controls-stack">
                <Menu
                    interactionMode={interactionMode}
                    setInteractionMode={setInteractionMode}
                    hasStart={!!boatPosition}
                    hasEnd={!!portPosition}
                    onClear={handleClearPoints}
                    onPlayAnimation={() => setIsAnimating(true)}
                    isAnimating={isAnimating}
                    hasPath={computedPath.length > 0 && speedKnots > 0}
                    draftPointCount={polygonDraft.length}
                    onFinishPolygon={finishPolygon}
                    onCancelPolygon={() => setPolygonDraft([])}
                    onExportCustomBounds={exportCustomBounds}
                    userPolygonCount={userPolygons.length}
                />
                <RouteTime
                    path={computedPath}
                    speedInput={speedInput}
                    onSpeedInputChange={setSpeedInput}
                />
            </div>

            <MapContainer
                center={MAP_CONFIG.mapCenter}
                zoom={MAP_CONFIG.defaultZoom}
                className="map-container-inner"
            >
                <MapClickHandler
                    interactionMode={interactionMode}
                    setBoatPosition={setBoatPosition}
                    setPortPosition={setPortPosition}
                    setPolygonDraft={setPolygonDraft}
                    isAnimating={isAnimating}
                />

                <MouseCoordinateTracker setCoords={setMouseCoords} />

                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Dataset areas (edit configs/obstaclesConfig.js to add areas) */}
                <Areas areas={[...AREAS, ...userPolygons]} />

                {polygonDraft.length > 0 && (
                    <>
                        {polygonDraft.length >= 2 && (
                            <Polyline
                                positions={polygonDraft}
                                pathOptions={{ color: '#FF2244', weight: 4 }}
                            />
                        )}

                        {polygonDraft.map((position, index) => (
                            <CircleMarker
                                key={index}
                                center={position}
                                radius={5}
                                pathOptions={{
                                    color: '#FF2244',
                                    fillOpacity: 0
                                }}
                            />
                        ))}
                    </>
                )}

                {computedPath.length > 0 && (
                    <Polyline
                        positions={computedPath}
                        pathOptions={{ color: 'blue', weight: 4, dashArray: '5, 5' }}
                    />
                )}

                {/* Start / End markers */}
                <Markers points={routePoints} />

                {/* Animated boat (shown only while animating) */}
                <Animation
                    computedPath={computedPath}
                    isAnimating={isAnimating}
                    speedKnots={speedKnots}
                    onAnimationComplete={() => setIsAnimating(false)}
                />
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