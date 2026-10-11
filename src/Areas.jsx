// src/Areas.jsx
import React from 'react';
import { Polygon, Popup } from 'react-leaflet';
import { ZONE_CATEGORIES } from './boatingZones.js';

// Renders one polygon per area (as returned by toAreas). Must be placed inside a <MapContainer>.
// Boating zones carry regulation details (category, restriction, ...) that are added to the popup.
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
            {area.name && (
                <Popup>
                    {area.category ? <strong>{area.name}</strong> : area.name}
                    {area.category && <div>Type: {ZONE_CATEGORIES[area.category]?.label ?? area.category}</div>}
                    {area.restriction && <div>Restriction: {area.restriction}</div>}
                    {area.condition && <div>Applies: {area.condition}</div>}
                    {area.rule && <div>Rule: {area.rule}</div>}
                    {area.notes && <div>Notes: {area.notes}</div>}
                    {area.link && <a href={area.link} target="_blank" rel="noopener noreferrer">Full regulation</a>}
                </Popup>
            )}
        </Polygon>
    ));
}
