import { MAP_CONFIG } from './configs/mapConfig.js';

// In this file a "polygon" is a list of [pointA, pointB] edges, see buildRowIndex

// Ray-casting algorithm to check if a point is inside any polygon
function isPointInAnyPolygon(lat, lon, polygons) {
    for (const polygon of polygons) {
        let inside = false;
        for (let i = 0; i < polygon.length; i++) {
            const latI = polygon[i][0][0], lonI = polygon[i][0][1];
            const latJ = polygon[i][1][0], lonJ = polygon[i][1][1];

            const intersect = ((latI > lat) !== (latJ > lat)) &&
                (lon < (lonJ - lonI) * (lat - latI) / (latJ - latI) + lonI);
            if (intersect) inside = !inside;
        }
        if (inside) return true;
    }
    return false;
}

// Check if line segment crosses the outline of any polygon in the list
function segmentCrossesAnyPolygonEdge(p1, p2, polygons) {
    for (const polygon of polygons) {
        for (let i = 0; i < polygon.length; i++) {
            if (doLineSegmentsIntersect(p1, p2, polygon[i][0], polygon[i][1])) return true;
        }
    }
    return false;
}

// Helper: Line segment intersection math
function doLineSegmentsIntersect(p1, p2, p3, p4) {
    const ccw = (A, B, C) => (C[1] - A[1]) * (B[0] - A[0]) > (B[1] - A[1]) * (C[0] - A[0]);
    return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
}

// Smooth path, skipping waypoints wherever the direct line is not blocked
function smoothPath(path, isLineBlocked) {
    if (path.length <= 2) return path;

    const smoothed = [path[0]];
    let currentIndex = 0;

    while (currentIndex < path.length - 1) {
        let furthestValidIndex = currentIndex + 1;

        for (let j = path.length - 1; j > currentIndex + 1; j--) {
            if (!isLineBlocked(path[currentIndex], path[j])) {
                furthestValidIndex = j;
                break;
            }
        }

        smoothed.push(path[furthestValidIndex]);
        currentIndex = furthestValidIndex;
    }

    return smoothed;
}

// Area the grid covers: the configured box when the route fits inside it,
// otherwise a padded box around the route so pathfinding works anywhere on the map
function searchBounds(start, end) {
    const { minLat, maxLat, minLon, maxLon, routePadding, minRoutePadding } = MAP_CONFIG;
    const inside = ([lat, lon]) => lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon;
    if (inside(start) && inside(end)) return { minLat, maxLat, minLon, maxLon };

    const padLat = Math.max(Math.abs(start[0] - end[0]) * routePadding, minRoutePadding);
    const padLon = Math.max(Math.abs(start[1] - end[1]) * routePadding, minRoutePadding);
    return {
        minLat: Math.min(start[0], end[0]) - padLat,
        maxLat: Math.max(start[0], end[0]) + padLat,
        minLon: Math.min(start[1], end[1]) - padLon,
        maxLon: Math.max(start[1], end[1]) + padLon
    };
}

// Fallback search area: every area on the map plus the route, for trips around a whole land mass
function everythingBounds(start, end, polygons) {
    let minLat = Math.min(start[0], end[0]), maxLat = Math.max(start[0], end[0]);
    let minLon = Math.min(start[1], end[1]), maxLon = Math.max(start[1], end[1]);
    for (const polygon of polygons) {
        for (const [lat, lon] of polygon) {
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
            if (lon < minLon) minLon = lon;
            if (lon > maxLon) maxLon = lon;
        }
    }
    const pad = MAP_CONFIG.minRoutePadding;
    return { minLat: minLat - pad, maxLat: maxLat + pad, minLon: minLon - pad, maxLon: maxLon + pad };
}

// Sorts polygon edges into the grid rows they pass through, so a check at one latitude only
// looks at the few edges near it. Without this a coastline's thousands of edges are far too slow.
// rows[y] is a list of polygons, each holding only its edges in row y (plus one row of margin).
function buildRowIndex(polygons, minLat, minLon, cellLatSize, cellLonSize, gridSize) {
    const rows = Array.from({ length: gridSize }, () => []);

    for (const polygon of polygons) {
        const edgesByRow = new Map();
        for (let i = 0; i < polygon.length; i++) {
            const a = polygon[i];
            const b = polygon[(i + 1) % polygon.length];

            // Ray-casting looks east, so edges entirely west of the search area can never be hit
            if (Math.max(a[1], b[1]) < minLon - cellLonSize) continue;

            const firstRow = Math.max(0, Math.floor((Math.min(a[0], b[0]) - minLat) / cellLatSize) - 1);
            const lastRow = Math.min(gridSize - 1, Math.floor((Math.max(a[0], b[0]) - minLat) / cellLatSize) + 1);
            for (let row = firstRow; row <= lastRow; row++) {
                if (!edgesByRow.has(row)) edgesByRow.set(row, []);
                edgesByRow.get(row).push([a, b]);
            }
        }
        for (const [row, edges] of edgesByRow) rows[row].push(edges);
    }
    return rows;
}

export function calculatePath(startLatLon, endLatLon, obstaclesPolygons) {
    return findPath(startLatLon, endLatLon, obstaclesPolygons, searchBounds(startLatLon, endLatLon))
        // No way through nearby (e.g. the goal is on the far side of a peninsula): search the whole map
        ?? findPath(startLatLon, endLatLon, obstaclesPolygons, everythingBounds(startLatLon, endLatLon, obstaclesPolygons))
        ?? [startLatLon, endLatLon];
}

// A* search on a grid covering the given bounds. Returns null when there is no route.
function findPath(startLatLon, endLatLon, obstaclesPolygons, { minLat, maxLat, minLon, maxLon }) {
    const { gridSize, subSamplingOffset, samplingResolution } = MAP_CONFIG;

    const cellLatSize = (maxLat - minLat) / gridSize;
    const cellLonSize = (maxLon - minLon) / gridSize;

    const rows = buildRowIndex(obstaclesPolygons, minLat, minLon, cellLatSize, cellLonSize, gridSize);
    const rowOf = (lat) => Math.max(0, Math.min(gridSize - 1, Math.floor((lat - minLat) / cellLatSize)));

    const isPointInAnyArea = (lat, lon) => isPointInAnyPolygon(lat, lon, rows[rowOf(lat)]);

    // Check if line segment crosses the outline of any area
    function segmentCrossesAnyArea(p1, p2) {
        const lastRow = rowOf(Math.max(p1[0], p2[0]));
        for (let row = rowOf(Math.min(p1[0], p2[0])); row <= lastRow; row++) {
            if (segmentCrossesAnyPolygonEdge(p1, p2, rows[row])) return true;
        }
        return false;
    }

    // Check if line segment touches any area
    function lineIntersectsAnyArea(p1, p2) {
        for (let s = 1; s < samplingResolution; s++) {
            const t = s / samplingResolution;
            const sampleLat = p1[0] + (p2[0] - p1[0]) * t;
            const sampleLon = p1[1] + (p2[1] - p1[1]) * t;
            if (isPointInAnyArea(sampleLat, sampleLon)) return true;
        }

        return segmentCrossesAnyArea(p1, p2);
    }

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

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const [cellLat, cellLon] = toLatLon(x, y);
            let isObstacle = isPointInAnyArea(cellLat, cellLon);

            if (!isObstacle) {
                const subPoints = [
                    [cellLat + cellLatSize * subSamplingOffset, cellLon + cellLonSize * subSamplingOffset],
                    [cellLat - cellLatSize * subSamplingOffset, cellLon - cellLonSize * subSamplingOffset]
                ];

                for (const pt of subPoints) {
                    if (isPointInAnyArea(pt[0], pt[1])) {
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

    // The start node sits at the real start position, every other node at its grid cell
    const nodeLatLon = (node) => node.parent ? toLatLon(node.x, node.y) : startLatLon;

    // A start placed inside an area (e.g. a dock on the shoreline) may cross its outline once to get out,
    // and an end placed inside an area is reached by stepping into its grid cell
    const startInsideArea = isPointInAnyArea(startLatLon[0], startLatLon[1]);
    const endInsideArea = isPointInAnyArea(endLatLon[0], endLatLon[1]);

    while (openSet.length > 0) {
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift();

        const currentLatLon = nodeLatLon(current);

        const reachedEnd = endInsideArea
            ? (current.x === end.x && current.y === end.y)
            : !lineIntersectsAnyArea(currentLatLon, endLatLon);

        if (reachedEnd) {
            let curr = current;
            const rawPath = [];
            while (curr) {
                rawPath.unshift(nodeLatLon(curr));
                curr = curr.parent;
            }

            const smoothed = smoothPath(rawPath, lineIntersectsAnyArea);

            // Drop the start point, it is added back below
            smoothed.shift();

            // Drop waypoints right next to the goal, but only while the shortcut stays clear of every area
            while (smoothed.length > 0) {
                const last = smoothed[smoothed.length - 1];
                const previous = smoothed[smoothed.length - 2] ?? startLatLon;
                const distToGoal = Math.hypot(last[0] - endLatLon[0], last[1] - endLatLon[1]);
                if (distToGoal >= 0.005 || lineIntersectsAnyArea(previous, endLatLon)) break;
                smoothed.pop();
            }

            return [startLatLon, ...smoothed, endLatLon];
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

            // Areas thinner than a grid cell fit between two free cells, so check the step itself
            const leavingArea = startInsideArea && !current.parent;
            const enteringArea = endInsideArea && nx === end.x && ny === end.y;
            if (!leavingArea && !enteringArea && segmentCrossesAnyArea(currentLatLon, toLatLon(nx, ny))) continue;

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

    return null;
}