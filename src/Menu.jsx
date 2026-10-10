// src/Menu.jsx
import React from 'react';
import './css/Menu.css';

export default function Menu({ interactionMode, setInteractionMode, hasStart, hasEnd, onClear }) {
    const canClear = hasStart || hasEnd;

    return (
        <div className="navigation-menu">
            <h3 className="menu-title">Navigation Controls</h3>
            
            <div className="button-group">
                <button
                    onClick={() => setInteractionMode('SET_START')}
                    className={`menu-btn ${interactionMode === 'SET_START' ? 'active-start' : ''}`}
                >
                    {hasStart ? 'Update Start Position' : 'Select Start Position'}
                </button>

                <button
                    onClick={() => setInteractionMode('SET_END')}
                    className={`menu-btn ${interactionMode === 'SET_END' ? 'active-end' : ''}`}
                >
                    {hasEnd ? 'Update End Position' : 'Select End Position'}
                </button>

                <button
                    onClick={() => setInteractionMode('DRAG')}
                    className={`menu-btn ${interactionMode === 'DRAG' ? 'active-drag' : ''}`}
                >
                    Pan / Drag Map
                </button>

                {/* Clear Button */}
                <button
                    onClick={onClear}
                    disabled={!canClear}
                    className="menu-btn clear-btn"
                >
                    Clear Points
                </button>
            </div>

            <div className="instruction-box">
                {interactionMode === 'SET_START' && <p className="instruction-start"> Click on the map to set your boat's starting location.</p>}
                {interactionMode === 'SET_END' && <p className="instruction-end"> Click on the map to set your destination port.</p>}
                {interactionMode === 'DRAG' && <p className="instruction-drag"> Click and drag to pan around the map freely.</p>}
            </div>
        </div>
    );
}