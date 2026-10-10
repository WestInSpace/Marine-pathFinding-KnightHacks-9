import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { calculatePath } from './pathfinding.js';
import { MAP_CONFIG } from './mapConfig.js';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
	iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MouseCoordinateTracker({ setCoords }) {
	useMapEvents({
		mousemove(e) {
			setCoords({
				lat: e.latlng.lat.toFixed(4),
				lng: e.latlng.lng.toFixed(4)
			});
		},
		mouseout() {
			setCoords(null);
		}
	});
	return null;
}

export default function MapComponent() {
	const [mouseCoords, setMouseCoords] = useState(null);

	// Protected areas including the complex Terminal shape
	const mockProtectedAreas = [
		[
			[25.7813, -80.1801],
			[25.7665, -80.1450],
			[25.7664, -80.1610],
			[25.7749, -80.1787],
			[25.7780, -80.1818]
		],
		[
			[25.80, -80.22],
			[25.82, -80.21],
			[25.80, -80.19]
		]
	];

	const computedPath = calculatePath(MAP_CONFIG.boatPosition, MAP_CONFIG.portPosition, mockProtectedAreas);

	return (
		<div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
			<MapContainer
				center={MAP_CONFIG.mapCenter}
				zoom={MAP_CONFIG.defaultZoom}
				style={{ width: '100%', height: '100%' }}
			>
				<MouseCoordinateTracker setCoords={setMouseCoords} />

				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>

				{mockProtectedAreas.map((polygonCoords, index) => (
					<Polygon
						key={index}
						positions={polygonCoords}
						pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.4 }}
					>
						<Popup>Protected Zone {index + 1}</Popup>
					</Polygon>
				))}

				<Polyline
					positions={computedPath}
					pathOptions={{ color: 'blue', weight: 4, dashArray: '5, 5' }}
				/>

				<Marker position={MAP_CONFIG.boatPosition}>
					<Popup>Boat Start Position</Popup>
				</Marker>

				<Marker position={MAP_CONFIG.portPosition}>
					<Popup>Destination Port / Safe Anchor</Popup>
				</Marker>
			</MapContainer>

			<div style={{
				position: 'absolute',
				bottom: '20px',
				left: '20px',
				zIndex: 1000,
				backgroundColor: 'rgba(255, 255, 255, 0.9)',
				padding: '8px 14px',
				borderRadius: '6px',
				boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
				fontFamily: 'monospace',
				fontSize: '14px',
				fontWeight: 'bold',
				color: '#333',
				pointerEvents: 'none'
			}}>
				{mouseCoords ? (
					<span>Lat: {mouseCoords.lat}, Lng: {mouseCoords.lng}</span>
				) : (
					<span>Hover over map...</span>
				)}
			</div>
		</div>
	);
}