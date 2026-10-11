import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	server: {
		host: '0.0.0.0', // Necessary for containers
		port: 5173,
		strictPort: true,
		watch: {
			usePolling: true, // Fixes file change detection in Docker/VM environments
		},
	},
});