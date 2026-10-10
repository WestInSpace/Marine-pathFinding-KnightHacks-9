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
