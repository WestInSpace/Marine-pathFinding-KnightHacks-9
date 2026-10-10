// src/Animation.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { ANIMATION_CONFIG } from './configs/AnimationConfig.js'; // Adjust path if needed based on your file structure

const blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export default function Animation({ computedPath, isAnimating, onAnimationComplete }) {
    const [currentPos, setCurrentPos] = useState(null);
    const animRef = useRef(null);

    useEffect(() => {
        if (!isAnimating || computedPath.length < 2) return;

        let currentSegment = 0;
        let startTime = null;

        // Use the centralized speed configuration
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
        <Marker position={currentPos} icon={blueIcon}>
            <Popup>🚢 Boat Underway</Popup>
        </Marker>
    );
}