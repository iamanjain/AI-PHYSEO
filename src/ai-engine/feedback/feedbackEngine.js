/**
 * AI Engine — Feedback Engine Dispatcher
 * Selects appropriate visual/auditory feedback based on posture evaluation.
 */

import { FEEDBACK_MESSAGES } from './feedbackMessages.js';

export function determineFeedback(postureResult) {
  if (!postureResult || postureResult.isAligned) {
    return FEEDBACK_MESSAGES.GOOD_FORM;
  }
  return FEEDBACK_MESSAGES.KEEP_TORSO_STABLE;
}
