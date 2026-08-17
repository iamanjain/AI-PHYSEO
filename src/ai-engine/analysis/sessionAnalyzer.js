import { calculateAccuracy } from './accuracyCalculator.js';

/**
 * AI Engine — Session State Analyzer
 * Manages continuous exercise session metrics, valid rep counting, history records, and weighted accuracy scores.
 */
export class SessionAnalyzer {
  constructor() {
    this.reset();
  }

  reset(exerciseId = 'shoulder-raise') {
    this.sessionId = `session_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    this.exerciseId = exerciseId;
    this.startTime = null;
    this.endTime = null;
    this.totalFrames = 0;
    this.validFrames = 0;
    this.completedReps = 0;
    this.currentRep = 1;
    this.repHistory = [];
    
    this.postureScoreSum = 0;
    this.romScoreSum = 0;
    this.controlScoreSum = 0;
    this.trackingConfidenceSum = 0;

    this.postureIssuesCount = {
      torsoTiltLeft: 0,
      torsoTiltRight: 0,
      shoulderAsymmetry: 0,
      elbowBent: 0,
      movementTooFast: 0,
      insufficientTracking: 0,
    };

    this.lastAnalysis = null;
  }

  startSession(exerciseId = 'shoulder-raise') {
    this.reset(exerciseId);
    this.startTime = performance.now();
  }

  update(analysisResult) {
    if (!analysisResult) return this.getSnapshot();

    this.totalFrames++;
    this.lastAnalysis = analysisResult;

    const confidence = analysisResult.trackingConfidence ?? 1.0;
    this.trackingConfidenceSum += confidence;

    const isTrackingReliable = confidence >= 0.40;
    const isFramingValid = analysisResult.movementState !== 'INSUFFICIENT_DATA' && analysisResult.postureState !== 'INSUFFICIENT_DATA';

    if (isTrackingReliable && isFramingValid) {
      this.validFrames++;

      // Posture Score Frame Component
      const isPostureGood = analysisResult.postureState === 'GOOD';
      const postureScore = isPostureGood ? 1.0 : (analysisResult.postureIssues?.length ? 0.6 : 0.8);
      this.postureScoreSum += postureScore;

      // Track posture issue occurrences
      if (analysisResult.postureIssues && analysisResult.postureIssues.length > 0) {
        analysisResult.postureIssues.forEach((issue) => {
          if (issue.code === 'TORSO_TILTED_LEFT') this.postureIssuesCount.torsoTiltLeft++;
          if (issue.code === 'TORSO_TILTED_RIGHT') this.postureIssuesCount.torsoTiltRight++;
          if (issue.code === 'SHOULDER_ASYMMETRY') this.postureIssuesCount.shoulderAsymmetry++;
          if (issue.code && issue.code.startsWith('ELBOW_TOO_BENT')) this.postureIssuesCount.elbowBent++;
          if (issue.code === 'MOVEMENT_TOO_FAST') this.postureIssuesCount.movementTooFast++;
        });
      }

      // Range of Motion Score Frame Component
      const activeAngle = Math.max(
        analysisResult.leftElbowAngle || 0,
        analysisResult.rightElbowAngle || 0,
        analysisResult.leftShoulderElevation || 0,
        analysisResult.rightShoulderElevation || 0
      );
      const romScore = Math.min(1.0, activeAngle / 65);
      this.romScoreSum += romScore;

      // Movement Control Score Frame Component
      const isFast = analysisResult.postureIssues?.some((i) => i.code === 'MOVEMENT_TOO_FAST');
      const controlScore = isFast ? 0.6 : 1.0;
      this.controlScoreSum += controlScore;

      // Repetition state sync - only register reps when tracking & framing are genuinely valid
      if (analysisResult.completedReps !== undefined && analysisResult.completedReps > this.completedReps) {
        this.completedReps = analysisResult.completedReps;
        this.currentRep = this.completedReps + 1;

        // Record Rep History Object
        this.repHistory.push({
          repNumber: this.completedReps,
          activeSide: analysisResult.activeSide || 'both',
          maxAngle: Math.round(activeAngle),
          score: Math.min(100, Math.round(100 - (analysisResult.postureIssues?.length || 0) * 15)),
          valid: analysisResult.postureState === 'GOOD',
          issues: analysisResult.postureIssues || [],
          timestamp: performance.now(),
        });
      }
    } else {
      this.postureIssuesCount.insufficientTracking++;
    }

    return this.getSnapshot();
  }

  getSnapshot() {
    const accuracy = calculateAccuracy({
      validFrames: this.validFrames,
      _totalFrames: this.totalFrames,
      postureScoreSum: this.postureScoreSum,
      romScoreSum: this.romScoreSum,
      controlScoreSum: this.controlScoreSum,
    });

    const elapsedSeconds = this.startTime
      ? Math.round((performance.now() - this.startTime) / 1000)
      : 0;

    const avgConfidence = this.totalFrames > 0 ? (this.trackingConfidenceSum / this.totalFrames) : 1.0;

    return {
      sessionId: this.sessionId,
      exerciseId: this.exerciseId || 'shoulder-raise',
      startTime: this.startTime,
      endTime: this.endTime,
      durationSeconds: elapsedSeconds,
      totalFrames: this.totalFrames,
      validFrames: this.validFrames,
      completedReps: this.completedReps,
      validReps: this.repHistory.filter((r) => r.valid).length,
      invalidReps: this.repHistory.filter((r) => !r.valid).length,
      currentRep: this.currentRep,
      repHistory: this.repHistory,
      accuracy,
      trackingConfidence: avgConfidence,
      postureIssuesCount: this.postureIssuesCount,
      currentMovementState: this.lastAnalysis?.movementState || 'IDLE',
      currentMovementDirection: this.lastAnalysis?.movementDirection || 'STATIONARY',
      currentPostureState: this.lastAnalysis?.postureState || 'INSUFFICIENT_DATA',
      currentActiveSide: this.lastAnalysis?.activeSide || 'none',
      currentIssues: this.lastAnalysis?.postureIssues || [],
    };
  }

  endSession() {
    this.endTime = performance.now();
    return this.getSnapshot();
  }

  getSessionSummary() {
    return this.getSnapshot();
  }
}
