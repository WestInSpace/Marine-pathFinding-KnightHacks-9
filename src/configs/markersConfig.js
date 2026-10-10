// src/configs/markersConfig.js

// Locations shown as markers on the map. Add an entry here to add a marker.
//   id:       unique identifier
//   name:     popup text (optional)
//   position: [lat, lon]
//   color:    blue (default), gold, red, green, orange, yellow, violet, grey, black
//
// Example:
//   { id: 'marina-1', name: 'Example Marina', position: [25.7700, -80.1400], color: 'red' },
export const MAP_MARKERS = [
        { id: 'test-1', name: 'Test Marina', position: [25.7700, -80.1400], color: 'red' },
        { id: 'test-2', name: 'Test Buoy', lat: 25.8000, lng: -80.1200, color: 'violet' },
        { id: 'test-bad', name: 'Should be skipped' },
];
