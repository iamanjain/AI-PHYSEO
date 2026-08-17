import { POSE_LANDMARKS } from './landmarkUtils';
import { mapLandmarkToCanvasPixel } from './coordinateMapper';

export const UPPER_BODY_REQUIRED = [
  POSE_LANDMARKS.NOSE,
  POSE_LANDMARKS.LEFT_SHOULDER,
  POSE_LANDMARKS.RIGHT_SHOULDER,
  POSE_LANDMARKS.LEFT_ELBOW,
  POSE_LANDMARKS.RIGHT_ELBOW,
  POSE_LANDMARKS.LEFT_WRIST,
  POSE_LANDMARKS.RIGHT_WRIST,
];

export const FULL_BODY_REQUIRED = [
  POSE_LANDMARKS.NOSE,
  POSE_LANDMARKS.LEFT_SHOULDER,
  POSE_LANDMARKS.RIGHT_SHOULDER,
  POSE_LANDMARKS.LEFT_HIP,
  POSE_LANDMARKS.RIGHT_HIP,
  POSE_LANDMARKS.LEFT_KNEE,
  POSE_LANDMARKS.RIGHT_KNEE,
  POSE_LANDMARKS.LEFT_ANKLE,
  POSE_LANDMARKS.RIGHT_ANKLE,
  POSE_LANDMARKS.LEFT_FOOT_INDEX,
  POSE_LANDMARKS.RIGHT_FOOT_INDEX,
];

export function analyzeFraming(
  landmarks = [],
  cameraMode = 'upper-body',
  containerWidth = 640,
  containerHeight = 480,
  videoWidth = 1280,
  videoHeight = 720,
  isMirrored = true,
  fitMode = 'cover',
  visibilityThreshold = 0.35
) {
  if (!landmarks || landmarks.length === 0) {
    return { status: 'NO_PERSON', guidanceText: 'No person detected' };
  }

  const requiredIndices = cameraMode === 'full-body' ? FULL_BODY_REQUIRED : UPPER_BODY_REQUIRED;

  // Map landmarks to visible screen canvas pixels
  const mappedLandmarks = landmarks.map((lm) => {
    if (!lm) return null;
    const mapped = mapLandmarkToCanvasPixel(
      lm,
      containerWidth,
      containerHeight,
      videoWidth,
      videoHeight,
      isMirrored,
      fitMode
    );
    const score = lm.visibility ?? lm.presence ?? 1.0;
    const isVisible = score >= visibilityThreshold &&
      mapped.x >= 0 && mapped.x <= containerWidth &&
      mapped.y >= 0 && mapped.y <= containerHeight;

    return { ...mapped, isVisible, score };
  });

  // Check required landmark visibility inside visible screen space
  let visibleCount = 0;
  let minX = containerWidth, maxX = 0, minY = containerHeight, maxY = 0;

  requiredIndices.forEach((idx) => {
    const lm = mappedLandmarks[idx];
    if (lm && lm.isVisible) {
      visibleCount++;
      if (lm.x < minX) minX = lm.x;
      if (lm.x > maxX) maxX = lm.x;
      if (lm.y < minY) minY = lm.y;
      if (lm.y > maxY) maxY = lm.y;
    }
  });

  // If too many key landmarks are out of screen frame
  if (visibleCount < requiredIndices.length * 0.75) {
    if (cameraMode === 'full-body') {
      const feetIndices = [POSE_LANDMARKS.LEFT_ANKLE, POSE_LANDMARKS.RIGHT_ANKLE, POSE_LANDMARKS.LEFT_FOOT_INDEX, POSE_LANDMARKS.RIGHT_FOOT_INDEX];
      const feetVisible = feetIndices.some((idx) => mappedLandmarks[idx] && mappedLandmarks[idx].isVisible);
      if (!feetVisible) {
        return { status: 'FEET_NOT_VISIBLE', guidanceText: 'Make sure your feet are visible' };
      }
    }
    return { status: 'MOVE_FARTHER', guidanceText: 'Move farther back' };
  }

  const centerX = (minX + maxX) / 2;
  const bboxHeight = maxY - minY;

  // Spatial framing bounds checks
  if (centerX < containerWidth * 0.2) {
    return { status: 'MOVE_RIGHT', guidanceText: 'Move slightly right' };
  }
  if (centerX > containerWidth * 0.8) {
    return { status: 'MOVE_LEFT', guidanceText: 'Move slightly left' };
  }

  if (cameraMode === 'full-body') {
    if (bboxHeight > containerHeight * 0.95) {
      return { status: 'MOVE_FARTHER', guidanceText: 'Move farther back' };
    }
    if (bboxHeight < containerHeight * 0.35) {
      return { status: 'MOVE_CLOSER', guidanceText: 'Move slightly closer' };
    }
    return { status: 'FULL_BODY_READY', guidanceText: 'FULL BODY READY' };
  } else {
    // Upper body mode
    if (bboxHeight < containerHeight * 0.22) {
      return { status: 'MOVE_CLOSER', guidanceText: 'Move slightly closer' };
    }
    return { status: 'UPPER_BODY_READY', guidanceText: 'UPPER BODY READY' };
  }
}
