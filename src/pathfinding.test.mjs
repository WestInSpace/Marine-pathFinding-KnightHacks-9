// Run with: npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePath } from './pathfinding.js';

// A wall far outside the MAP_CONFIG bounds (Florida Keys), between start and end
const wall = [[24.60, -81.02], [24.60, -80.98], [24.50, -80.98], [24.50, -81.02]];
const inWall = ([lat, lon]) => lat > 24.50 && lat < 24.60 && lon > -81.02 && lon < -80.98;

function assertAvoids(path, isInside) {
    assert.ok(path.length > 2, 'expected a detour, got a straight line');

    for (let i = 0; i < path.length - 1; i++) {
        for (let t = 0; t <= 1; t += 0.01) {
            const point = [path[i][0] + (path[i + 1][0] - path[i][0]) * t, path[i][1] + (path[i + 1][1] - path[i][1]) * t];
            assert.ok(!isInside(point), `path crosses the obstacle at ${point}`);
        }
    }
}

test('routes around an obstacle outside the configured map bounds', () => {
    assertAvoids(calculatePath([24.55, -81.10], [24.55, -80.90], [wall]), inWall);
});

// A "peninsula" far longer than the route, so the way around is outside the route's own search area
const peninsula = [[28.00, -81.02], [28.00, -80.98], [24.00, -80.98], [24.00, -81.02]];
const inPeninsula = ([lat, lon]) => lat > 24.00 && lat < 28.00 && lon > -81.02 && lon < -80.98;

test('routes around a land mass much larger than the route', () => {
    assertAvoids(calculatePath([26.00, -81.10], [26.00, -80.90], [peninsula]), inPeninsula);
});

test('reaches an end point placed just inside an area', () => {
    const path = calculatePath([24.55, -81.10], [24.55, -80.979], [wall]);
    // Everything before the final approach must stay out of the area
    assertAvoids(path.slice(0, -1), inWall);
});

// Distance in metres from a point to the wall (0 inside it)
function metersFromWall([lat, lon]) {
    const dLat = Math.max(24.50 - lat, 0, lat - 24.60) * 111320;
    const dLon = Math.max(-81.02 - lon, 0, lon - -80.98) * 111320 * Math.cos(lat * Math.PI / 180);
    return Math.hypot(dLat, dLon);
}

function closestApproachMeters(path) {
    let closest = Infinity;
    for (let i = 0; i < path.length - 1; i++) {
        for (let t = 0; t <= 1; t += 0.01) {
            closest = Math.min(closest, metersFromWall([path[i][0] + (path[i + 1][0] - path[i][0]) * t, path[i][1] + (path[i + 1][1] - path[i][1]) * t]));
        }
    }
    return closest;
}

test('keeps the requested clearance from clearance polygons only', () => {
    const start = [24.55, -81.10], end = [24.55, -80.90];
    const buffered = calculatePath(start, end, [wall], { polygons: [wall], meters: 500 });
    assertAvoids(buffered, inWall);
    assert.ok(closestApproachMeters(buffered) >= 495, `route comes within ${closestApproachMeters(buffered)} m`);

    // Without a clearance the same route cuts the corners much closer
    assert.ok(closestApproachMeters(calculatePath(start, end, [wall])) < 250);
    assert.ok(closestApproachMeters(calculatePath(start, end, [wall], { polygons: [], meters: 500 })) < 250);
});

test('still routes from and to points placed inside the clearance', () => {
    // 100 m west and 100 m east of the wall, well inside a 500 m clearance
    const nearWest = [24.55, -81.021], nearEast = [24.55, -80.979];
    for (const [start, end] of [[nearWest, [24.55, -80.90]], [[24.55, -81.10], nearEast], [nearWest, nearEast]]) {
        const path = calculatePath(start, end, [wall], { polygons: [wall], meters: 500 });
        assertAvoids(path, inWall);
        assert.deepEqual([path[0], path[path.length - 1]], [start, end]);
    }
});
