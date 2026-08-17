/**
 * AI Engine — Hand Landmark Temporal Smoother
 * Independent EMA temporal smoothing for left and right hand 21-point landmark arrays.
 * Formula: smoothed = alpha * current + (1 - alpha) * previous
 */

export class HandLandmarkSmoother {
  constructor(alpha = 0.65) {
    this.alpha = alpha;
    this.prevLeftHand = null;
    this.prevRightHand = null;
  }

  setAlpha(newAlpha) {
    this.alpha = newAlpha;
  }

  smoothHand(currentLandmarks, handType = 'Left') {
    if (!currentLandmarks || currentLandmarks.length === 0) {
      if (handType === 'Left') this.prevLeftHand = null;
      else this.prevRightHand = null;
      return null;
    }

    const prevLandmarks = handType === 'Left' ? this.prevLeftHand : this.prevRightHand;

    if (!prevLandmarks || prevLandmarks.length !== currentLandmarks.length) {
      const initial = currentLandmarks.map((lm) => ({ ...lm }));
      if (handType === 'Left') this.prevLeftHand = initial;
      else this.prevRightHand = initial;
      return initial;
    }

    const smoothed = currentLandmarks.map((curr, idx) => {
      const prev = prevLandmarks[idx];
      if (!curr || !prev) return curr;

      const smX = this.alpha * curr.x + (1 - this.alpha) * prev.x;
      const smY = this.alpha * curr.y + (1 - this.alpha) * prev.y;
      const smZ = curr.z !== undefined && prev.z !== undefined
        ? this.alpha * curr.z + (1 - this.alpha) * prev.z
        : curr.z;

      return {
        ...curr,
        x: smX,
        y: smY,
        z: smZ,
      };
    });

    if (handType === 'Left') this.prevLeftHand = smoothed;
    else this.prevRightHand = smoothed;

    return smoothed;
  }

  reset() {
    this.prevLeftHand = null;
    this.prevRightHand = null;
  }
}
