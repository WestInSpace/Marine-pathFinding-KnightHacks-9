// src/MapDisplay.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { fetchBoatingZones, zoneBlocksVessel, zoneSpeedLimitKnots } from './boatingZones.js';
import { splitRouteBySpeedZones } from './speedZones.js';
import { MAP_CONFIG } from './configs/mapConfig.js';
import { PROTECTED_AREAS } from './configs/obstaclesConfig.js';
import { FLORIDA_REEFS } from './configs/reefsConfig.js';
import { WILDLIFE_SPOTS } from './configs/wildlifeConfig.js';
import Menu from './Menu.jsx';
import Areas from './Areas.jsx';
import Markers from './Markers.jsx';
import Wildlife from './Wildlife.jsx';
import Animation from './Animation.jsx';
import RouteTime from './RouteTime.jsx';
import './css/MapDisplay.css';
import customBoundsConfig from './configs/customBoundsConfig.json';

// Validated once: the same areas are drawn on the map and avoided by pathfinding
const AREAS = toAreas(PROTECTED_AREAS);
// Reefs also get a safety buffer in pathfinding (land and user areas do not)
const REEF_POLYGONS = toAreas(FLORIDA_REEFS).map(reef => reef.coordinates);

function MapClickHandler({ interactionMode, setBoatPosition, setPortPosition, setStops, setPolygonDraft, isAnimating }) {
    useMapEvents({
        click(e) {
            if (isAnimating) return;
            const latLng = [e.latlng.lat, e.latlng.lng];
            if (interactionMode === 'SET_START') {
                setBoatPosition(latLng);
            } else if (interactionMode === 'SET_END') {
                setPortPosition(latLng);
            } else if (interactionMode === 'ADD_STOP') {
                setStops(stops => [...stops, latLng]);
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
    // Stops visited in order between the start and the end
    const [stops, setStops] = useState([]);
    const [isAnimating, setIsAnimating] = useState(false);

    const [speedInput, setSpeedInput] = useState('10');
    const speedKnots = Number(speedInput);

    const [reefClearanceInput, setReefClearanceInput] = useState(String(MAP_CONFIG.reefClearanceMeters));
    // Empty or invalid input means no buffer
    const reefClearanceMeters = Math.max(0, Number(reefClearanceInput)) || 0;

    // Reference for the hidden file input element
    const fileInputRef = useRef(null);

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

    const importCustomBounds = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                // Support both structured config objects ({ areas: [...] }) and direct arrays ([...])
                // toAreas drops entries without usable coordinates, which would otherwise crash the map
                const incomingAreas = toAreas(Array.isArray(parsed) ? parsed : parsed?.areas);

                if (incomingAreas.length === 0) {
                    window.alert('No valid areas found in the imported file.');
                    return;
                }

                setUserPolygons(current => [...current, ...incomingAreas]);
                window.alert(`Successfully imported ${incomingAreas.length} custom zone(s)!`);
            } catch (error) {
                console.error('Failed to parse JSON file:', error);
                window.alert('Invalid JSON file format.');
            }
            // Reset input value so the same file can be selected again if needed
            event.target.value = '';
        };
        reader.readAsText(file);
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

    // Static areas, the user's prohibited areas, and only the zones this vessel may not enter
    const obstacles = useMemo(
        () => [
            ...AREAS.map(area => area.coordinates),
            ...userPolygons.map(area => area.coordinates),
            ...zones.filter(zone => zoneBlocksVessel(zone, { hasExternalPropeller })).map(zone => zone.coordinates)
        ],
        [userPolygons, zones, hasExternalPropeller]
    );

    const handleClearPoints = () => {
        setIsAnimating(false);
        setBoatPosition(null);
        setPortPosition(null);
        setStops([]);
    };

    const removeStop = (index) => {
        setIsAnimating(false);
        setStops(current => current.filter((_, i) => i !== index));
    };

    // Memoized so the path is not recomputed on every mouse move.
    // One leg per pair of consecutive points; each leg starts where the previous one ended.
    const computedPath = useMemo(() => {
        if (!boatPosition || !portPosition) return [];
        const points = [boatPosition, ...stops, portPosition];
        return points.slice(1).flatMap((point, i) =>
            calculatePath(points[i], point, obstacles, { polygons: REEF_POLYGONS, meters: reefClearanceMeters })
                .slice(i === 0 ? 0 : 1)
        );
    }, [boatPosition, portPosition, stops, obstacles, reefClearanceMeters]);

    // The same path cut at speed zone borders, with a speed limit per segment, for the ETA and the animation
    const speedZones = useMemo(
        () => zones
            .map(zone => ({ coordinates: zone.coordinates, limitKnots: zoneSpeedLimitKnots(zone) }))
            .filter(zone => zone.limitKnots !== null),
        [zones]
    );
    const route = useMemo(() => splitRouteBySpeedZones(computedPath, speedZones), [computedPath, speedZones]);

    // Start marker is hidden while animating (the Animation component shows the boat instead)
    const routePoints = [
        boatPosition && !isAnimating && { id: 'start', name: 'Boat Start Position', color: 'blue', position: boatPosition },
        ...stops.map((position, index) => ({ id: `stop-${index}`, name: `Stop ${index + 1}`, color: 'orange', position })),
        portPosition && { id: 'end', name: 'Destination Port / Safe Anchor', color: 'green', position: portPosition },
    ].filter(Boolean);

    // Every placed point in route order, each with its own remove action, listed in the menu
    const waypoints = [
        boatPosition && { key: 'start', label: 'Start', onRemove: () => { setIsAnimating(false); setBoatPosition(null); } },
        ...stops.map((_, index) => ({ key: `stop-${index}`, label: `Stop ${index + 1}`, onRemove: () => removeStop(index) })),
        portPosition && { key: 'end', label: 'End', onRemove: () => { setIsAnimating(false); setPortPosition(null); } },
    ].filter(Boolean);

    return (
        <div className="map-display-container">
            {/* Hidden file input for importing bounds */}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".json"
                onChange={importCustomBounds}
            />

            <div className="map-controls-stack">
                <Menu
                    interactionMode={interactionMode}
                    setInteractionMode={setInteractionMode}
                    hasStart={!!boatPosition}
                    hasEnd={!!portPosition}
                    waypoints={waypoints}
                    onClear={handleClearPoints}
                    onPlayAnimation={() => setIsAnimating(true)}
                    isAnimating={isAnimating}
                    hasPath={computedPath.length > 0 && speedKnots > 0}
                    draftPointCount={polygonDraft.length}
                    onFinishPolygon={finishPolygon}
                    onCancelPolygon={() => setPolygonDraft([])}
                    onExportCustomBounds={exportCustomBounds}
                    onImportCustomBounds={() => fileInputRef.current.click()}
                    userPolygonCount={userPolygons.length}
                    hasExternalPropeller={hasExternalPropeller}
                    setHasExternalPropeller={setHasExternalPropeller}
                    reefClearanceInput={reefClearanceInput}
                    setReefClearanceInput={setReefClearanceInput}
                />
                <RouteTime
                    route={route}
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
                    setStops={setStops}
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

                {/* FWC boating zones: red no entry, orange restricted, yellow speed, grey unclassified */}
                <Areas areas={zones} />

                {/* Protected wildlife icons, hidden until zoomed in (edit configs/wildlifeConfig.js to add spots) */}
                <Wildlife spots={WILDLIFE_SPOTS} />

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
                    computedPath={route.path}
                    segmentLimitsKnots={route.limitsKnots}
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