const EARTH_RADIUS_KM = 6371;
const KM_PER_NAUTICAL_MILE = 1.852;

function haversineKm([latitude1, longitude1], [latitude2, longitude2]) {
    const toRadians = degrees => degrees * Math.PI / 180;
    const latitudeDifference = toRadians(latitude2 - latitude1);
    const longitudeDifference = toRadians(longitude2 - longitude1);
    const value = Math.sin(latitudeDifference / 2) ** 2
        + Math.cos(toRadians(latitude1)) * Math.cos(toRadians(latitude2))
        * Math.sin(longitudeDifference / 2) ** 2;
    const boundedValue = Math.min(1, Math.max(0, value));

    return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(boundedValue), Math.sqrt(1 - boundedValue));
}

export function calculateRouteDistanceNm(path) {
    return calculateRouteSegmentDistancesNm(path).reduce((total, segmentNm) => total + segmentNm, 0);
}

export function calculateRouteSegmentDistancesNm(path) {
    if (!Array.isArray(path) || path.length < 2) return [];

    const segmentDistancesNm = [];
    for (let index = 1; index < path.length; index++) {
        const previousPoint = path[index - 1];
        const currentPoint = path[index];
        if (!isValidPoint(previousPoint) || !isValidPoint(currentPoint)) return [];
        segmentDistancesNm.push(haversineKm(previousPoint, currentPoint) / KM_PER_NAUTICAL_MILE);
    }

    return segmentDistancesNm;
}

export function calculateTravelTimeHours(distanceNm, speedKnots) {
    if (!Number.isFinite(distanceNm) || distanceNm <= 0
        || !Number.isFinite(speedKnots) || speedKnots <= 0) return null;

    return distanceNm / speedKnots;
}

export function formatTravelTime(hours) {
    if (!Number.isFinite(hours) || hours < 0) return 'N/A';

    const totalMinutes = Math.round(hours * 60);
    const wholeHours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${wholeHours}h ${minutes}m`;
}

function isValidPoint(point) {
    return Array.isArray(point)
        && point.length >= 2
        && Number.isFinite(point[0])
        && Number.isFinite(point[1]);
}