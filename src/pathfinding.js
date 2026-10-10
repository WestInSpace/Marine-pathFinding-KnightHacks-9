// Ray-casting algorithm to check if a point is inside a polygon
function isPointInPolygon(lat, lon, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const latI = polygon[i][0], lonI = polygon[i][1];
    const latJ = polygon[j][0], lonJ = polygon[j][1];
    
    const intersect = ((latI > lat) !== (latJ > lat)) &&
      (lon < (lonJ - lonI) * (lat - latI) / (latJ - latI) + lonI);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Check if line segment between p1 and p2 intersects any line segment of the polygon
function lineIntersectsPolygon(p1, p2, polygon) {
  // Also check midpoint to ensure the line doesn't pass entirely inside/through the polygon
  const midLat = (p1[0] + p2[0]) / 2;
  const midLon = (p1[1] + p2[1]) / 2;
  if (isPointInPolygon(midLat, midLon, polygon)) return true;

  // Check intersection with each edge of the polygon
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    
    if (doLineSegmentsIntersect(p1, p2, a, b)) return true;
  }
  return false;
}

// Helper: Line segment intersection math
function doLineSegmentsIntersect(p1, p2, p3, p4) {
  const ccw = (A, B, C) => (C[1] - A[1]) * (B[0] - A[0]) > (B[1] - A[1]) * (C[0] - A[0]);
  return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
}

// Smooth path by skipping intermediate points if there's a clear line of sight
function smoothPath(path, polygon) {
  if (path.length <= 2) return path;

  const smoothed = [path[0]];
  let currentIndex = 0;

  while (currentIndex < path.length - 1) {
    let furthestValidIndex = currentIndex + 1;

    // Look as far ahead as possible
    for (let j = path.length - 1; j > currentIndex + 1; j--) {
      if (!lineIntersectsPolygon(path[currentIndex], path[j], polygon)) {
        furthestValidIndex = j;
        break;
      }
    }

    smoothed.push(path[furthestValidIndex]);
    currentIndex = furthestValidIndex;
  }

  return smoothed;
}

export function calculatePath(startLatLon, endLatLon, obstaclesPolygon) {
  const minLat = 25.70, maxLat = 25.85;
  const minLon = -80.30, maxLon = -80.10;
  const gridSize = 60; 

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
      if (isPointInPolygon(cellLat, cellLon, obstaclesPolygon)) {
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

    if (current.x === end.x && current.y === end.y) {
      let curr = current;
      const rawPath = [];
      while (curr) {
        rawPath.unshift(toLatLon(curr.x, curr.y));
        curr = curr.parent;
      }
      
      // Smooth using the polygon geometry check directly
      return smoothPath(rawPath, obstaclesPolygon);
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