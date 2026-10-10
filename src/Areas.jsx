// src/Areas.jsx
import React from 'react';
import { Polygon, Popup } from 'react-leaflet';

// Renders one polygon per area (as returned by toAreas). Must be placed inside a <MapContainer>.
export default function Areas({ areas }) {
    return areas.map((area) => (
        <Polygon
            key={area.id}
            positions={area.coordinates}
            pathOptions={{
                color: area.color,
                fillColor: area.color,
                fillOpacity: 0.4
            }}
        >
            {area.name && <Popup>{area.name}</Popup>}
        </Polygon>
    ));
}
