/**
 * AI Engine — Hand Landmark Confidence Filter
 * Inspects landmark confidence scores to flag reliable vs low-confidence keypoints without removing raw coordinates.
 */

export function isHandLandmarkReliable(landmark, threshold = 0.35) {
  if (!landmark) return false;
  const score = landmark.visibility ?? landmark.presence ?? 1.0;
  return score >= threshold;
}

export function filterHandLandmarks(landmarks = [], threshold = 0.35) {
  if (!landmarks || landmarks.length === 0) return [];

  return landmarks.map((lm, index) => {
    if (!lm) {
      return { x: 0, y: 0, z: 0, visibility: 0, reliable: false, index };
    }
    const reliable = isHandLandmarkReliable(lm, threshold);
    return {
      ...lm,
      reliable,
      index,
    };
  });
}
