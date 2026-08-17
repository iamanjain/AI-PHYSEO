/**
 * AI Engine — Side Leg Raise Config & Tunable Thresholds
 * Tracks lateral hip abduction (raising leg sideways while keeping torso upright).
 */

export const SIDE_LEG_RAISE_CONFIG = {
  // 1. Primary Hip Abduction Angles (Degrees)
  hipAbduction: {
    startAngle: 10,       // <= 10° is standing rest position
    raisingStart: 15,     // >= 15° transitions to RAISING
    topEnter: 26,         // >= 26° enters TOP_POSITION
    topExit: 20,          // < 20° exits TOP_POSITION to LOWERING
    returnThreshold: 12,  // <= 12° returns to START/IDLE position
  },

  // 2. Torso Alignment (Prevent compensating by tilting torso sideways)
  torsoAlignment: {
    maxTorsoTiltDegrees: 16,
    maxShoulderAsymmetry: 0.16,
  },

  // 3. Knee Flexion (Keep active leg straight)
  kneeFlexion: {
    minKneeAngle: 140, // Warn if knee bends during lateral raise
  },

  // 4. Repetition State Machine Rules
  repetitionRules: {
    minimumMovementFrames: 3,
    maxLegVelocity: 280, // deg/sec
    movementDeadZone: 6,
  },

  visibilityThreshold: 0.35,
};
