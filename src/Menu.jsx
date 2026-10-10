// src/Menu.jsx
import React from 'react';

export default function Menu({ interactionMode, setInteractionMode, hasStart, hasEnd }) {
	return (
		<div style={{
			position: 'absolute',
			top: '20px',
			right: '20px',
			zIndex: 1000,
			backgroundColor: 'rgba(255, 255, 255, 0.95)',
			padding: '16px',
			borderRadius: '8px',
			boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
			fontFamily: 'sans-serif',
			width: '240px'
		}}>
			<h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>Navigation Controls</h3>

			<div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
				<button
					onClick={() => setInteractionMode('SET_START')}
					style={{
						padding: '10px',
						backgroundColor: interactionMode === 'SET_START' ? '#007bff' : '#f8f9fa',
						color: interactionMode === 'SET_START' ? '#fff' : '#333',
						border: '1px solid #ccc',
						borderRadius: '4px',
						cursor: 'pointer',
						fontWeight: 'bold',
						transition: 'background-color 0.2s'
					}}
				>
					{hasStart ? 'Update Start Position' : 'Select Start Position'}
				</button>

				<button
					onClick={() => setInteractionMode('SET_END')}
					style={{
						padding: '10px',
						backgroundColor: interactionMode === 'SET_END' ? '#28a745' : '#f8f9fa',
						color: interactionMode === 'SET_END' ? '#fff' : '#333',
						border: '1px solid #ccc',
						borderRadius: '4px',
						cursor: 'pointer',
						fontWeight: 'bold',
						transition: 'background-color 0.2s'
					}}
				>
					{hasEnd ? 'Update End Position' : 'Select End Position'}
				</button>

				<button
					onClick={() => setInteractionMode('DRAG')}
					style={{
						padding: '10px',
						backgroundColor: interactionMode === 'DRAG' ? '#6c757d' : '#f8f9fa',
						color: interactionMode === 'DRAG' ? '#fff' : '#333',
						border: '1px solid #ccc',
						borderRadius: '4px',
						cursor: 'pointer',
						fontWeight: 'bold',
						transition: 'background-color 0.2s'
					}}
				>
					Pan / Drag Map
				</button>
			</div>

			<div style={{ fontSize: '13px', color: '#666', borderTop: '1px solid #eee', paddingTop: '8px' }}>
				{interactionMode === 'SET_START' && <p style={{ margin: 0, color: '#007bff' }}> Click on the map to set your boat's starting location.</p>}
				{interactionMode === 'SET_END' && <p style={{ margin: 0, color: '#28a745' }}> Click on the map to set your destination port.</p>}
				{interactionMode === 'DRAG' && <p style={{ margin: 0, color: '#6c757d' }}> Click and drag to pan around the map freely.</p>}
			</div>
		</div>
	);
}