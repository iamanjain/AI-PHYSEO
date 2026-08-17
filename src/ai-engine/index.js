/**
 * AI Engine — Main Entry Facade
 * Decouples computer vision analysis, geometry calculation, exercise analysis, rep state machines, voice assistance, and session reports from React UI.
 * 
 * Features:
 * - 100% Modular exercise dispatcher with safe error boundaries
 * - Independent analyzer instances for Shoulder Raise, Bicep Curls, Side Leg Raise, Knee Extension
 */

import { HandDetectorEngine } from './hands/handDetector.js';
import { HandLandmarkSmoother } from './hands/handLandmarkSmoother.js';
import { filterHandLandmarks } from './hands/handLandmarkFilter.js';
import { ShoulderRaiseAnalyzer } from './exercises/shoulderRaise.js';
import { BicepCurlAnalyzer } from './exercises/bicepCurl.js';
import { SideLegRaiseAnalyzer } from './exercises/sideLegRaise.js';
import { KneeExtensionAnalyzer } from './exercises/kneeExtension.js';
import { SessionAnalyzer } from './analysis/sessionAnalyzer.js';
import { VoiceAssistant } from './voice/voiceAssistant.js';
import { generateSessionReport } from './analysis/reportGenerator.js';
import { saveSessionReport, getSessionReport, getAllSessionReports } from './storage/sessionStorage.js';
export { getSessionReport, getAllSessionReports };

export * from './pose/poseDetector.js';
export * from './pose/landmarkUtils.js';
export * from './pose/landmarkFilter.js';
export * from './pose/landmarkSmoother.js';
export * from './pose/coordinateMapper.js';
export * from './pose/framingAnalyzer.js';
export * from './hands/handDetector.js';
export * from './hands/handLandmarkUtils.js';
export * from './hands/handLandmarkFilter.js';
export * from './hands/handLandmarkSmoother.js';
export * from './geometry/vectorUtils.js';
export * from './geometry/angleCalculator.js';
export * from './exercises/config/shoulderRaiseConfig.js';
export * from './exercises/config/bicepCurlConfig.js';
export * from './exercises/config/sideLegRaiseConfig.js';
export * from './exercises/config/kneeExtensionConfig.js';
export * from './exercises/shoulderRaise.js';
export * from './exercises/bicepCurl.js';
export * from './exercises/sideLegRaise.js';
export * from './exercises/kneeExtension.js';
export * from './analysis/accuracyCalculator.js';
export * from './analysis/sessionAnalyzer.js';
export * from './analysis/reportGenerator.js';
export * from './analysis/postureAnalyzer.js';
export * from './analysis/repetitionCounter.js';
export * from './feedback/feedbackEngine.js';
export * from './feedback/feedbackMessages.js';
export * from './voice/feedbackMessages.js';
export * from './voice/voiceAssistant.js';
export * from './storage/sessionStorage.js';

// Stateful engine instances persistent across frame analysis calls
const handDetectorInstance = new HandDetectorEngine();
const handSmootherInstance = new HandLandmarkSmoother(0.65);

// Modular Exercise Analyzers
const shoulderRaiseAnalyzerInstance = new ShoulderRaiseAnalyzer();
const bicepCurlAnalyzerInstance = new BicepCurlAnalyzer();
const sideLegRaiseAnalyzerInstance = new SideLegRaiseAnalyzer();
const kneeExtensionAnalyzerInstance = new KneeExtensionAnalyzer();

const sessionAnalyzerInstance = new SessionAnalyzer();
const voiceAssistantInstance = new VoiceAssistant('mixed');

// Cached hand landmarks retained across throttled frames to prevent blinking
let cachedLeftHandLandmarks = null;
let cachedRightHandLandmarks = null;
let cachedLeftHandednessScore = 0;
let cachedRightHandednessScore = 0;

// Diagnostics FPS Counters
let poseFrameCount = 0;
let handFrameCount = 0;
let lastFpsResetTime = performance.now();
let currentPoseFps = 0;
let currentHandFps = 0;

export async function initHandDetector() {
  if (handDetectorInstance.isInitialized) return true;
  return await handDetectorInstance.initialize();
}

export function closeHandDetector() {
  handDetectorInstance.close();
  handSmootherInstance.reset();
  cachedLeftHandLandmarks = null;
  cachedRightHandLandmarks = null;
  cachedLeftHandednessScore = 0;
  cachedRightHandednessScore = 0;
}

export function startExerciseSession(exerciseId = 'shoulder-raise') {
  resetExerciseSession(exerciseId);
  sessionAnalyzerInstance.startSession();
  poseFrameCount = 0;
  handFrameCount = 0;
  lastFpsResetTime = performance.now();
  currentPoseFps = 0;
  currentHandFps = 0;
}

export function resetExerciseSession(exerciseId) {
  switch (exerciseId) {
    case 'shoulder-raise':
      shoulderRaiseAnalyzerInstance.reset();
      break;
    case 'bicep-curls':
      bicepCurlAnalyzerInstance.reset();
      break;
    case 'side-leg-raise':
      sideLegRaiseAnalyzerInstance.reset();
      break;
    case 'knee-extension':
      kneeExtensionAnalyzerInstance.reset();
      break;
    default:
      shoulderRaiseAnalyzerInstance.reset();
      bicepCurlAnalyzerInstance.reset();
      sideLegRaiseAnalyzerInstance.reset();
      kneeExtensionAnalyzerInstance.reset();
      break;
  }
  sessionAnalyzerInstance.reset();
}

export function endExerciseSession() {
  const summary = sessionAnalyzerInstance.endSession();
  const report = generateSessionReport(summary);
  saveSessionReport(report);
  voiceAssistantInstance.stop();
  return report;
}

export function getExerciseSessionSummary() {
  return sessionAnalyzerInstance.getSessionSummary();
}

export function processVoiceFeedback(analysisResult) {
  return voiceAssistantInstance.processFeedback(analysisResult);
}

export function stopVoiceAssistant() {
  voiceAssistantInstance.stop();
}

export function setVoiceAssistantEnabled(enabled) {
  voiceAssistantInstance.setEnabled(enabled);
}

export function isVoiceSupported() {
  return voiceAssistantInstance.isSupported();
}

export function analyzeUnifiedFrame({
  videoElement,
  timestamp = performance.now(),
  exerciseId = 'shoulder-raise',
  poseLandmarks = null,
  enableHandTracking = false,
  handThrottleInterval = 3,
  frameCount = 0,
}) {
  // Diagnostics FPS measurement
  poseFrameCount++;
  const now = performance.now();
  if (now - lastFpsResetTime >= 1000) {
    currentPoseFps = Math.round((poseFrameCount * 1000) / (now - lastFpsResetTime));
    currentHandFps = Math.round((handFrameCount * 1000) / (now - lastFpsResetTime));
    poseFrameCount = 0;
    handFrameCount = 0;
    lastFpsResetTime = now;
  }

  // Hand Detection execution if enabled
  if (enableHandTracking && handDetectorInstance.isInitialized && videoElement) {
    if (frameCount % handThrottleInterval === 0) {
      const handResult = handDetectorInstance.detect(videoElement, timestamp);
      handFrameCount++;

      let foundLeft = false;
      let foundRight = false;

      if (handResult && handResult.landmarks && handResult.landmarks.length > 0) {
        handResult.landmarks.forEach((rawHand, idx) => {
          const handednessInfo = handResult.handednesses?.[idx]?.[0];
          const label = handednessInfo?.categoryName;
          const score = handednessInfo?.score || 0;

          const filtered = filterHandLandmarks(rawHand, 0.35);
          const smoothed = handSmootherInstance.smoothHand(filtered, label);

          if (label === 'Left') {
            cachedLeftHandLandmarks = smoothed;
            cachedLeftHandednessScore = Math.round(score * 100);
            foundLeft = true;
          } else if (label === 'Right') {
            cachedRightHandLandmarks = smoothed;
            cachedRightHandednessScore = Math.round(score * 100);
            foundRight = true;
          }
        });
      }

      if (!foundLeft) {
        cachedLeftHandLandmarks = null;
        cachedLeftHandednessScore = 0;
        handSmootherInstance.smoothHand(null, 'Left');
      }
      if (!foundRight) {
        cachedRightHandLandmarks = null;
        cachedRightHandednessScore = 0;
        handSmootherInstance.smoothHand(null, 'Right');
      }
    }
  } else {
    cachedLeftHandLandmarks = null;
    cachedRightHandLandmarks = null;
    cachedLeftHandednessScore = 0;
    cachedRightHandednessScore = 0;
    handSmootherInstance.reset();
  }

  // Modular Biomechanical Exercise Dispatch with Safe Error Boundary
  let exerciseAnalysis = null;
  try {
    switch (exerciseId) {
      case 'shoulder-raise':
        exerciseAnalysis = shoulderRaiseAnalyzerInstance.analyze(poseLandmarks || [], timestamp);
        break;
      case 'bicep-curls':
        exerciseAnalysis = bicepCurlAnalyzerInstance.analyze(poseLandmarks || [], timestamp);
        break;
      case 'side-leg-raise':
        exerciseAnalysis = sideLegRaiseAnalyzerInstance.analyze(poseLandmarks || [], timestamp);
        break;
      case 'knee-extension':
        exerciseAnalysis = kneeExtensionAnalyzerInstance.analyze(poseLandmarks || [], timestamp);
        break;
      default:
        exerciseAnalysis = shoulderRaiseAnalyzerInstance.analyze(poseLandmarks || [], timestamp);
        break;
    }
  } catch (err) {
    console.error(`Error in exercise analyzer [${exerciseId}]:`, err);
    exerciseAnalysis = {
      exercise: exerciseId,
      trackingConfidence: poseLandmarks ? 0.7 : 0,
      movementState: 'IDLE',
      movementDirection: 'STATIONARY',
      postureState: 'GOOD',
      postureIssues: [],
      activeSide: 'both',
      completedReps: 0,
      currentRep: 1,
    };
  }

  // Update Session State Analyzer
  const sessionSnapshot = sessionAnalyzerInstance.update(exerciseAnalysis);

  // Return structured unified output object
  return {
    exerciseId,
    movement: {
      state: exerciseAnalysis.movementState,
      direction: exerciseAnalysis.movementDirection,
      activeSide: exerciseAnalysis.activeSide,
    },
    angles: {
      leftShoulderElevation: exerciseAnalysis.leftShoulderElevation,
      rightShoulderElevation: exerciseAnalysis.rightShoulderElevation,
      leftElbowFlexion: exerciseAnalysis.leftElbowAngle,
      rightElbowFlexion: exerciseAnalysis.rightElbowAngle,
      torsoTiltDegrees: exerciseAnalysis.torsoTiltDegrees,
    },
    posture: {
      state: exerciseAnalysis.postureState,
      issues: exerciseAnalysis.postureIssues || [],
    },
    repetition: {
      completedReps: sessionSnapshot.completedReps,
      currentRep: sessionSnapshot.currentRep,
      currentRepValid: exerciseAnalysis.postureState === 'GOOD',
      repHistory: sessionSnapshot.repHistory,
    },
    accuracy: sessionSnapshot.accuracy,
    tracking: {
      confidence: exerciseAnalysis.trackingConfidence,
      poseFps: currentPoseFps,
      handFps: currentHandFps,
    },
    poseLandmarks,
    leftHandLandmarks: cachedLeftHandLandmarks,
    rightHandLandmarks: cachedRightHandLandmarks,
    leftHandednessScore: cachedLeftHandednessScore,
    rightHandednessScore: cachedRightHandednessScore,
    timestamp,
  };
}

export function resetExerciseAnalyzer(exerciseId) {
  resetExerciseSession(exerciseId);
}
