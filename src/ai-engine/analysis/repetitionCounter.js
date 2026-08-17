/**
 * AI Engine — Repetition Counter State Machine
 * Tracks repetition cycles (REST -> EXTENSION -> HOLD -> RETURN -> COMPLETE).
 */

export class RepetitionCounter {
  constructor(targetReps = 10) {
    this.targetReps = targetReps;
    this.completedReps = 0;
    this.state = 'REST';
  }

  update(_angle, _config) {
    return {
      reps: this.completedReps,
      state: this.state,
    };
  }

  reset() {
    this.completedReps = 0;
    this.state = 'REST';
  }
}
