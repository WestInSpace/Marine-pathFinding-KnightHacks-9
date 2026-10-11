// src/Wildlife.jsx
import React, { useMemo, useState } from 'react';
import { Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { toMarkers } from './mapData.js';
import { WILDLIFE_MIN_ZOOM, WILDLIFE_SPECIES } from './configs/wildlifeConfig.js';

// One icon per species, created on first use
const icons = {};
function speciesIcon(key) {
    const { icon, size: [width, height] } = WILDLIFE_SPECIES[key];
    return icons[key] ??= new L.Icon({
        iconUrl: icon,
        iconSize: [width, height],
        iconAnchor: [width / 2, height / 2],
        popupAnchor: [0, -height / 2]
    });
}

// Small animal icons, shown only once the map is zoomed in. Must be placed inside a <MapContainer>.
export default function Wildlife({ spots }) {
    const map = useMapEvents({ zoomend: () => setZoom(map.getZoom()) });
    const [zoom, setZoom] = useState(() => map.getZoom());

    // Spots with bad coordinates or an unknown species are skipped
    const markers = useMemo(() => toMarkers(spots).filter(spot => WILDLIFE_SPECIES[spot.species]), [spots]);

    if (zoom < WILDLIFE_MIN_ZOOM) return null;

    return markers.map((spot) => {
        const species = WILDLIFE_SPECIES[spot.species];
        const video = spot.video ?? species.video;
        return (
            <Marker key={spot.id} position={spot.position} icon={speciesIcon(spot.species)} opacity={0.9} alt={species.label}>
                <Popup>
                    <strong>{species.label}</strong>
                    {spot.name && <div>{spot.name}</div>}
                    <div>{species.note}</div>
                    {video && (
                        <a href={video} target="_blank" rel="noopener noreferrer">
                            {spot.video ? 'Watch a video from this area' : 'Watch a sample video from Florida'}
                        </a>
                    )}
                </Popup>
            </Marker>
        );
    });
}
