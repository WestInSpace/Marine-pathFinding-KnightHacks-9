// src/boatingZones.js
// FWC Boating Restricted Areas (Florida Administrative Code 68D-24), fetched live from FWC's public map service.
// Data processing only (no React/Leaflet).

const SOURCE = 'https://gis.myfwc.com/hosting/rest/services/Open_Data/State_Boating_Safety_Zones_Florida/MapServer/10';
const PAGE_SIZE = 1000;

export const ZONE_CATEGORIES = {
    noEntry: { label: 'No Entry', color: '#e02020' },
    restricted: { label: 'Restricted', color: '#ff8c00' },
    speed: { label: 'Speed Restricted', color: '#f2c200' },
    unclassified: { label: 'Unclassified', color: '#808080' },
};

// Classifies the dataset's RESTRICTION text. Anything not clearly recognised stays unclassified.
export function classifyRestriction(restriction) {
    const text = String(restriction ?? '');
    // Part-time closures (e.g. "Idle Speed No Wake / River Closure - Conditional") depend on
    // live conditions such as river level that we do not have, so they are not guessed at
    if (/closure/i.test(text) || (/no entry/i.test(text) && /conditional/i.test(text))) return 'unclassified';
    if (/^no entry/i.test(text)) return 'noEntry';
    if (/propell|no motor|anchoring/i.test(text)) return 'restricted';
    if (/(idle|slow|max) speed/i.test(text)) return 'speed';
    return 'unclassified';
}

// Whether pathfinding must route around the zone. Speed and anchoring rules never block transit.
export function zoneBlocksVessel(zone, { hasExternalPropeller }) {
    if (zone.category === 'noEntry') return true;
    return zone.category === 'restricted' && /propell|no motor/i.test(zone.restriction) && hasExternalPropeller;
}

const clean = (value) => String(value ?? '').trim();

// GeoJSON features -> raw areas in the shape toAreas expects, plus the regulation details for the popup
export function toZoneAreas(features) {
    const areas = [];
    for (const { properties, geometry } of features) {
        const category = classifyRestriction(properties.RESTRICTION);
        const polygons = geometry?.type === 'MultiPolygon' ? geometry.coordinates
            : geometry?.type === 'Polygon' ? [geometry.coordinates]
            : [];
        // shortcut: only each part's outer ring is kept (holes dropped), like scripts/fetchAreas.mjs.
        // Upgrade if Areas and pathfinding learn to handle rings with holes.
        polygons.forEach(([outerRing = []], part) => {
            const link = clean(properties.HYPERLINK);
            areas.push({
                id: `zone-fwc-${properties.OBJECTID}${polygons.length > 1 ? `-${part + 1}` : ''}`,
                name: clean(properties.AREA_NAME) || clean(properties.RULE_NAME) || 'Boating Restricted Area',
                color: ZONE_CATEGORIES[category].color,
                // GeoJSON is [lon, lat] with a repeated closing vertex; our format is [lat, lon], unclosed
                coordinates: outerRing.slice(0, -1).map(([lon, lat]) => [lat, lon]),
                category,
                restriction: clean(properties.RESTRICTION),
                condition: clean(properties.CON_LON) || clean(properties.CON_SHORT),
                rule: [clean(properties.AREA_NUM) || clean(properties.RULE_NUM), clean(properties.RULE_NAME)].filter(Boolean).join(' '),
                notes: clean(properties.NOTES),
                // The link comes from outside and ends up in an href, so only plain web links are kept
                link: /^https?:\/\//i.test(link) ? link : '',
            });
        });
    }
    return areas;
}

// Fetches every zone, following the server's paging. Rejects when a request fails.
export async function fetchBoatingZones(fetchPage = fetch) {
    const features = [];
    for (;;) {
        const params = new URLSearchParams({
            where: '1=1',
            outFields: 'OBJECTID,RULE_NUM,RULE_NAME,AREA_NUM,AREA_NAME,RESTRICTION,CON_SHORT,CON_LON,NOTES,HYPERLINK',
            orderByFields: 'OBJECTID',
            resultOffset: String(features.length),
            resultRecordCount: String(PAGE_SIZE),
            // The service stores Florida state-plane metres; ask for lat/lon, simplified to ~10 m
            outSR: '4326',
            maxAllowableOffset: '0.0001',
            geometryPrecision: '5',
            f: 'geojson',
        });
        const response = await fetchPage(`${SOURCE}/query?${params}`);
        const page = await response.json();
        if (!response.ok || page.error || !Array.isArray(page.features)) {
            throw new Error(`Boating zones query failed: ${JSON.stringify(page.error ?? response.status)}`);
        }
        features.push(...page.features);

        const more = page.exceededTransferLimit || page.properties?.exceededTransferLimit || page.features.length === PAGE_SIZE;
        if (!more || page.features.length === 0) break;
    }
    return toZoneAreas(features);
}
