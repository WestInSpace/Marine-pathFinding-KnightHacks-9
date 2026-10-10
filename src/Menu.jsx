// src/Menu.jsx
import React from 'react';
import './css/Menu.css';

export default function Menu({ 
    interactionMode, 
    setInteractionMode, 
    hasStart, 
    hasEnd, 
    onClear, 
    onPlayAnimation, 
    isAnimating, 
    hasPath 
}) {
    const canClear = hasStart || hasEnd;

    return (
        <div className="navigation-menu">
            <h3 className="menu-title">Navigation Controls</h3>
            
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

                {/* Clear Button */}
                <button
                    onClick={onClear}
                    disabled={!canClear || isAnimating}
                    className="menu-btn clear-btn"
                >
                    Clear Points
                </button>
            </div>

            <div className="instruction-box">
                {isAnimating && <p style={{ margin: 0, color: '#d39e00', fontWeight: 'bold' }}> Boat underway along computed path...</p>}
                {!isAnimating && interactionMode === 'SET_START' && <p className="instruction-start"> Click on the map to set your boat's starting location.</p>}
                {!isAnimating && interactionMode === 'SET_END' && <p className="instruction-end"> Click on the map to set your destination port.</p>}
                {!isAnimating && interactionMode === 'DRAG' && <p className="instruction-drag"> Click and drag to pan around the map freely.</p>}
            </div>
        </div>
    );
}