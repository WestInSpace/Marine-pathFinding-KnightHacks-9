// Run with: npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import { clipSegmentToPolygon, splitRouteBySpeedZones, summarizeRoute } from './speedZones.js';

const close = (actual, expected, tolerance = 1e-9) =>
    assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${expected}, got ${actual}`);
const closeSpans = (actual, expected) => {
    assert.equal(actual.length, expected.length, JSON.stringify(actual));
    actual.forEach(([from, to], i) => { close(from, expected[i][0]); close(to, expected[i][1]); });
};

// Square from lon 1 to 2; all test routes run along lat 0.5
const square = [[0, 1], [0, 2], [1, 2], [1, 1]];
// "U" shape open to the north: arms at lon 1-2 and 3-4, joined below lat 0.4
const uShape = [[0, 1], [0, 4], [1, 4], [1, 3], [0.4, 3], [0.4, 2], [1, 2], [1, 1]];

test('clipSegmentToPolygon returns the inside part of a crossing segment', () => {
    closeSpans(clipSegmentToPolygon([0.5, 0], [0.5, 4], square), [[0.25, 0.5]]);
    closeSpans(clipSegmentToPolygon([0.5, 1.2], [0.5, 1.8], square), [[0, 1]]);    // fully inside
    closeSpans(clipSegmentToPolygon([0.5, 1.5], [0.5, 3.5], square), [[0, 0.25]]);  // starts inside
    closeSpans(clipSegmentToPolygon([2, 0], [2, 4], square), []);                   // misses
    closeSpans(clipSegmentToPolygon([0.5, 0], [0.5, 0.5], square), []);             // stops short
});

test('clipSegmentToPolygon handles a concave polygon entered twice', () => {
    closeSpans(clipSegmentToPolygon([0.5, 0], [0.5, 5], uShape), [[0.2, 0.4], [0.6, 0.8]]);
});

test('splitRouteBySpeedZones cuts the route at zone borders and takes the lowest overlapping limit', () => {
    const zones = [
        { coordinates: square, limitKnots: 6 },
        { coordinates: [[0, 1.5], [0, 3], [1, 3], [1, 1.5]], limitKnots: 4 },
    ];
    const route = splitRouteBySpeedZones([[0.5, 0], [0.5, 4], [0.5, 5]], zones);
    assert.deepEqual(route.limitsKnots, [null, 6, 4, 4, null, null]);
    assert.deepEqual(route.path.map(([, lon]) => Math.round(lon * 1e6) / 1e6), [0, 1, 1.5, 2, 3, 4, 5]);

    assert.deepEqual(splitRouteBySpeedZones([[0.5, 0], [0.5, 4]], []), { path: [[0.5, 0], [0.5, 4]], limitsKnots: [null] });
    assert.deepEqual(splitRouteBySpeedZones([], zones), { path: [], limitsKnots: [] });
});

test('summarizeRoute slows down only inside zones, and never speeds a slow boat up', () => {
    // Route along the equator: one degree of longitude is 60.04 nm with the earth radius the app uses
    const route = splitRouteBySpeedZones([[0, 0], [0, 3]], [{ coordinates: [[-1, 1], [-1, 2], [1, 2], [1, 1]], limitKnots: 6 }]);
    const degree = summarizeRoute(route, 12).zoneDistanceNm;
    close(degree, 60.04, 0.01);
    close(summarizeRoute(route, 12).distanceNm, 3 * degree, 1e-6);
    close(summarizeRoute(route, 12).hours, 2 * degree / 12 + degree / 6, 1e-6);
    close(summarizeRoute(route, 3).hours, 3 * degree / 3, 1e-6);

    assert.equal(summarizeRoute(route, 0).hours, null);
    assert.deepEqual(summarizeRoute({ path: [], limitsKnots: [] }, 10), { distanceNm: 0, zoneDistanceNm: 0, hours: null });
});
