// src/Animation.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { ANIMATION_CONFIG } from './configs/AnimationConfig.js';
import { getBoatIconUrl } from './configs/boatIcons.js';
import { calculateRouteSegmentDistancesNm } from './routeTimeCalculations.js';

// segmentLimitsKnots: speed limit of each path segment (null where there is none), same order as the path
export default function Animation({ computedPath, segmentLimitsKnots = [], isAnimating, speedKnots, onAnimationComplete }) {
	const [currentPos, setCurrentPos] = useState(null);
	const animRef = useRef(null);
	const speedRef = useRef(speedKnots);
	const onCompleteRef = useRef(onAnimationComplete);
	speedRef.current = speedKnots;
	onCompleteRef.current = onAnimationComplete;

	const segmentDistancesNm = useMemo(
		() => calculateRouteSegmentDistancesNm(computedPath),
		[computedPath]
	);
	const boatIcon = useMemo(() => new L.Icon({
		iconUrl: getBoatIconUrl(speedKnots),
		iconSize: [40, 40],
		iconAnchor: [20, 26],
		popupAnchor: [0, -20]
	}), [speedKnots]);

	useEffect(() => {
		if (!isAnimating || computedPath.length < 2) {
			setCurrentPos(null);
			return;
		}

		let currentSegment = 0;
		let segmentProgressNm = 0;
		let previousTimestamp = null;
		setCurrentPos(computedPath[0]);

		const animateStep = (timestamp) => {
			if (previousTimestamp === null) previousTimestamp = timestamp;
			const elapsedMs = Math.min(timestamp - previousTimestamp, ANIMATION_CONFIG.maxFrameDeltaMs);
			previousTimestamp = timestamp;

			let hoursToMove = elapsedMs / 3600000 * ANIMATION_CONFIG.simulationTimeScale;

			while (currentSegment < segmentDistancesNm.length) {
				const segmentDistanceNm = segmentDistancesNm[currentSegment];
				const remainingDistanceNm = segmentDistanceNm - segmentProgressNm;

				if (remainingDistanceNm <= 0.000000001) {
					currentSegment++;
					segmentProgressNm = 0;
					continue;
				}

				// Inside a speed zone the boat goes no faster than the zone allows
				const segmentSpeedKnots = Math.min(speedRef.current, segmentLimitsKnots[currentSegment] ?? Infinity);
				if (!(segmentSpeedKnots > 0)) break;

				const hoursToFinishSegment = remainingDistanceNm / segmentSpeedKnots;
				if (hoursToMove >= hoursToFinishSegment) {
					hoursToMove -= hoursToFinishSegment;
					currentSegment++;
					segmentProgressNm = 0;
					setCurrentPos(computedPath[currentSegment]);
					continue;
				}

				segmentProgressNm += hoursToMove * segmentSpeedKnots;
				const progress = segmentProgressNm / segmentDistanceNm;
				const start = computedPath[currentSegment];
				const end = computedPath[currentSegment + 1];
				setCurrentPos([
					start[0] + (end[0] - start[0]) * progress,
					start[1] + (end[1] - start[1]) * progress
				]);
				break;
			}

			if (currentSegment >= segmentDistancesNm.length) {
				setCurrentPos(computedPath[computedPath.length - 1]);
				onCompleteRef.current?.();
				return;
			}

			animRef.current = requestAnimationFrame(animateStep);
		};

		animRef.current = requestAnimationFrame(animateStep);

		return () => {
			if (animRef.current) cancelAnimationFrame(animRef.current);
		};
	}, [isAnimating, computedPath, segmentDistancesNm, segmentLimitsKnots]);

	if (!isAnimating || !currentPos) return null;

	return (
		<Marker position={currentPos} icon={boatIcon}>
			<Popup> Boat Underway</Popup>
		</Marker>
	);
}