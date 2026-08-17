import { POSE_LANDMARKS } from '../pose/landmarkUtils';
import { calculateAngle } from '../geometry/angleCalculator';
import { SHOULDER_RAISE_CONFIG } from './config/shoulderRaiseConfig';

/**
 * AI Engine — Shoulder Raise Biomechanical & Repetition Analyzer
 * Real-Life Coach Exercise Intelligence Engine:
 * - Hard-resets movement state machine on framing loss (ZERO phantom reps when sitting or out of frame).
 * - Tracks exact upper-body posture, elbow extension, torso tilt, and arm elevation.
 * - Counts valid reps strictly when full movement cycle is completed with good form.
 */
export class ShoulderRaiseAnalyzer {
  constructor(config = SHOULDER_RAISE_CONFIG) {
    this.config = config;

    // Temporal Memory State
    this.prevLeftAngle = null;
    this.prevRightAngle = null;
    this.prevTimestamp = null;
    this.movementState = 'IDLE';
    this.movementDirection = 'STATIONARY';
    
    // Repetition State Machine Memory
    this.completedReps = 0;
    this.cycleFrameCount = 0;
    this.hasReachedTop = false;
    this.hasReturnedToStart = true;
    this.isInitialRaisedEntryHandled = false;
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
    this.hasReachedTop = false;
    this.hasReturnedToStart = true;
    this.isInitialRaisedEntryHandled = false;
    this.hasPostureErrorInCurrentRep = false;
  }

  analyze(landmarks = [], timestamp = performance.now()) {
    if (!landmarks || landmarks.length === 0) {
      this.movementState = 'IDLE';
      this.cycleFrameCount = 0;
      this.hasReachedTop = false;
      return this.buildOutput({
        trackingConfidence: 0,
        postureState: 'INSUFFICIENT_DATA',
        movementState: 'INSUFFICIENT_DATA',
        postureIssues: [{ code: 'INSUFFICIENT_TRACKING', severity: 'warning', messageKey: 'INSUFFICIENT_TRACKING' }],
      });
    }

    const { shoulderElevation, elbowFlexion, torsoAlignment, repetitionRules } = this.config;

    // 1. Retrieve Core Body Landmarks
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const leftElbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
    const rightElbow = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];
    const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
    const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];

    // 2. Strict Framing Verification: Check if Shoulders & Torso Hips are actually visible in camera frame
    const minVis = 0.50;
    const isLeftShoulderVisible = leftShoulder && (leftShoulder.visibility ?? leftShoulder.presence ?? 0) >= minVis;
    const isRightShoulderVisible = rightShoulder && (rightShoulder.visibility ?? rightShoulder.presence ?? 0) >= minVis;
    const isLeftHipVisible = leftHip && (leftHip.visibility ?? leftHip.presence ?? 0) >= minVis;
    const isRightHipVisible = rightHip && (rightHip.visibility ?? rightHip.presence ?? 0) >= minVis;

    const isCoreBodyFramed = isLeftShoulderVisible && isRightShoulderVisible && isLeftHipVisible && isRightHipVisible;

    const requiredKeys = [leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist, leftHip, rightHip];
    const visibleCount = requiredKeys.reduce((acc, lm) => {
      if (lm && (lm.visibility ?? lm.presence ?? 0) >= minVis) {
        return acc + 1;
      }
      return acc;
    }, 0);

    const trackingConfidence = Math.round((visibleCount / requiredKeys.length) * 100) / 100;

    // STRICT FRAMING GUARD: Hard reset state machine when sitting too close or body out of frame
    if (!isCoreBodyFramed || visibleCount < 4) {
      this.movementState = 'IDLE';
      this.cycleFrameCount = 0;
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

    // 3. Biomechanical Angle Computations
    const leftShoulderElev = calculateAngle(leftHip, leftShoulder, leftWrist, minVis);
    const rightShoulderElev = calculateAngle(rightHip, rightShoulder, rightWrist, minVis);
    const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist, minVis);
    const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist, minVis);

    // Torso Side Alignment Metric
    let torsoTiltDegrees = 0;
    if (leftShoulder && rightShoulder) {
      const dy = leftShoulder.y - rightShoulder.y;
      const dx = Math.abs(leftShoulder.x - rightShoulder.x) || 0.001;
      torsoTiltDegrees = Math.round(Math.abs(Math.atan2(dy, dx) * (180 / Math.PI)) * 10) / 10;
    }

    // 4. Angular Velocity & Direction ("UP" / "DOWN" / "STATIONARY")
    let leftVelocity = 0;
    let rightVelocity = 0;

    if (this.prevTimestamp && timestamp > this.prevTimestamp) {
      const dt = (timestamp - this.prevTimestamp) / 1000;
      if (dt > 0 && dt < 1.0) {
        if (leftShoulderElev !== null && this.prevLeftAngle !== null) {
          leftVelocity = (leftShoulderElev - this.prevLeftAngle) / dt;
        }
        if (rightShoulderElev !== null && this.prevRightAngle !== null) {
          rightVelocity = (rightShoulderElev - this.prevRightAngle) / dt;
        }
      }
    }

    this.prevLeftAngle = leftShoulderElev;
    this.prevRightAngle = rightShoulderElev;
    this.prevTimestamp = timestamp;

    const maxElevation = Math.max(leftShoulderElev || 0, rightShoulderElev || 0);
    const activeVel = Math.abs(leftVelocity) > Math.abs(rightVelocity) ? leftVelocity : rightVelocity;

    let direction = 'STATIONARY';
    if (activeVel > repetitionRules.movementDeadZone) {
      direction = 'UP';
    } else if (activeVel < -repetitionRules.movementDeadZone) {
      direction = 'DOWN';
    }
    this.movementDirection = direction;

    // 5. Active Arm Detection ("LEFT" / "RIGHT" / "BOTH" / "NONE")
    let activeSide = 'none';
    const isLeftActive = (leftShoulderElev || 0) >= shoulderElevation.raisingStart;
    const isRightActive = (rightShoulderElev || 0) >= shoulderElevation.raisingStart;

    if (isLeftActive && isRightActive) {
      activeSide = 'both';
    } else if (isLeftActive) {
      activeSide = 'left';
    } else if (isRightActive) {
      activeSide = 'right';
    }

    // 6. INITIAL-STATE RULE: Handle user entering camera with arm already raised
    if (!this.isInitialRaisedEntryHandled) {
      if (maxElevation >= shoulderElevation.raisingStart) {
        this.isInitialRaisedEntryHandled = true;
        this.movementState = 'ARM_RAISED_INITIAL';
        return this.buildOutput({
          leftShoulderElevation: leftShoulderElev,
          rightShoulderElevation: rightShoulderElev,
          leftElbowAngle,
          rightElbowAngle,
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
        this.isInitialRaisedEntryHandled = true;
        this.hasReturnedToStart = true;
      }
    }

    if (this.movementState === 'ARM_RAISED_INITIAL') {
      if (maxElevation <= shoulderElevation.returnThreshold) {
        this.movementState = 'IDLE';
        this.hasReturnedToStart = true;
      } else {
        return this.buildOutput({
          leftShoulderElevation: leftShoulderElev,
          rightShoulderElevation: rightShoulderElev,
          leftElbowAngle,
          rightElbowAngle,
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

    // 7. Forgiving Posture & Movement Quality Checks
    const postureIssues = [];

    // Torso Major Tilt Check (> 18° tilt / dy > 0.15)
    if (leftShoulder && rightShoulder && leftHip && rightHip) {
      const dy = leftShoulder.y - rightShoulder.y;
      if (dy > 0.15) {
        postureIssues.push({ code: 'TORSO_TILTED_RIGHT', severity: 'warning', messageKey: 'TORSO_TILTED_RIGHT' });
      } else if (dy < -0.15) {
        postureIssues.push({ code: 'TORSO_TILTED_LEFT', severity: 'warning', messageKey: 'TORSO_TILTED_LEFT' });
      }

      if (Math.abs(leftShoulder.y - rightShoulder.y) > torsoAlignment.maxShoulderAsymmetry) {
        postureIssues.push({ code: 'SHOULDER_ASYMMETRY', severity: 'warning', messageKey: 'SHOULDER_ASYMMETRY' });
      }
    }

    // Range of Motion Check: Only flag if arm started lowering before reaching full height
    const isArmStuckLow = maxElevation >= shoulderElevation.raisingStart && maxElevation < 45;
    if (isArmStuckLow && this.movementState === 'LOWERING' && !this.hasReachedTop) {
      if (activeSide === 'right' || (rightShoulderElev || 0) > (leftShoulderElev || 0)) {
        postureIssues.push({ code: 'NOT_ENOUGH_RANGE_RIGHT', severity: 'warning', messageKey: 'NOT_ENOUGH_RANGE_RIGHT' });
      } else if (activeSide === 'left' || (leftShoulderElev || 0) > (rightShoulderElev || 0)) {
        postureIssues.push({ code: 'NOT_ENOUGH_RANGE_LEFT', severity: 'warning', messageKey: 'NOT_ENOUGH_RANGE_LEFT' });
      } else {
        postureIssues.push({ code: 'NOT_ENOUGH_RANGE', severity: 'warning', messageKey: 'NOT_ENOUGH_RANGE' });
      }
    }

    // Major Elbow Flexion Check (< 85° bicep curl error)
    if (isLeftActive && leftElbowAngle !== null && leftElbowAngle < elbowFlexion.minElbowAngle) {
      postureIssues.push({ code: 'ELBOW_TOO_BENT_LEFT', severity: 'warning', messageKey: 'ELBOW_TOO_BENT_LEFT' });
    }
    if (isRightActive && rightElbowAngle !== null && rightElbowAngle < elbowFlexion.minElbowAngle) {
      postureIssues.push({ code: 'ELBOW_TOO_BENT_RIGHT', severity: 'warning', messageKey: 'ELBOW_TOO_BENT_RIGHT' });
    }

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
      if (this.hasReturnedToStart && maxElevation >= shoulderElevation.raisingStart) {
        newState = 'RAISING';
        this.cycleFrameCount = 1;
        this.hasReachedTop = false;
        this.hasPostureErrorInCurrentRep = false;
      } else if (maxElevation <= shoulderElevation.returnThreshold) {
        this.hasReturnedToStart = true;
      }
    } else if (this.movementState === 'RAISING') {
      this.cycleFrameCount++;
      if (maxElevation >= shoulderElevation.topEnter) {
        this.hasReachedTop = true;
        newState = 'TOP_POSITION';
      } else if (maxElevation < shoulderElevation.startAngle && !this.hasReachedTop) {
        newState = 'IDLE';
        this.hasReturnedToStart = true;
      }
    } else if (this.movementState === 'TOP_POSITION') {
      this.cycleFrameCount++;
      if (maxElevation < shoulderElevation.topExit || direction === 'DOWN') {
        newState = 'LOWERING';
      }
    } else if (this.movementState === 'LOWERING') {
      this.cycleFrameCount++;
      if (maxElevation <= shoulderElevation.returnThreshold) {
        if (this.hasReachedTop && this.cycleFrameCount >= 8) { // Require at least 8 frames for a complete real rep
          this.completedReps++;
          this.cycleFrameCount = 0;
          this.hasReachedTop = false;
          this.hasReturnedToStart = true;
          newState = 'COMPLETED_REP';
        } else {
          newState = 'IDLE';
          this.hasReturnedToStart = true;
        }
      } else if (maxElevation >= shoulderElevation.topEnter) {
        newState = 'TOP_POSITION';
      }
    } else if (this.movementState === 'COMPLETED_REP') {
      this.hasReturnedToStart = true;
      if (maxElevation >= shoulderElevation.raisingStart) {
        newState = 'RAISING';
        this.cycleFrameCount = 1;
        this.hasReachedTop = false;
        this.hasPostureErrorInCurrentRep = false;
      } else {
        newState = 'IDLE';
      }
    }

    this.movementState = newState;

    return this.buildOutput({
      leftShoulderElevation: leftShoulderElev,
      rightShoulderElevation: rightShoulderElev,
      rawLeftShoulderElevation: leftShoulderElev,
      rawRightShoulderElevation: rightShoulderElev,
      leftElbowAngle,
      rightElbowAngle,
      torsoTiltDegrees,
      leftAngularVelocity: Math.round(leftVelocity),
      rightAngularVelocity: Math.round(rightVelocity),
      activeSide,
      movementState: this.movementState,
      movementDirection: this.movementDirection,
      postureState: this.hasPostureErrorInCurrentRep ? 'NEEDS_ATTENTION' : postureState,
      postureIssues,
      completedReps: this.completedReps,
      currentRep: this.completedReps + 1,
      trackingConfidence,
      movementQuality: postureState === 'GOOD' ? 0.95 : 0.7,
    });
  }

  buildOutput(overrides = {}) {
    return {
      exercise: 'shoulder-raise',
      leftShoulderElevation: null,
      rightShoulderElevation: null,
      rawLeftShoulderElevation: null,
      rawRightShoulderElevation: null,
      leftElbowAngle: null,
      rightElbowAngle: null,
      torsoTiltDegrees: 0,
      leftAngularVelocity: 0,
      rightAngularVelocity: 0,
      activeSide: 'none',
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
