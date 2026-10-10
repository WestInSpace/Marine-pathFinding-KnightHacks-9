import freighterIcon from '../assets/boats/freighter.svg';
import regularBoatIcon from '../assets/boats/regular-boat.svg';
import speedboatIcon from '../assets/boats/speedboat.svg';

export function getBoatIconUrl(speedKnots) {
    if (!Number.isFinite(speedKnots) || speedKnots < 8) return freighterIcon;
    if (speedKnots < 20) return regularBoatIcon;
    return speedboatIcon;
}
