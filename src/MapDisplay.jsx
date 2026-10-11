// src/MapDisplay.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Polyline, useMapEvents } from 'react-leaflet';
import { calculatePath } from './pathfinding.js';
import { toAreas } from './mapData.js';
import { fetchBoatingZones, zoneBlocksVessel } from './boatingZones.js';
import { MAP_CONFIG } from './configs/mapConfig.js';
import { PROTECTED_AREAS } from './configs/obstaclesConfig.js';
import Menu from './Menu.jsx';
import Areas from './Areas.jsx';
import Markers from './Markers.jsx';
import Animation from './Animation.jsx';
import RouteTime from './RouteTime.jsx';
import './css/MapDisplay.css';

// Validated once: the same areas are drawn on the map and avoided by pathfinding
const AREAS = toAreas(PROTECTED_AREAS);
const obstaclePolygons = AREAS.map(area => area.coordinates);

function MapClickHandler({ interactionMode, setBoatPosition, setPortPosition, isAnimating }) {
    useMapEvents({
        click(e) {
            if (isAnimating) return;
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
    const [isAnimating, setIsAnimating] = useState(false);
    const [speedInput, setSpeedInput] = useState('10');
    const speedKnots = Number(speedInput);

    // FWC boating restricted areas, loaded once. The map works without them if the request fails.
    const [zones, setZones] = useState([]);
    const [hasExternalPropeller, setHasExternalPropeller] = useState(true);
    useEffect(() => {
        let cancelled = false;
        fetchBoatingZones()
            .then(rawZones => { if (!cancelled) setZones(toAreas(rawZones)); })
            .catch(error => console.warn('Boating zones unavailable, continuing without them', error));
        return () => { cancelled = true; };
    }, []);

    // Static areas plus only the zones this vessel may not enter
    const obstacles = useMemo(
        () => [
            ...obstaclePolygons,
            ...zones.filter(zone => zoneBlocksVessel(zone, { hasExternalPropeller })).map(zone => zone.coordinates)
        ],
        [zones, hasExternalPropeller]
    );

    const handleClearPoints = () => {
        setIsAnimating(false);
        setBoatPosition(null);
        setPortPosition(null);
    };

    // Memoized so the path is not recomputed on every mouse move
    const computedPath = useMemo(
        () => (boatPosition && portPosition)
            ? calculatePath(boatPosition, portPosition, obstacles)
            : [],
        [boatPosition, portPosition, obstacles]
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
                    hasExternalPropeller={hasExternalPropeller}
                    setHasExternalPropeller={setHasExternalPropeller}
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
                    isAnimating={isAnimating}
                />
                <MouseCoordinateTracker setCoords={setMouseCoords} />

                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Dataset areas (edit configs/obstaclesConfig.js to add areas) */}
                <Areas areas={AREAS} />

                {/* FWC boating zones: red no entry, orange restricted, yellow speed, grey unclassified */}
                <Areas areas={zones} />

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