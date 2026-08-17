/**
 * AI Engine — Temporal Landmark Smoother
 * Uses Exponential Moving Average (EMA) filtering to eliminate skeleton jitter.
 * Formula: smoothed = alpha * current + (1 - alpha) * previous
 */

export class LandmarkSmoother {
  constructor(alpha = 0.65) {
    this.alpha = alpha;
    this.prevLandmarks = null;
  }

  setAlpha(newAlpha) {
    this.alpha = newAlpha;
  }

  smooth(currentLandmarks = []) {
    if (!currentLandmarks || currentLandmarks.length === 0) {
      this.reset();
      return [];
    }

    if (!this.prevLandmarks || this.prevLandmarks.length !== currentLandmarks.length) {
      this.prevLandmarks = currentLandmarks.map((lm) => ({ ...lm }));
      return this.prevLandmarks;
    }

    const smoothed = currentLandmarks.map((curr, idx) => {
      const prev = this.prevLandmarks[idx];
      if (!curr || !prev) return curr;

      // Apply EMA smoothing to 2D/3D coordinates
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

    this.prevLandmarks = smoothed;
    return smoothed;
  }

  reset() {
    this.prevLandmarks = null;
  }
}
