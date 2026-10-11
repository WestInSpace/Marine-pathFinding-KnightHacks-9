// src/mapData.js
// Data processing only (no React/Leaflet): validates raw datasets before they reach the map.

// Accepts [lat, lon], { position: [lat, lon] } or { lat, lon } / { lat, lng }
function extractLatLon(point) {
    const [lat, lon] = Array.isArray(point) ? point
        : Array.isArray(point?.position) ? point.position
        : [point?.lat, point?.lon ?? point?.lng];
    const valid = Number.isFinite(lat) && Number.isFinite(lon)
        && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;
    return valid ? [lat, lon] : null;
}

// Invalid vertices are dropped (keeping the rest of the obstacle for pathfinding);
// an area left with fewer than 3 vertices is skipped. Both cases warn instead of crashing.
export function toAreas(areas) {
    if (!Array.isArray(areas)) return [];

    const result = [];
    areas.forEach((area, index) => {
        const label = area?.id ?? index;
        const raw = Array.isArray(area?.coordinates) ? area.coordinates : [];
        const coordinates = raw.map(extractLatLon).filter(Boolean);
        if (coordinates.length < 3) {
            console.warn(`Skipping area "${label}": needs at least 3 valid [lat, lon] coordinates`, area);
            return;
        }
        if (coordinates.length < raw.length) {
            console.warn(`Area "${label}": dropped ${raw.length - coordinates.length} invalid coordinate(s)`, area);
        }
        // Extra fields (e.g. a boating zone's regulation details) pass through untouched
        result.push({ ...area, id: label, name: area.name, color: area.color, coordinates });
    });
    return result;
}

// Invalid points are skipped with a warning so one bad row never takes the map down
export function toMarkers(points) {
    if (!Array.isArray(points)) return [];

    const markers = [];
    points.forEach((point, index) => {
        const position = extractLatLon(point);
        if (!position) {
            console.warn(`Skipping marker "${point?.id ?? index}": missing or invalid coordinates`, point);
            return;
        }
        markers.push({ id: point.id ?? index, name: point.name, color: point.color, position });
    });
    return markers;
}
