// src/Animation.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { ANIMATION_CONFIG } from './configs/AnimationConfig.js';


// Custom ship icon for when the simulation is actively playing
// (Using an open-source ship/boat marker icon asset)
let shipIcon;
if (ANIMATION_CONFIG.iconUrl) {
	shipIcon = new L.Icon({
		iconUrl: ANIMATION_CONFIG.iconUrl, // Clean ship icon asset url, or file path
		iconSize: [32, 32],
		iconAnchor: [16, 16],
		popupAnchor: [0, -16]
	});
} else {
	// Fallback to ship emoji if missing ship path in config file
	shipIcon = L.divIcon({
		className: 'custom-ship-marker',
		html: `
        <div style="
            background-color: #007bff;
            border: 2px solid white;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 3px 6px rgba(0,0,0,0.4);
            font-size: 16px;
        ">
            🚢
        </div>
    `,
		iconSize: [32, 32],
		iconAnchor: [16, 16],
		popupAnchor: [0, -16]
	});
}

export default function Animation({ computedPath, isAnimating, onAnimationComplete }) {
	const [currentPos, setCurrentPos] = useState(null);
	const animRef = useRef(null);

	useEffect(() => {
		if (!isAnimating || computedPath.length < 2) return;

		let currentSegment = 0;
		let startTime = null;
		const segmentDuration = ANIMATION_CONFIG.segmentDuration;

		const animateStep = (timestamp) => {
			if (!startTime) startTime = timestamp;
			const elapsed = timestamp - startTime;
			const progress = Math.min(elapsed / segmentDuration, 1);

			const p1 = computedPath[currentSegment];
			const p2 = computedPath[currentSegment + 1];

			const currentLat = p1[0] + (p2[0] - p1[0]) * progress;
			const currentLon = p1[1] + (p2[1] - p1[1]) * progress;

			setCurrentPos([currentLat, currentLon]);

			if (progress < 1) {
				animRef.current = requestAnimationFrame(animateStep);
			} else {
				currentSegment++;
				if (currentSegment < computedPath.length - 1) {
					startTime = null;
					animRef.current = requestAnimationFrame(animateStep);
				} else {
					setCurrentPos(computedPath[computedPath.length - 1]);
					if (onAnimationComplete) onAnimationComplete();
				}
			}
		};

		animRef.current = requestAnimationFrame(animateStep);

		return () => {
			if (animRef.current) cancelAnimationFrame(animRef.current);
		};
	}, [isAnimating, computedPath, onAnimationComplete]);

	if (!isAnimating || !currentPos) return null;

	return (
		<Marker position={currentPos} icon={shipIcon}>
			<Popup> Boat Underway</Popup>
		</Marker>
	);
}