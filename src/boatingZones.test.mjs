// Run with: npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyRestriction, zoneBlocksVessel, zoneSpeedLimitKnots, toZoneAreas, fetchBoatingZones } from './boatingZones.js';
import { SPEED_ZONE_LIMITS_KNOTS } from './configs/speedZonesConfig.js';

test('classifyRestriction uses the dataset wording and does not guess', () => {
    // Values taken from the live FWC layer
    assert.equal(classifyRestriction('No Entry - Water Control Structure'), 'noEntry');
    assert.equal(classifyRestriction('No Use of External Propellors'), 'restricted');
    assert.equal(classifyRestriction('Anchoring, mooring, beaching and grounding prohibited.'), 'restricted');
    assert.equal(classifyRestriction('Idle Speed No Wake'), 'speed');
    assert.equal(classifyRestriction('Slow Speed Minimum Wake - Conditional'), 'speed');
    assert.equal(classifyRestriction('Max Speed 30 MPH / Max Wake 15 Inches / Max Sound 80 dBA'), 'speed');
    assert.equal(classifyRestriction('Idle Speed No Wake / River Closure - Conditional'), 'unclassified');
    assert.equal(classifyRestriction('Something new'), 'unclassified');
    assert.equal(classifyRestriction(null), 'unclassified');
});

test('zoneBlocksVessel only blocks no-entry zones and restrictions that apply to the vessel', () => {
    const propeller = { category: 'restricted', restriction: 'No Use of External Propellors' };
    const anchoring = { category: 'restricted', restriction: 'Anchoring, mooring, beaching and grounding prohibited.' };
    assert.equal(zoneBlocksVessel({ category: 'noEntry', restriction: 'No Entry' }, { hasExternalPropeller: false }), true);
    assert.equal(zoneBlocksVessel(propeller, { hasExternalPropeller: true }), true);
    assert.equal(zoneBlocksVessel(propeller, { hasExternalPropeller: false }), false);
    assert.equal(zoneBlocksVessel(anchoring, { hasExternalPropeller: true }), false);
    assert.equal(zoneBlocksVessel({ category: 'speed', restriction: 'Idle Speed No Wake' }, { hasExternalPropeller: true }), false);
    assert.equal(zoneBlocksVessel({ category: 'unclassified', restriction: 'River Closure' }, { hasExternalPropeller: true }), false);
});

test('zoneSpeedLimitKnots caps only unconditional speed zones', () => {
    const speed = (restriction) => zoneSpeedLimitKnots({ category: 'speed', restriction });
    assert.equal(speed('Idle Speed No Wake'), SPEED_ZONE_LIMITS_KNOTS.idle);
    assert.equal(speed('Slow Speed Minimum Wake'), SPEED_ZONE_LIMITS_KNOTS.slow);
    assert.ok(Math.abs(speed('Max Speed 30 MPH / Max Wake 15 Inches / Max Sound 80 dBA') - 26.07) < 0.01);
    assert.equal(speed('Slow Speed Minimum Wake - Conditional'), null);
    assert.equal(zoneSpeedLimitKnots({ category: 'noEntry', restriction: 'No Entry' }), null);
    assert.equal(zoneSpeedLimitKnots({ category: 'unclassified', restriction: 'Idle Speed No Wake / River Closure - Conditional' }), null);
});

const ring = [[-80.2, 25.7], [-80.1, 25.7], [-80.1, 25.8], [-80.2, 25.7]];
const feature = (id, geometry, extra = {}) => ({
    properties: { OBJECTID: id, AREA_NAME: `Area ${id}`, RESTRICTION: 'Idle Speed No Wake', NOTES: ' ', ...extra },
    geometry,
});

test('toZoneAreas converts polygons and multipolygons to [lat, lon] areas', () => {
    const areas = toZoneAreas([
        feature(1, { type: 'Polygon', coordinates: [ring, ring] }, { HYPERLINK: 'javascript:alert(1)' }),
        feature(2, { type: 'MultiPolygon', coordinates: [[ring], [ring]] }, { HYPERLINK: 'https://www.flrules.org/x' }),
        feature(3, null),
    ]);
    assert.deepEqual(areas.map(area => area.id), ['zone-fwc-1', 'zone-fwc-2-1', 'zone-fwc-2-2']);
    assert.deepEqual(areas[0].coordinates, [[25.7, -80.2], [25.7, -80.1], [25.8, -80.1]]);
    assert.equal(areas[0].category, 'speed');
    assert.equal(areas[0].notes, '');
    assert.equal(areas[0].link, '');
    assert.equal(areas[1].link, 'https://www.flrules.org/x');
});

test('fetchBoatingZones follows paging until the server has no more rows', async () => {
    const offsets = [];
    const pages = [
        { features: [feature(1, { type: 'Polygon', coordinates: [ring] })], exceededTransferLimit: true },
        { features: [feature(2, { type: 'Polygon', coordinates: [ring] })] },
    ];
    const areas = await fetchBoatingZones(async (url) => {
        offsets.push(new URL(url).searchParams.get('resultOffset'));
        return { ok: true, json: async () => pages[offsets.length - 1] };
    });
    assert.deepEqual(offsets, ['0', '1']);
    assert.equal(areas.length, 2);

    await assert.rejects(fetchBoatingZones(async () => ({ ok: true, json: async () => ({ error: { code: 400 } }) })));
});
