import { MAP_CONFIG } from './configs/mapConfig.js';

// Ray-casting algorithm to check if a point is inside any polygon
function isPointInAnyPolygon(lat, lon, polygons) {
    for (const polygon of polygons) {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const latI = polygon[i][0], lonI = polygon[i][1];
            const latJ = polygon[j][0], lonJ = polygon[j][1];

            const intersect = ((latI > lat) !== (latJ > lat)) &&
                (lon < (lonJ - lonI) * (lat - latI) / (latJ - latI) + lonI);
            if (intersect) inside = !inside;
        }
        if (inside) return true;
    }
    return false;
}

// Check if line segment intersects any segment of any polygon in the list
function lineIntersectsAnyPolygon(p1, p2, polygons) {
    const samples = MAP_CONFIG.samplingResolution;
    for (let s = 1; s < samples; s++) {
        const t = s / samples;
        const sampleLat = p1[0] + (p2[0] - p1[0]) * t;
        const sampleLon = p1[1] + (p2[1] - p1[1]) * t;
        if (isPointInAnyPolygon(sampleLat, sampleLon, polygons)) return true;
    }

    for (const polygon of polygons) {
        for (let i = 0; i < polygon.length; i++) {
            const a = polygon[i];
            const b = polygon[(i + 1) % polygon.length];

            if (doLineSegmentsIntersect(p1, p2, a, b)) return true;
        }
    }
    return false;
}

// Helper: Line segment intersection math
function doLineSegmentsIntersect(p1, p2, p3, p4) {
    const ccw = (A, B, C) => (C[1] - A[1]) * (B[0] - A[0]) > (B[1] - A[1]) * (C[0] - A[0]);
    return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
}

// Smooth path checking against multiple polygons
function smoothPath(path, polygons) {
    if (path.length <= 2) return path;

    const smoothed = [path[0]];
    let currentIndex = 0;

    while (currentIndex < path.length - 1) {
        let furthestValidIndex = currentIndex + 1;

        for (let j = path.length - 1; j > currentIndex + 1; j--) {
            if (!lineIntersectsAnyPolygon(path[currentIndex], path[j], polygons)) {
                furthestValidIndex = j;
                break;
            }
        }

        smoothed.push(path[furthestValidIndex]);
        currentIndex = furthestValidIndex;
    }

    return smoothed;
}

export function calculatePath(startLatLon, endLatLon, obstaclesPolygons) {
    const { minLat, maxLat, minLon, maxLon, gridSize, subSamplingOffset } = MAP_CONFIG;

    function toGrid(lat, lon) {
        const x = Math.floor(((lon - minLon) / (maxLon - minLon)) * gridSize);
        const y = Math.floor(((lat - minLat) / (maxLat - minLat)) * gridSize);
        return {
            x: Math.max(0, Math.min(gridSize - 1, x)),
            y: Math.max(0, Math.min(gridSize - 1, y))
        };
    }

    function toLatLon(x, y) {
        const lon = minLon + (x / gridSize) * (maxLon - minLon);
        const lat = minLat + (y / gridSize) * (maxLat - minLat);
        return [lat, lon];
    }

    const start = toGrid(startLatLon[0], startLatLon[1]);
    const end = toGrid(endLatLon[0], endLatLon[1]);

    const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
    const cellLatSize = (maxLat - minLat) / gridSize;
    const cellLonSize = (maxLon - minLon) / gridSize;

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const [cellLat, cellLon] = toLatLon(x, y);
            let isObstacle = isPointInAnyPolygon(cellLat, cellLon, obstaclesPolygons);

            if (!isObstacle) {
                const subPoints = [
                    [cellLat + cellLatSize * subSamplingOffset, cellLon + cellLonSize * subSamplingOffset],
                    [cellLat - cellLatSize * subSamplingOffset, cellLon - cellLonSize * subSamplingOffset]
                ];

                for (const pt of subPoints) {
                    if (isPointInAnyPolygon(pt[0], pt[1], obstaclesPolygons)) {
                        isObstacle = true;
                        break;
                    }
                }
            }

            if (isObstacle) {
                grid[y][x] = 1;
            }
        }
    }

    grid[start.y][start.x] = 0;
    grid[end.y][end.x] = 0;

    const openSet = [{ x: start.x, y: start.y, g: 0, h: 0, f: 0, parent: null }];
    const closedSet = new Set();

    function heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    while (openSet.length > 0) {
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift();

        const currentLatLon = toLatLon(current.x, current.y);

        if (!lineIntersectsAnyPolygon(currentLatLon, endLatLon, obstaclesPolygons)) {
            let curr = current;
            const rawPath = [];
            while (curr) {
                rawPath.unshift(toLatLon(curr.x, curr.y));
                curr = curr.parent;
            }

            const smoothed = smoothPath(rawPath, obstaclesPolygons);

            if (smoothed.length > 1 && !lineIntersectsAnyPolygon(startLatLon, smoothed[1], obstaclesPolygons)) {
                smoothed.shift();
            }

            const cleanedSmoothed = smoothed.filter(pt => {
                const distToGoal = Math.hypot(pt[0] - endLatLon[0], pt[1] - endLatLon[1]);
                if (distToGoal < 0.005) return false;
                return true;
            });

            return [startLatLon, ...cleanedSmoothed, endLatLon];
        }

        closedSet.add(`${current.x},${current.y}`);

        const neighbors = [
            { x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 },
            { x: 1, y: 1 }, { x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 }
        ];

        for (const d of neighbors) {
            const nx = current.x + d.x;
            const ny = current.y + d.y;

            if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) continue;
            if (grid[ny][nx] === 1) continue;
            if (closedSet.has(`${nx},${ny}`)) continue;

            const gScore = current.g + Math.hypot(d.x, d.y);
            const hScore = heuristic({ x: nx, y: ny }, end);
            const fScore = gScore + hScore;

            const existing = openSet.find(node => node.x === nx && node.y === ny);
            if (!existing) {
                openSet.push({ x: nx, y: ny, g: gScore, h: hScore, f: fScore, parent: current });
            } else if (gScore < existing.g) {
                existing.g = gScore;
                existing.f = fScore;
                existing.parent = current;
            }
        }
    }

    return [startLatLon, endLatLon];
}