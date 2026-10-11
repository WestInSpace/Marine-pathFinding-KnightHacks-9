import slowShipIcon from '../assets/boats/slow-ship.png';
import cruiseShipIcon from '../assets/boats/cruise-ship.png';
import speedboatIcon from '../assets/boats/speedboat.svg';

export function getBoatIconUrl(speedKnots) {
    if (!Number.isFinite(speedKnots) || speedKnots < 8) return slowShipIcon;
    if (speedKnots < 20) return cruiseShipIcon;
    return speedboatIcon;
}
