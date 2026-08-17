/**
 * AI Engine — Shoulder Raise Config & Tunable Thresholds
 * Optimized for practical, human-centric rehabilitation.
 * Forgiving thresholds: counts reps smoothly for everyday people with natural body variations,
 * and only warns on major form violations.
 */

export const SHOULDER_RAISE_CONFIG = {
  // 1. Primary Shoulder Elevation Thresholds (HIP -> SHOULDER -> WRIST)
  shoulderElevation: {
    startAngle: 25,          // <= 25° is starting/rest position
    raisingStart: 30,       // >= 30° ascending transitions to RAISING
    topEnter: 50,           // >= 50° enters TOP_POSITION (forgiving elevation height)
    topExit: 42,            // < 42° exits TOP_POSITION to LOWERING
    loweringThreshold: 45,  // < 45° descending transitions to LOWERING
    returnThreshold: 35,    // <= 35° returns to START/IDLE position
  },

  // 2. Elbow Flexion Thresholds (SHOULDER -> ELBOW -> WRIST)
  elbowFlexion: {
    minElbowAngle: 85,      // Only warn if elbow flexes severely under 85° (bicep curl mistake)
  },

  // 3. Torso Alignment Thresholds
  torsoAlignment: {
    maxTorsoTiltDegrees: 18, // Lateral torso tilt > 18° triggers TORSO_TILTED
    maxShoulderAsymmetry: 0.18,
  },

  // 4. Repetition State Machine & False-Rep Prevention Bounds
  repetitionRules: {
    minimumTopHoldFrames: 1,    // 1 frame top hold requirement for smooth rep counting
    minimumReturnFrames: 1,     // 1 frame return requirement
    minimumMovementFrames: 3,   // Total cycle must take >= 3 frames
    maxArmVelocity: 320,        // deg/sec velocity above which triggers MOVEMENT_TOO_FAST
    movementDeadZone: 8,        // Velocity dead-zone (deg/sec) for UP / DOWN / STATIONARY
  },

  // 5. Tracking Confidence Threshold
  visibilityThreshold: 0.35,
};
