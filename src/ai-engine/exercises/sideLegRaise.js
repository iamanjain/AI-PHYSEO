import { POSE_LANDMARKS } from '../pose/landmarkUtils';
import { calculateAngle } from '../geometry/angleCalculator';
import { SIDE_LEG_RAISE_CONFIG } from './config/sideLegRaiseConfig';

/**
 * AI Engine — Side Leg Raise Biomechanical & Repetition Analyzer
 * Tracks standing unilateral hip abduction (raising leg sideways).
 * Fully isolated with zero-phantom-rep hard resets.
 */
export class SideLegRaiseAnalyzer {
  constructor(config = SIDE_LEG_RAISE_CONFIG) {
    this.config = config;

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
      this.reset();
      return this.buildOutput({
        trackingConfidence: 0,
        postureState: 'INSUFFICIENT_DATA',
        movementState: 'INSUFFICIENT_DATA',
        postureIssues: [{ code: 'INSUFFICIENT_TRACKING', severity: 'warning', messageKey: 'INSUFFICIENT_TRACKING' }],
      });
    }

    const { hipAbduction, torsoAlignment, repetitionRules } = this.config;

    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
    const leftKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
    const rightKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];
    const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
    const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];

    const minVis = 0.25;
    const isLeftHipVis = leftHip && (leftHip.visibility ?? leftHip.presence ?? 1.0) >= minVis;
    const isRightHipVis = rightHip && (rightHip.visibility ?? rightHip.presence ?? 1.0) >= minVis;

    const requiredKeys = [leftShoulder, rightShoulder, leftHip, rightHip, leftKnee, rightKnee];
    const visibleCount = requiredKeys.reduce((acc, lm) => {
      if (lm && (lm.visibility ?? lm.presence ?? 1.0) >= minVis) return acc + 1;
      return acc;
    }, 0);

    const trackingConfidence = Math.round((visibleCount / requiredKeys.length) * 100) / 100;

    if (!isLeftHipVis || !isRightHipVis || visibleCount < 3) {
      this.reset();
      return this.buildOutput({
        leftShoulderElevation: null,
        rightShoulderElevation: null,
        leftElbowAngle: null,
        rightElbowAngle: null,
        torsoTiltDegrees: 0,
        trackingConfidence,
        postureState: 'INSUFFICIENT_DATA',
        movementState: 'INSUFFICIENT_DATA',
        postureIssues: [{ code: 'STEP_BACK_FOR_FRAMING', severity: 'warning', messageKey: 'STEP_BACK_FOR_FRAMING' }],
      });
    }

    // Leg angle relative to vertical torso reference
    const dummyLeftShoulder = leftShoulder || { x: leftHip.x, y: leftHip.y - 0.4, z: leftHip.z };
    const dummyRightShoulder = rightShoulder || { x: rightHip.x, y: rightHip.y - 0.4, z: rightHip.z };
    const leftTarget = leftAnkle || leftKnee || { x: leftHip.x, y: leftHip.y + 0.4, z: leftHip.z };
    const rightTarget = rightAnkle || rightKnee || { x: rightHip.x, y: rightHip.y + 0.4, z: rightHip.z };

    const leftLegAbduct = calculateAngle(dummyLeftShoulder, leftHip, leftTarget, minVis);
    const rightLegAbduct = calculateAngle(dummyRightShoulder, rightHip, rightTarget, minVis);

    // Convert straight vertical (180 deg) into displacement angle from neutral (0 deg)
    const leftAngleDisp = leftLegAbduct !== null ? Math.abs(180 - leftLegAbduct) : 0;
    const rightAngleDisp = rightLegAbduct !== null ? Math.abs(180 - rightLegAbduct) : 0;

    let torsoTiltDegrees = 0;
    if (leftShoulder && rightShoulder) {
      const dy = leftShoulder.y - rightShoulder.y;
      const dx = Math.abs(leftShoulder.x - rightShoulder.x) || 0.001;
      torsoTiltDegrees = Math.round(Math.abs(Math.atan2(dy, dx) * (180 / Math.PI)) * 10) / 10;
    }

    let leftVelocity = 0;
    let rightVelocity = 0;

    if (this.prevTimestamp && timestamp > this.prevTimestamp) {
      const dt = (timestamp - this.prevTimestamp) / 1000;
      if (dt > 0 && dt < 1.0) {
        if (leftAngleDisp !== null && this.prevLeftAngle !== null) {
          leftVelocity = (leftAngleDisp - this.prevLeftAngle) / dt;
        }
        if (rightAngleDisp !== null && this.prevRightAngle !== null) {
          rightVelocity = (rightAngleDisp - this.prevRightAngle) / dt;
        }
      }
    }

    this.prevLeftAngle = leftAngleDisp;
    this.prevRightAngle = rightAngleDisp;
    this.prevTimestamp = timestamp;

    const maxLegDisplacement = Math.max(leftAngleDisp, rightAngleDisp);
    const activeVel = Math.abs(leftVelocity) > Math.abs(rightVelocity) ? leftVelocity : rightVelocity;

    let direction = 'STATIONARY';
    if (activeVel > repetitionRules.movementDeadZone) {
      direction = 'UP';
    } else if (activeVel < -repetitionRules.movementDeadZone) {
      direction = 'DOWN';
    }
    this.movementDirection = direction;

    let activeSide = 'both';
    if (leftAngleDisp >= hipAbduction.raisingStart && rightAngleDisp >= hipAbduction.raisingStart) activeSide = 'both';
    else if (leftAngleDisp >= hipAbduction.raisingStart) activeSide = 'left';
    else if (rightAngleDisp >= hipAbduction.raisingStart) activeSide = 'right';

    // Initial raised entry guard
    if (!this.isInitialRaisedEntryHandled) {
      if (maxLegDisplacement >= hipAbduction.raisingStart) {
        this.isInitialRaisedEntryHandled = true;
        this.movementState = 'ARM_RAISED_INITIAL';
        return this.buildOutput({
          leftShoulderElevation: leftAngleDisp,
          rightShoulderElevation: rightAngleDisp,
          leftElbowAngle: null,
          rightElbowAngle: null,
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
      if (maxLegDisplacement <= hipAbduction.returnThreshold) {
        this.movementState = 'IDLE';
        this.hasReturnedToStart = true;
      } else {
        return this.buildOutput({
          leftShoulderElevation: leftAngleDisp,
          rightShoulderElevation: rightAngleDisp,
          leftElbowAngle: null,
          rightElbowAngle: null,
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

    const postureIssues = [];

    if (leftShoulder && rightShoulder) {
      const dy = leftShoulder.y - rightShoulder.y;
      if (Math.abs(dy) > torsoAlignment.maxShoulderAsymmetry) {
        postureIssues.push({ code: 'TORSO_TILTED_LEFT', severity: 'warning', messageKey: 'TORSO_TILTED_LEFT' });
      }
    }

    if (Math.abs(activeVel) > repetitionRules.maxLegVelocity) {
      postureIssues.push({ code: 'MOVEMENT_TOO_FAST', severity: 'warning', messageKey: 'MOVEMENT_TOO_FAST' });
    }

    const postureState = postureIssues.length > 0 ? 'NEEDS_ATTENTION' : 'GOOD';
    if (postureState !== 'GOOD') {
      this.hasPostureErrorInCurrentRep = true;
    }

    let newState = this.movementState;

    if (this.movementState === 'IDLE') {
      if (this.hasReturnedToStart && maxLegDisplacement >= hipAbduction.raisingStart) {
        newState = 'RAISING';
        this.cycleFrameCount = 1;
        this.hasReachedTop = false;
        this.hasPostureErrorInCurrentRep = false;
      } else if (maxLegDisplacement <= hipAbduction.returnThreshold) {
        this.hasReturnedToStart = true;
      }
    } else if (this.movementState === 'RAISING') {
      this.cycleFrameCount++;
      if (maxLegDisplacement >= hipAbduction.topEnter) {
        this.hasReachedTop = true;
        newState = 'TOP_POSITION';
      } else if (maxLegDisplacement < hipAbduction.startAngle && !this.hasReachedTop) {
        newState = 'IDLE';
        this.hasReturnedToStart = true;
      }
    } else if (this.movementState === 'TOP_POSITION') {
      this.cycleFrameCount++;
      if (maxLegDisplacement < hipAbduction.topExit || direction === 'DOWN') {
        newState = 'LOWERING';
      }
    } else if (this.movementState === 'LOWERING') {
      this.cycleFrameCount++;
      if (maxLegDisplacement <= hipAbduction.returnThreshold) {
        if (this.hasReachedTop) {
          this.completedReps++;
          this.cycleFrameCount = 0;
          this.hasReachedTop = false;
          this.hasReturnedToStart = true;
          newState = 'COMPLETED_REP';
        } else {
          newState = 'IDLE';
          this.hasReturnedToStart = true;
        }
      } else if (maxLegDisplacement >= hipAbduction.topEnter) {
        newState = 'TOP_POSITION';
      }
    } else if (this.movementState === 'COMPLETED_REP') {
      this.hasReturnedToStart = true;
      if (maxLegDisplacement >= hipAbduction.raisingStart) {
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
      leftShoulderElevation: Math.round(leftAngleDisp),
      rightShoulderElevation: Math.round(rightAngleDisp),
      leftElbowAngle: null,
      rightElbowAngle: null,
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
      exercise: 'side-leg-raise',
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
