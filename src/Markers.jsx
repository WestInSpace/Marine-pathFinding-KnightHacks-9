// src/Markers.jsx
import React, { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { toMarkers } from './mapData.js';

// One icon per color, created on first use
const icons = {};
function colorIcon(color = 'blue') {
    return icons[color] ??= new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
}

// Renders one marker per valid data point. Must be placed inside a <MapContainer>.
export default function Markers({ points }) {
    const markers = useMemo(() => toMarkers(points), [points]);

    return markers.map((marker) => (
        <Marker key={marker.id} position={marker.position} icon={colorIcon(marker.color)}>
            {marker.name && <Popup>{marker.name}</Popup>}
        </Marker>
    ));
}
