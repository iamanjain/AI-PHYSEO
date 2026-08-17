/**
 * AI Engine — Landmark Confidence Filter
 * Inspects landmark visibility and presence score to determine keypoint reliability.
 */

export function filterLandmarkConfidence(landmarks = [], threshold = 0.4) {
  if (!landmarks || landmarks.length === 0) return [];

  return landmarks.map((lm, index) => {
    if (!lm) {
      return { x: 0, y: 0, z: 0, visibility: 0, reliable: false, index };
    }
    const score = lm.visibility ?? lm.presence ?? 1.0;
    const reliable = score >= threshold;
    return {
      ...lm,
      reliable,
      index,
    };
  });
}
