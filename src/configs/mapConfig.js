// src/mapConfig.js

export const MAP_CONFIG = {
    // Geographical bounds of the simulation grid
    minLat: 25.70,
    maxLat: 25.95,
    minLon: -80.35,
    maxLon: -80,

    // Routes that leave the bounds above get their own grid around the start & end points
    routePadding: 0.5,         // Extra room around the route to detour in, as a fraction of the route's size
    minRoutePadding: 0.1,      // Smallest extra room, in degrees (~11 km)

    // Pathfinding & Grid parameters
    gridSize: 120,             // Higher resolution for tighter, more efficient paths, but laggy or slower rendering
    samplingResolution: 50,    // Line-of-sight check resolution for smoothing
    subSamplingOffset: 0.2,    // Offset factor to catch thin polygon tips without bloating obstacles

    // Default map viewport center
    mapCenter: [25.7617, -80.1918],
    defaultZoom: 12,

    // Default Boat & Port positions
    boatPosition: [25.74, -80.17],
    portPosition: [25.82, -80.15],
};