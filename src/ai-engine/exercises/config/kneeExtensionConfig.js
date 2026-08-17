/**
 * AI Engine — Seated Knee Extension Config & Tunable Thresholds
 * Tracks knee joint flexion and extension (HIP -> KNEE -> ANKLE).
 */

export const KNEE_EXTENSION_CONFIG = {
  // 1. Primary Knee Angle (Degrees: ~90° bent seated -> ~160° extended)
  kneeExtension: {
    startBentAngle: 100,    // <= 100° is seated resting position
    extendingStart: 115,    // >= 115° transitions to EXTENDING
    topEnter: 145,          // >= 145° enters TOP_POSITION (leg fully straight)
    topExit: 135,           // < 135° exits TOP_POSITION to LOWERING
    returnThreshold: 105,   // <= 105° returns to START/IDLE position
  },

  // 2. Torso Alignment
  torsoAlignment: {
    maxTorsoTiltDegrees: 18,
  },

  // 3. Repetition Rules
  repetitionRules: {
    minimumMovementFrames: 3,
    maxLegVelocity: 300,
    movementDeadZone: 6,
  },

  visibilityThreshold: 0.35,
};
