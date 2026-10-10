// src/Animation.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { ANIMATION_CONFIG } from './configs/AnimationConfig.js';

// Standard blue icon for when the boat is stationary at the start
const blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [37, 61],
    iconAnchor: [37, 61],
    shadowSize: [61, 61]
});

/*
// Custom ship icon for when the simulation is actively playing
// (Using an open-source ship/boat marker icon asset)
const shipIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448609.png', // Clean ship icon asset url, or file path
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
});
*/

// Create a sharp, reliable ship icon using an SVG embedded in an L.divIcon
const shipIcon = L.divIcon({
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