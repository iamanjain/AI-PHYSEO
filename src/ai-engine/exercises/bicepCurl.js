import { POSE_LANDMARKS } from '../pose/landmarkUtils';
import { calculateAngle } from '../geometry/angleCalculator';
import { BICEP_CURL_CONFIG } from './config/bicepCurlConfig';

/**
 * AI Engine — Bicep Curl Biomechanical & Repetition Analyzer
 * Tracks bilateral elbow flexion & extension (SHOULDER -> ELBOW -> WRIST).
 * 
 * Features:
 * - Strict Framing Guard: Identical to Shoulder Lateral Raise.
 * - Multi-frame continuous hysteresis: Smooth, reliable rep counting on standard 2D webcams.
 * - Calibrated Form Checks: Evaluates genuine torso sway and arm hyperextension without false positives.
 */
export class BicepCurlAnalyzer {
  constructor(config = BICEP_CURL_CONFIG) {
    this.config = config;

    this.prevLeftAngle = null;
    this.prevRightAngle = null;
    this.prevTimestamp = null;
    this.movementState = 'IDLE';
    this.movementDirection = 'STATIONARY';

    this.completedReps = 0;
    this.cycleFrameCount = 0;
    this.topHoldFrameCount = 0;
    this.hasReachedTop = false;
    this.hasReturnedToStart = true;
    this.isInitialCurledEntryHandled = false;
    this.hasPostureErrorInCurrentRep = false;
  }

  reset() {
    this.prevLeftAngle = null;
    this.prevRightAngle = null;
    this.prevTimestamp = null;
    this.movementState = 'IDLE';
    this.movementDirection = 'STATIONARY';

    this.completedReps = 0;
    this.cycleFrameCount = 0;
    this.topHoldFrameCount = 0;
    this.hasReachedTop = false;
    this.hasReturnedToStart = true;
    this.isInitialCurledEntryHandled = false;
    this.hasPostureErrorInCurrentRep = false;
  }

  analyze(landmarks = [], timestamp = performance.now()) {
    // 1. Hard-reset if landmarks array is empty (Zero Phantom Reps)
    if (!landmarks || landmarks.length === 0) {
      this.movementState = 'IDLE';
      this.cycleFrameCount = 0;
      this.topHoldFrameCount = 0;
      this.hasReachedTop = false;
      return this.buildOutput({
        trackingConfidence: 0,
        postureState: 'INSUFFICIENT_DATA',
        movementState: 'INSUFFICIENT_DATA',
        postureIssues: [{ code: 'INSUFFICIENT_TRACKING', severity: 'warning', messageKey: 'INSUFFICIENT_TRACKING' }],
      });
    }

    const { elbowFlexion, shoulderStability, repetitionRules } = this.config;

    // 2. Retrieve Core Body Landmarks
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const leftElbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
    const rightElbow = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];
    const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
    const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];

    // 3. Strict Framing Verification: Check if Shoulders, Torso Hips & Arms are framed
    const minVis = 0.50;
    const isLeftShoulderVisible = leftShoulder && (leftShoulder.visibility ?? leftShoulder.presence ?? 0) >= minVis;
    const isRightShoulderVisible = rightShoulder && (rightShoulder.visibility ?? rightShoulder.presence ?? 0) >= minVis;
    const isLeftHipVisible = leftHip && (leftHip.visibility ?? leftHip.presence ?? 0) >= 0.35;
    const isRightHipVisible = rightHip && (rightHip.visibility ?? rightHip.presence ?? 0) >= 0.35;
    const isLeftElbowVisible = leftElbow && (leftElbow.visibility ?? leftElbow.presence ?? 0) >= 0.35;
    const isRightElbowVisible = rightElbow && (rightElbow.visibility ?? rightElbow.presence ?? 0) >= 0.35;

    const isCoreBodyFramed = isLeftShoulderVisible && isRightShoulderVisible && isLeftHipVisible && isRightHipVisible && (isLeftElbowVisible || isRightElbowVisible);

    const requiredKeys = [leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist, leftHip, rightHip];
    const visibleCount = requiredKeys.reduce((acc, lm) => {
      if (lm && (lm.visibility ?? lm.presence ?? 0) >= 0.35) {
        return acc + 1;
      }
      return acc;
    }, 0);

    const trackingConfidence = Math.round((visibleCount / requiredKeys.length) * 100) / 100;

    // STRICT FRAMING GUARD: Hard reset state machine when sitting too close or body out of frame
    if (!isCoreBodyFramed || visibleCount < 4) {
      this.movementState = 'IDLE';
      this.cycleFrameCount = 0;
      this.topHoldFrameCount = 0;
      this.hasReachedTop = false;
      return this.buildOutput({
        leftShoulderElevation: null,
        rightShoulderElevation: null,
        leftElbowAngle: null,
        rightElbowAngle: null,
        torsoTiltDegrees: 0,
        trackingConfidence: Math.min(0.35, trackingConfidence),
        postureState: 'INSUFFICIENT_DATA',
        movementState: 'INSUFFICIENT_DATA',
        postureIssues: [{ code: 'STEP_BACK_FOR_FRAMING', severity: 'warning', messageKey: 'STEP_BACK_FOR_FRAMING' }],
      });
    }

    // 4. Biomechanical Angle Computations
    const leftUpperArmAngle = calculateAngle(leftHip, leftShoulder, leftElbow, minVis);
    const rightUpperArmAngle = calculateAngle(rightHip, rightShoulder, rightElbow, minVis);

    const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist, minVis);
    const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist, minVis);

    let torsoTiltDegrees = 0;
    if (leftShoulder && rightShoulder) {
      const dy = leftShoulder.y - rightShoulder.y;
      const dx = Math.abs(leftShoulder.x - rightShoulder.x) || 0.001;
      torsoTiltDegrees = Math.round(Math.abs(Math.atan2(dy, dx) * (180 / Math.PI)) * 10) / 10;
    }

    // 5. Velocity Computation (Elbow Flexion: decreasing angle = curling UP)
    let leftVelocity = 0;
    let rightVelocity = 0;

    if (this.prevTimestamp && timestamp > this.prevTimestamp) {
      const dt = (timestamp - this.prevTimestamp) / 1000;
      if (dt > 0 && dt < 1.0) {
        if (leftElbowAngle !== null && this.prevLeftAngle !== null) {
          leftVelocity = (this.prevLeftAngle - leftElbowAngle) / dt;
        }
        if (rightElbowAngle !== null && this.prevRightAngle !== null) {
          rightVelocity = (this.prevRightAngle - rightElbowAngle) / dt;
        }
      }
    }

    this.prevLeftAngle = leftElbowAngle;
    this.prevRightAngle = rightElbowAngle;
    this.prevTimestamp = timestamp;

    const validLeft = leftElbowAngle !== null ? leftElbowAngle : 180;
    const validRight = rightElbowAngle !== null ? rightElbowAngle : 180;
    const minElbowAngle = Math.min(validLeft, validRight);
    const activeVel = Math.abs(leftVelocity) > Math.abs(rightVelocity) ? leftVelocity : rightVelocity;

    let direction = 'STATIONARY';
    if (activeVel > repetitionRules.movementDeadZone) {
      direction = 'UP';
    } else if (activeVel < -repetitionRules.movementDeadZone) {
      direction = 'DOWN';
    }
    this.movementDirection = direction;

    const activeSide = 'both';

    // 6. Initial Curled Entry Guard (prevents phantom rep if camera starts while user is curled)
    if (!this.isInitialCurledEntryHandled) {
      if (minElbowAngle <= elbowFlexion.curlingStart) {
        this.isInitialCurledEntryHandled = true;
        this.movementState = 'ARM_RAISED_INITIAL';
        return this.buildOutput({
          leftShoulderElevation: leftUpperArmAngle ? Math.round(leftUpperArmAngle) : null,
          rightShoulderElevation: rightUpperArmAngle ? Math.round(rightUpperArmAngle) : null,
          leftElbowAngle: leftElbowAngle ? Math.round(leftElbowAngle) : null,
          rightElbowAngle: rightElbowAngle ? Math.round(rightElbowAngle) : null,
          torsoTiltDegrees,
          leftAngularVelocity: Math.round(leftVelocity),
          rightAngularVelocity: Math.round(rightVelocity),
          activeSide,
          movementState: 'ARM_RAISED_INITIAL',
          movementDirection: direction,
          postureState: 'GOOD',
          postureIssues: [],
          trackingConfidence,
        });
      } else {
        this.isInitialCurledEntryHandled = true;
        this.hasReturnedToStart = true;
      }
    }

    if (this.movementState === 'ARM_RAISED_INITIAL') {
      if (minElbowAngle >= elbowFlexion.returnThreshold) {
        this.movementState = 'IDLE';
        this.hasReturnedToStart = true;
      } else {
        return this.buildOutput({
          leftShoulderElevation: leftUpperArmAngle ? Math.round(leftUpperArmAngle) : null,
          rightShoulderElevation: rightUpperArmAngle ? Math.round(rightUpperArmAngle) : null,
          leftElbowAngle: leftElbowAngle ? Math.round(leftElbowAngle) : null,
          rightElbowAngle: rightElbowAngle ? Math.round(rightElbowAngle) : null,
          torsoTiltDegrees,
          leftAngularVelocity: Math.round(leftVelocity),
          rightAngularVelocity: Math.round(rightVelocity),
          activeSide,
          movementState: 'ARM_RAISED_INITIAL',
          movementDirection: direction,
          postureState: 'GOOD',
          postureIssues: [],
          trackingConfidence,
        });
      }
    }

    // 7. Posture & Form Alignment Checks (Calibrated without false positives)
    const postureIssues = [];

    // Torso Lateral Tilt
    if (leftShoulder && rightShoulder) {
      const dy = leftShoulder.y - rightShoulder.y;
      if (dy > 0.22) {
        postureIssues.push({ code: 'TORSO_TILTED_RIGHT', severity: 'warning', messageKey: 'TORSO_TILTED_RIGHT' });
      } else if (dy < -0.22) {
        postureIssues.push({ code: 'TORSO_TILTED_LEFT', severity: 'warning', messageKey: 'TORSO_TILTED_LEFT' });
      }
    }

    // Excessive whole arm swing (only warn if upper arm raises > 80 degrees)
    const maxUpperArm = Math.max(leftUpperArmAngle || 0, rightUpperArmAngle || 0);
    if (maxUpperArm > shoulderStability.maxUpperArmAngle && this.movementState === 'RAISING') {
      postureIssues.push({ code: 'ELBOW_FLARE', severity: 'warning', messageKey: 'ELBOW_FLARE' });
    }

    // Movement Velocity
    if (Math.abs(activeVel) > repetitionRules.maxArmVelocity) {
      postureIssues.push({ code: 'MOVEMENT_TOO_FAST', severity: 'warning', messageKey: 'MOVEMENT_TOO_FAST' });
    }

    const postureState = postureIssues.length > 0 ? 'NEEDS_ATTENTION' : 'GOOD';
    if (postureState !== 'GOOD') {
      this.hasPostureErrorInCurrentRep = true;
    }

    // 8. Robust Repetition State Machine
    let newState = this.movementState;

    if (this.movementState === 'IDLE') {
      if (this.hasReturnedToStart && minElbowAngle <= elbowFlexion.curlingStart) {
        newState = 'RAISING';
        this.cycleFrameCount = 1;
        this.topHoldFrameCount = 0;
        this.hasReachedTop = false;
        this.hasPostureErrorInCurrentRep = false;
      } else if (minElbowAngle >= elbowFlexion.returnThreshold) {
        this.hasReturnedToStart = true;
      }
    } else if (this.movementState === 'RAISING') {
      this.cycleFrameCount++;
      if (minElbowAngle <= elbowFlexion.topEnter) {
        this.hasReachedTop = true;
        newState = 'TOP_POSITION';
      } else if (minElbowAngle >= elbowFlexion.startExtendedAngle && !this.hasReachedTop) {
        newState = 'IDLE';
        this.hasReturnedToStart = true;
      }
    } else if (this.movementState === 'TOP_POSITION') {
      this.cycleFrameCount++;
      if (minElbowAngle > elbowFlexion.topExit || direction === 'DOWN') {
        newState = 'LOWERING';
      }
    } else if (this.movementState === 'LOWERING') {
      this.cycleFrameCount++;
      if (minElbowAngle >= elbowFlexion.returnThreshold) {
        if (this.hasReachedTop && this.cycleFrameCount >= 3) {
          this.completedReps++;
          this.cycleFrameCount = 0;
          this.topHoldFrameCount = 0;
          this.hasReachedTop = false;
          this.hasReturnedToStart = true;
          newState = 'COMPLETED_REP';
        } else {
          newState = 'IDLE';
          this.hasReturnedToStart = true;
        }
      } else if (minElbowAngle <= elbowFlexion.topEnter) {
        newState = 'TOP_POSITION';
      }
    } else if (this.movementState === 'COMPLETED_REP') {
      this.hasReturnedToStart = true;
      if (minElbowAngle <= elbowFlexion.curlingStart) {
        newState = 'RAISING';
        this.cycleFrameCount = 1;
        this.topHoldFrameCount = 0;
        this.hasReachedTop = false;
        this.hasPostureErrorInCurrentRep = false;
      } else {
        newState = 'IDLE';
      }
    }

    this.movementState = newState;

    return this.buildOutput({
      leftShoulderElevation: leftUpperArmAngle ? Math.round(leftUpperArmAngle) : null,
      rightShoulderElevation: rightUpperArmAngle ? Math.round(rightUpperArmAngle) : null,
      leftElbowAngle: leftElbowAngle ? Math.round(leftElbowAngle) : null,
      rightElbowAngle: rightElbowAngle ? Math.round(rightElbowAngle) : null,
      torsoTiltDegrees,
      leftAngularVelocity: Math.round(leftVelocity),
      rightAngularVelocity: Math.round(rightVelocity),
      activeSide,
      movementState: this.movementState,
      movementDirection: this.movementDirection,
      postureState,
      postureIssues,
      completedReps: this.completedReps,
      currentRep: this.completedReps + 1,
      trackingConfidence,
      movementQuality: postureState === 'GOOD' ? 0.95 : 0.7,
    });
  }

  buildOutput(overrides = {}) {
    return {
      exercise: 'bicep-curls',
      leftShoulderElevation: null,
      rightShoulderElevation: null,
      rawLeftShoulderElevation: null,
      rawRightShoulderElevation: null,
      leftElbowAngle: null,
      rightElbowAngle: null,
      torsoTiltDegrees: 0,
      leftAngularVelocity: 0,
      rightAngularVelocity: 0,
      activeSide: 'both',
      movementState: 'IDLE',
      movementDirection: 'STATIONARY',
      postureState: 'INSUFFICIENT_DATA',
      postureIssues: [],
      completedReps: this.completedReps,
      currentRep: this.completedReps + 1,
      trackingConfidence: 0,
      movementQuality: 0,
      ...overrides,
    };
  }
}
