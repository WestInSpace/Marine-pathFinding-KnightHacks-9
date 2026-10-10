// Run with: npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import { toAreas, toMarkers } from './mapData.js';

console.warn = () => {};

test('toAreas keeps valid areas, drops bad vertices, skips unusable areas', () => {
    const triangle = [[25.7, -80.1], [25.8, -80.1], [25.8, -80.2]];
    const areas = toAreas([
        { id: 'ok', name: 'OK', color: '#fff', coordinates: triangle },
        { id: 'bad-vertex', coordinates: [...triangle, [125, -80], ['25.7', '-80.1'], null] },
        { id: 'too-few', coordinates: triangle.slice(0, 2) },
        { id: 'no-coords' },
        null,
    ]);
    assert.deepEqual(areas, [
        { id: 'ok', name: 'OK', color: '#fff', coordinates: triangle },
        { id: 'bad-vertex', name: undefined, color: undefined, coordinates: triangle },
    ]);
    assert.deepEqual(toAreas(undefined), []);
});

test('toMarkers keeps valid points and skips bad ones', () => {
    const markers = toMarkers([
        { id: 'a', name: 'A', position: [25.7, -80.1], color: 'red' },
        { id: 'b', lat: 25.8, lng: -80.2 },
        { id: 'no-coords' },
        { id: 'half', lat: 25.7 },
        null,
    ]);
    assert.deepEqual(markers, [
        { id: 'a', name: 'A', color: 'red', position: [25.7, -80.1] },
        { id: 'b', name: undefined, color: undefined, position: [25.8, -80.2] },
    ]);
    assert.deepEqual(toMarkers(undefined), []);
});
