// src/configs/speedZonesConfig.js

// Speed a vessel is assumed to hold inside FWC speed zones, in knots.
// The rules are worded as "idle speed, no wake" and "slow speed, minimum wake", not as numbers,
// so these are typical values for a small powerboat.
export const SPEED_ZONE_LIMITS_KNOTS = {
    idle: 4,
    slow: 6,
};
