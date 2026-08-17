/**
 * AI Engine — Exercise Accuracy Engine
 * Calculates weighted posture, movement, range of motion, and overall accuracy scores (0 - 100).
 * Does not unfairly penalize temporary tracking loss, but accurately reflects real performance.
 */

export function calculateAccuracy({
  validFrames = 0,
  _totalFrames = 0,
  postureScoreSum = 0,
  romScoreSum = 0,
  controlScoreSum = 0,
}) {
  if (validFrames === 0) {
    return {
      overall: 0,
      posture: 0,
      movement: 0,
      rangeOfMotion: 0,
    };
  }

  const avgPosture = Math.min(100, Math.max(0, Math.round((postureScoreSum / validFrames) * 100)));
  const avgRom = Math.min(100, Math.max(0, Math.round((romScoreSum / validFrames) * 100)));
  const avgMovement = Math.min(100, Math.max(0, Math.round((controlScoreSum / validFrames) * 100)));

  // Weighted overall calculation: 40% ROM, 35% Posture, 25% Movement Control
  const overall = Math.round(avgRom * 0.40 + avgPosture * 0.35 + avgMovement * 0.25);

  return {
    overall: Math.min(100, Math.max(0, overall)),
    posture: avgPosture,
    movement: avgMovement,
    rangeOfMotion: avgRom,
  };
}
