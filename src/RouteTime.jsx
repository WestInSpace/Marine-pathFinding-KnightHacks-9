import React, { useMemo, useState } from 'react';
import { formatTravelTime } from './routeTimeCalculations.js';
import { summarizeRoute } from './speedZones.js';
import './css/RouteTime.css';

const NO_ROUTE = { path: [], limitsKnots: [] };

// route: the path cut at speed zone borders, with each segment's speed limit (see splitRouteBySpeedZones)
export default function RouteTime({ route = NO_ROUTE, speedInput = '10', onSpeedInputChange }) {
	const [collapsed, setCollapsed] = useState(false);
	const speedKnots = Number(speedInput);

	const { distanceNm, zoneDistanceNm, hours: travelHours } = useMemo(
		() => summarizeRoute(route, speedKnots),
		[route, speedKnots]
	);

	return (
		<section className="route-time" aria-label="Route time">
			<header className="route-time__header">
				<h2 className="route-time__title">Route Time</h2>
				<button
					className="route-time__toggle"
					type="button"
					onClick={() => setCollapsed(value => !value)}
					aria-expanded={!collapsed}
					aria-label={collapsed ? 'Expand route time' : 'Collapse route time'}
				>
					{collapsed ? '+' : '−'}
				</button>
			</header>

			{!collapsed && (
				<div className="route-time__body">
					<label className="route-time__label" htmlFor="route-time-speed">
						Boat speed (knots)
					</label>
					<input
						className="route-time__input"
						id="route-time-speed"
						type="number"
						min="0"
						step="0.1"
						value={speedInput}
						onChange={event => onSpeedInputChange(event.target.value)}
					/>

					<dl className="route-time__results">
						<div className="route-time__result">
							<dt>Route distance</dt>
							<dd>{distanceNm.toFixed(2)} nm</dd>
						</div>
						<div className="route-time__result">
							<dt>Estimated time</dt>
							<dd>{formatTravelTime(travelHours)}</dd>
						</div>
					</dl>
					{zoneDistanceNm >= 0.005 && (
						<p className="route-time__hint">{zoneDistanceNm.toFixed(2)} nm in slow/idle speed zones</p>
					)}
					{route.path.length < 2 && (
						<p className="route-time__hint">Set a start and destination to calculate the route.</p>
					)}
				</div>
			)}
		</section>
	);
}
