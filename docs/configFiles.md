MapConfig: This file contains details and paramaters for the map and pathfinding. such as map borders, grid size, line of sight resolution, and map center.

ObstclesConfig: contains all the obstcles data, their position, colors, id, and name. Add an entry here to add an area, no map code changes needed. Each area needs at least 3 valid [lat, lon] coordinates; invalid ones are skipped with a console warning.

ReefsConfig: generated reef areas from FWC's Unified Florida Reef Tract map, loaded into ObstclesConfig. Do not edit by hand, regenerate with `node scripts/fetchAreas.mjs`.

LandConfig: generated land areas (Florida mainland, keys and islands) from FWC's Florida Shoreline map, loaded into ObstclesConfig. Do not edit by hand, regenerate with `node scripts/fetchAreas.mjs`.

AnimationConfig: Contains paramaters for the animation, such as animation speed or icon.
