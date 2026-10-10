import React from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { calculatePath } from './pathfinding.js';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
	iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapComponent() {
	const mapCenter = [25.7617, -80.1918];

	// Multiple protected no-travel zones
	const mockProtectedAreas = [
		[
			[25.78, -80.20],
			[25.79, -80.18],
			[25.77, -80.17],
			[25.76, -80.19]
		],
		[
			[25.80, -80.22],
			[25.82, -80.21],
			[25.80, -80.19]
		]
	];

	const boatPosition = [25.72, -80.25];
	const portPosition = [25.82, -80.15];

	// Calculate safe path avoiding all protected area polygons
	const computedPath = calculatePath(boatPosition, portPosition, mockProtectedAreas);

	return (
		<div style={{ width: '100vw', height: '100vh' }}>
			<MapContainer
				center={mapCenter}
				zoom={12}
				style={{ width: '100%', height: '100%' }}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>

				{/* Render all Protected Area Polygons */}
				{mockProtectedAreas.map((polygonCoords, index) => (
					<Polygon
						key={index}
						positions={polygonCoords}
						pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.4 }}
					>
						<Popup>Protected No-Travel Zone {index + 1}</Popup>
					</Polygon>
				))}

				{/* Calculated Safe Path Polyline */}
				<Polyline
					positions={computedPath}
					pathOptions={{ color: 'blue', weight: 4, dashArray: '5, 5' }}
				/>

				<Marker position={boatPosition}>
					<Popup>Boat Start Position</Popup>
				</Marker>

				<Marker position={portPosition}>
					<Popup>Destination Port / Safe Anchor</Popup>
				</Marker>
			</MapContainer>
		</div>
	);
}