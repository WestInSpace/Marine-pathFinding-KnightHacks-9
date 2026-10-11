// src/Menu.jsx
import React, { useState } from 'react';
import './css/Menu.css';

export default function Menu({ 
    interactionMode, 
    setInteractionMode, 
    hasStart, 
    hasEnd, 
    waypoints = [],
    onClear, 
    onPlayAnimation, 
    isAnimating, 
    hasPath,
    hasExternalPropeller,
    setHasExternalPropeller,
    reefClearanceInput,
    setReefClearanceInput,
    draftPointCount,
    onFinishPolygon,
    onCancelPolygon,
    onExportCustomBounds,
    onImportCustomBounds,
    userPolygonCount,
}) {
    const canClear = waypoints.length > 0;
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="navigation-menu">
            <header className="menu-header">
                <h3 className="menu-title">Navigation Controls</h3>
                <button
                    className="menu-toggle"
                    type="button"
                    onClick={() => setCollapsed(value => !value)}
                    aria-expanded={!collapsed}
                    aria-label={collapsed ? 'Expand navigation controls' : 'Collapse navigation controls'}
                >
                    {collapsed ? '+' : '−'}
                </button>
            </header>

            {!collapsed && (
            <div className="menu-body">
            
            <div className="button-group">
                <button
                    onClick={() => setInteractionMode('SET_START')}
                    className={`menu-btn ${interactionMode === 'SET_START' ? 'active-start' : ''}`}
                    disabled={isAnimating}
                >
                    {hasStart ? 'Update Start Position' : 'Select Start Position'}
                </button>

                <button
                    onClick={() => setInteractionMode('SET_END')}
                    className={`menu-btn ${interactionMode === 'SET_END' ? 'active-end' : ''}`}
                    disabled={isAnimating}
                >
                    {hasEnd ? 'Update End Position' : 'Select End Position'}
                </button>

                <button
                    onClick={() => setInteractionMode('ADD_STOP')}
                    className={`menu-btn ${interactionMode === 'ADD_STOP' ? 'active-stop' : ''}`}
                    disabled={isAnimating}
                >
                    Add Stops
                </button>

                <button
                    onClick={() => setInteractionMode('DRAG')}
                    className={`menu-btn ${interactionMode === 'DRAG' ? 'active-drag' : ''}`}
                    disabled={isAnimating}
                >
                    Pan / Drag Map
                </button>

                {/* Play Simulation Button */}
                <button
                    onClick={onPlayAnimation}
                    disabled={!hasPath || isAnimating}
                    className="menu-btn play-btn"
                >
                    {isAnimating ? 'Navigating...' : '▶ Play Simulation'}
                </button>

                <button
                    onClick={() => setInteractionMode('EDIT_PROHIBITED_REGIONS')}
                    className={`menu-btn ${interactionMode === 'EDIT_PROHIBITED_REGIONS' ? 'active-editing' : ''}`}
                    disabled={isAnimating}
                >
                    Edit Prohibited Zones
                </button>

                {interactionMode === 'EDIT_PROHIBITED_REGIONS' && (
                    <>
                        <button 
                            onClick={onFinishPolygon}
                            disabled={draftPointCount < 3}
                            className="menu-btn"
                        >
                            Finish Polygon
                        </button>
                        <button 
                            onClick={onCancelPolygon}
                            disabled={draftPointCount === 0}
                            className="menu-btn"
                        >
                            Cancel
                        </button>
                    </>
                )}

                {/* Clear Button */}
                <button
                    onClick={onClear}
                    disabled={!canClear || isAnimating}
                    className="menu-btn clear-btn"
                >
                    Clear Points
                </button>

                <button
                    onClick={onExportCustomBounds}
                    disabled={userPolygonCount === 0}
                    className="menu-btn"
                >
                    Export custom bounds
                </button>

                <button
                    onClick={onImportCustomBounds}
                    disabled={isAnimating}
                    className="menu-btn"
                >
                    Import custom bounds
                </button>
            </div>

            {/* Placed points in route order, each removable on its own */}
            {waypoints.length > 0 && (
                <ul className="waypoint-list">
                    {waypoints.map((waypoint) => (
                        <li key={waypoint.key} className="waypoint-item">
                            {waypoint.label}
                            <button
                                onClick={waypoint.onRemove}
                                disabled={isAnimating}
                                className="waypoint-remove"
                                aria-label={`Remove ${waypoint.label}`}
                            >
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {/* Routes stay at least this far from reefs */}
            <label className="vessel-option">
                Reef clearance (m)
                <input
                    type="number"
                    min="0"
                    step="10"
                    className="vessel-option-number"
                    value={reefClearanceInput}
                    onChange={(e) => setReefClearanceInput(e.target.value)}
                    disabled={isAnimating}
                />
            </label>

            <div className="instruction-box">
                {isAnimating && <p style={{ margin: 0, color: '#d39e00', fontWeight: 'bold' }}> Boat underway along computed path...</p>}
                {!isAnimating && interactionMode === 'SET_START' && <p className="instruction-start"> Click on the map to set your boat's starting location.</p>}
                {!isAnimating && interactionMode === 'SET_END' && <p className="instruction-end"> Click on the map to set your destination port.</p>}
                {!isAnimating && interactionMode === 'ADD_STOP' && <p className="instruction-stop"> Click on the map to add stops. They are visited in the order placed.</p>}
                {!isAnimating && interactionMode === 'DRAG' && <p className="instruction-drag"> Click and drag to pan around the map freely.</p>}
                {!isAnimating && interactionMode === 'EDIT_PROHIBITED_REGIONS' && <p className="instruction-edit"> Click areas to join them as prohibited boundaries.</p>}
            </div>
            </div>
            )}
        </div>
    );
}