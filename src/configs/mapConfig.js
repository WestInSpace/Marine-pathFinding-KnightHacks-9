// src/mapConfig.js

export const MAP_CONFIG = {
    // Geographical bounds of the simulation grid
    minLat: 25.70,
    maxLat: 25.85,
    minLon: -80.30,
    maxLon: -80.10,

    // Pathfinding & Grid parameters
    gridSize: 60,             // Higher resolution for tighter, more efficient paths, but laggy or slower rendering
    samplingResolution: 15,    // Line-of-sight check resolution for smoothing
    subSamplingOffset: 0.2,    // Offset factor to catch thin polygon tips without bloating obstacles

    // Default map viewport center
    mapCenter: [25.7617, -80.1918],
    defaultZoom: 12,

    // Default Boat & Port positions
    boatPosition: [25.74, -80.17],
    portPosition: [25.82, -80.15],
};