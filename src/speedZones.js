// src/speedZones.js
// Works out which parts of a route lie inside speed zones. Pure math (no React/Leaflet).
// Coordinates are treated as flat [lat, lon], which is accurate enough over one route segment.
import { calculateRouteSegmentDistancesNm } from './routeTimeCalculations.js';

// Ray-casting test, polygon given as a ring of [lat, lon] points
function isPointInPolygon([lat, lon], polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [latI, lonI] = polygon[i], [latJ, lonJ] = polygon[j];
        if (((latI > lat) !== (latJ > lat)) && (lon < (lonJ - lonI) * (lat - latI) / (latJ - latI) + lonI)) inside = !inside;
    }
    return inside;
}

const pointAt = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

// The parts of segment a-b that lie inside the polygon, as [from, to] fractions of the segment
// (0 is a, 1 is b). Works for concave polygons, where a segment can enter and leave several times.
export function clipSegmentToPolygon(a, b, polygon) {
    // The segment can only switch between inside and outside where it crosses an edge
    const cuts = [0, 1];
    for (let i = 0; i < polygon.length; i++) {
        const c = polygon[i], d = polygon[(i + 1) % polygon.length];
        const denominator = (b[0] - a[0]) * (d[1] - c[1]) - (b[1] - a[1]) * (d[0] - c[0]);
        if (denominator === 0) continue;   // parallel, no single crossing point
        const t = ((c[0] - a[0]) * (d[1] - c[1]) - (c[1] - a[1]) * (d[0] - c[0])) / denominator;
        const u = ((c[0] - a[0]) * (b[1] - a[1]) - (c[1] - a[1]) * (b[0] - a[0])) / denominator;
        if (t > 0 && t < 1 && u >= 0 && u <= 1) cuts.push(t);
    }
    cuts.sort((x, y) => x - y);

    const inside = [];
    for (let i = 1; i < cuts.length; i++) {
        const from = cuts[i - 1], to = cuts[i];
        if (to - from < 1e-12 || !isPointInPolygon(pointAt(a, b, (from + to) / 2), polygon)) continue;
        const last = inside[inside.length - 1];
        if (last && last[1] === from) last[1] = to;
        else inside.push([from, to]);
    }
    return inside;
}

// Cuts the route wherever it enters or leaves a zone.
//   zones: [{ coordinates: [[lat, lon], ...], limitKnots }]
// Returns the route with the extra points added, plus the speed limit of each of its segments
// (null outside every zone, the lowest limit where zones overlap).
export function splitRouteBySpeedZones(path, zones) {
    if (!Array.isArray(path) || path.length < 2) return { path: [], limitsKnots: [] };

    const boxed = zones.map(zone => {
        const lats = zone.coordinates.map(([lat]) => lat), lons = zone.coordinates.map(([, lon]) => lon);
        return { ...zone, minLat: Math.min(...lats), maxLat: Math.max(...lats), minLon: Math.min(...lons), maxLon: Math.max(...lons) };
    });

    const points = [path[0]], limitsKnots = [];
    for (let i = 1; i < path.length; i++) {
        const a = path[i - 1], b = path[i];

        const spans = [];
        for (const zone of boxed) {
            // Most zones are nowhere near this segment
            if (Math.max(a[0], b[0]) < zone.minLat || Math.min(a[0], b[0]) > zone.maxLat
                || Math.max(a[1], b[1]) < zone.minLon || Math.min(a[1], b[1]) > zone.maxLon) continue;
            for (const [from, to] of clipSegmentToPolygon(a, b, zone.coordinates)) spans.push({ from, to, limitKnots: zone.limitKnots });
        }

        const cuts = [...new Set([0, 1, ...spans.flatMap(span => [span.from, span.to])])].sort((x, y) => x - y);
        for (let j = 1; j < cuts.length; j++) {
            const middle = (cuts[j - 1] + cuts[j]) / 2;
            const limits = spans.filter(span => span.from <= middle && middle <= span.to).map(span => span.limitKnots);
            points.push(cuts[j] === 1 ? b : pointAt(a, b, cuts[j]));
            limitsKnots.push(limits.length ? Math.min(...limits) : null);
        }
    }
    return { path: points, limitsKnots };
}

// Distance and travel time for a route from splitRouteBySpeedZones, travelling at speedKnots
// outside zones and no faster than each zone's limit inside. hours is null when it cannot be worked out.
export function summarizeRoute({ path, limitsKnots }, speedKnots) {
    let distanceNm = 0, zoneDistanceNm = 0, hours = 0;
    calculateRouteSegmentDistancesNm(path).forEach((segmentNm, index) => {
        const limit = limitsKnots[index];
        distanceNm += segmentNm;
        if (limit != null) zoneDistanceNm += segmentNm;
        hours += segmentNm / Math.min(speedKnots, limit ?? Infinity);
    });
    const valid = distanceNm > 0 && Number.isFinite(speedKnots) && speedKnots > 0;
    return { distanceNm, zoneDistanceNm, hours: valid ? hours : null };
}
