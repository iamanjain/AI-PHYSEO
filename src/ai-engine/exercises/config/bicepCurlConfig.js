/**
 * AI Engine — Bicep Curl Config & Tunable Thresholds
 * Optimized for natural, human-centric rehabilitation and strength training.
 * Calibrated with practical 2D webcam perspective tolerance for smooth rep counting.
 */

export const BICEP_CURL_CONFIG = {
  // 1. Primary Elbow Flexion Angles (SHOULDER -> ELBOW -> WRIST)
  elbowFlexion: {
    startExtendedAngle: 125, // >= 125° is resting extended arm
    curlingStart: 115,       // <= 115° ascending transitions to CURLING/RAISING
    topEnter: 80,            // <= 80° enters TOP_POSITION (forgiving 2D webcam peak contraction)
    topExit: 92,             // > 92° exits TOP_POSITION to LOWERING
    returnThreshold: 118,    // >= 118° returns to START/IDLE position & completes rep
  },

  // 2. Upper Arm / Elbow Stability (Keep upper arm relatively stable)
  shoulderStability: {
    maxUpperArmAngle: 80,    // HIP -> SHOULDER -> ELBOW > 80° indicates raising whole arm instead of curling
  },

  // 3. Torso Alignment (Prevent backward cheat arching)
  torsoAlignment: {
    maxTorsoTiltDegrees: 20,
    maxShoulderAsymmetry: 0.22,
  },

  // 4. Repetition State Machine Rules
  repetitionRules: {
    minimumTopHoldFrames: 1,
    minimumReturnFrames: 1,
    minimumMovementFrames: 3,
    maxArmVelocity: 400,     // deg/sec
    movementDeadZone: 8,
  },

  visibilityThreshold: 0.35,
};
