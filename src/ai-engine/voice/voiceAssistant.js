import { getFeedbackText } from './feedbackMessages.js';

/**
 * AI Engine — Local Event-Driven & Proactive Real-Coach Voice Assistant Engine
 * Non-blocking, event-driven speech synthesis using window.speechSynthesis.
 * 
 * Features:
 * - Proactive Inactivity Coaching: If user is stationary in any step for 1.5-2 seconds,
 *   the AI coach automatically instructs them on the exact next movement to perform.
 * - Instant Initial Readiness: As soon as user steps into frame, announces good posture and tells them to start.
 * - Zero audio lag: Immediately interrupts with next step guidance.
 * - Dynamic selection of natural Indian female Hindi/Hinglish voices.
 */

const ISSUE_PRIORITY = {
  INSUFFICIENT_TRACKING: 1,
  STEP_BACK_FOR_FRAMING: 1,
  MOVE_CLOSER: 2,
  MOVE_FARTHER: 2,
  REP_COMPLETE_DYNAMIC: 3,
  GOOD_REP: 3,
  READY_TO_START_BICEP: 4,
  READY_TO_START_SHOULDER: 4,
  READY_TO_START: 4,
  PROMPT_LOWER_BICEP: 4,
  PROMPT_LOWER_SHOULDER: 4,
  PROMPT_NEXT_REP_BICEP: 4,
  PROMPT_NEXT_REP_SHOULDER: 4,
  PROMPT_FINISH_LOWERING: 4,
  RAISING_BOTH: 4,
  TOP_POSITION_HOLD: 4,
  LOWERING_DOWN: 4,
  RAISING_BICEP_CURLS: 4,
  HOLD_BICEP_CURLS: 4,
  LOWERING_BICEP_CURLS: 4,
  RAISING_SIDE_LEG_RAISE: 4,
  HOLD_SIDE_LEG_RAISE: 4,
  LOWERING_SIDE_LEG_RAISE: 4,
  RAISING_KNEE_EXTENSION: 4,
  HOLD_KNEE_EXTENSION: 4,
  LOWERING_KNEE_EXTENSION: 4,
  TORSO_TILTED_LEFT: 5,
  TORSO_TILTED_RIGHT: 5,
  SHOULDER_ASYMMETRY: 5,
  ELBOW_FLARE: 5,
  ELBOW_TOO_BENT_LEFT: 6,
  ELBOW_TOO_BENT_RIGHT: 6,
  MOVEMENT_TOO_FAST: 7,
};

export class VoiceAssistant {
  constructor(language = 'mixed') {
    this.language = language;
    this.isEnabled = true;
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.availableVoices = [];
    
    // Internal Speech & Timing State
    this.isSpeaking = false;
    this.currentMessageKey = null;
    this.lastMessageKey = null;
    this.lastMessageTimestamp = 0;
    this.minimumFeedbackInterval = 1200; // ms cooldown
    this.lastSpokenRep = 0;
    this.activeUtterance = null;

    // Proactive Coach Dwell State
    this.lastObservedState = 'IDLE';
    this.stateEnteredTimestamp = performance.now();
    this.hasSpokenForCurrentDwell = false;
    this.wasFramingMissing = true;
    this.hasSpokenInitialReady = false;

    this.initVoices();
  }

  initVoices() {
    if (!this.synth) return;
    const loadVoices = () => {
      try {
        this.availableVoices = this.synth.getVoices() || [];
      } catch {
        this.availableVoices = [];
      }
    };
    loadVoices();
    if (typeof window !== 'undefined' && 'onvoiceschanged' in this.synth) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  isSupported() {
    return !!(typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis);
  }

  setLanguage(lang) {
    this.language = lang;
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  unlockAudio() {
    if (!this.isSupported() || !this.synth) return;
    try {
      this.initVoices();
      if (this.synth.speaking) return;
      const blankUtterance = new SpeechSynthesisUtterance('');
      blankUtterance.volume = 0.01;
      this.synth.speak(blankUtterance);
    } catch {
      // safe ignore
    }
  }

  findBestFemaleIndianVoice() {
    if (!this.availableVoices || this.availableVoices.length === 0) {
      if (this.synth) {
        this.availableVoices = this.synth.getVoices() || [];
      }
    }

    const voices = this.availableVoices;
    if (!voices || voices.length === 0) return null;

    const femaleKeywords = ['swara', 'heera', 'neerja', 'veena', 'kiran', 'female', 'woman', 'girl', 'google हिन्दी', 'google hindi'];

    const hiFemale = voices.find((v) => {
      const langMatch = v.lang && (v.lang.includes('hi') || v.lang.includes('hi-IN') || v.lang.includes('hi_IN'));
      const nameLower = (v.name || '').toLowerCase();
      const isFemale = femaleKeywords.some((kw) => nameLower.includes(kw));
      return langMatch && isFemale;
    });
    if (hiFemale) return hiFemale;

    const hiAny = voices.find((v) => v.lang && (v.lang.includes('hi') || v.lang.includes('hi-IN')));
    if (hiAny) return hiAny;

    const enInFemale = voices.find((v) => {
      const langMatch = v.lang && (v.lang.includes('en-IN') || v.lang.includes('en_IN'));
      const nameLower = (v.name || '').toLowerCase();
      const isFemale = femaleKeywords.some((kw) => nameLower.includes(kw));
      return langMatch && isFemale;
    });
    if (enInFemale) return enInFemale;

    const enInAny = voices.find((v) => v.lang && (v.lang.includes('en-IN') || v.lang.includes('en_IN')));
    if (enInAny) return enInAny;

    const genericFemale = voices.find((v) => {
      const nameLower = (v.name || '').toLowerCase();
      return femaleKeywords.some((kw) => nameLower.includes(kw));
    });
    if (genericFemale) return genericFemale;

    return voices[0] || null;
  }

  stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // ignore cancel error
      }
    }
    this.isSpeaking = false;
    this.currentMessageKey = null;
    this.activeUtterance = null;
  }

  processFeedback(analysisResult) {
    if (!this.isEnabled || !this.isSupported() || !analysisResult) {
      return { spoken: false, messageKey: null, text: '' };
    }

    const now = performance.now();
    const currentState = analysisResult.movement?.state || 'IDLE';
    const completedReps = analysisResult.repetition?.completedReps ?? 0;
    const exerciseId = analysisResult.exerciseId || analysisResult.exercise || 'shoulder-raise';
    const trackingConfidence = analysisResult.tracking?.confidence ?? 1.0;

    // 1. Strict Framing Loss Detection
    const isFramingMissing =
      analysisResult.posture?.state === 'INSUFFICIENT_DATA' ||
      analysisResult.movement?.state === 'INSUFFICIENT_DATA' ||
      trackingConfidence < 0.40 ||
      (analysisResult.posture?.issues && analysisResult.posture.issues.some((i) => i.code === 'STEP_BACK_FOR_FRAMING' || i.code === 'INSUFFICIENT_TRACKING'));

    let candidateIssue = null;
    let customVal = null;

    // 2. Track State Dwell & Transitions
    if (currentState !== this.lastObservedState) {
      this.lastObservedState = currentState;
      this.stateEnteredTimestamp = now;
      this.hasSpokenForCurrentDwell = false;
    }

    const dwellTimeMs = now - this.stateEnteredTimestamp;

    // Priority 1: Framing Missing
    if (isFramingMissing) {
      this.wasFramingMissing = true;
      this.hasSpokenInitialReady = false;
      candidateIssue = 'STEP_BACK_FOR_FRAMING';
    } else {
      // Priority 2: Initial Ready Announcement (User just stepped into frame)
      if (this.wasFramingMissing && !this.hasSpokenInitialReady) {
        this.wasFramingMissing = false;
        this.hasSpokenInitialReady = true;
        this.hasSpokenForCurrentDwell = true;
        candidateIssue = exerciseId === 'bicep-curls' ? 'READY_TO_START_BICEP' : 'READY_TO_START_SHOULDER';
      }
      // Priority 3: Completed Rep Event ("Shabash! 1 repetition complete ho gaya.")
      else if (completedReps > 0 && completedReps !== this.lastSpokenRep) {
        candidateIssue = 'REP_COMPLETE_DYNAMIC';
        customVal = completedReps;
        this.hasSpokenForCurrentDwell = true;
      }
      // Priority 4: Immediate State Transition Guidance
      else if (!this.hasSpokenForCurrentDwell && !this.isSpeaking) {
        if (currentState === 'RAISING') {
          candidateIssue = exerciseId === 'bicep-curls' ? 'RAISING_BICEP_CURLS' : 'RAISING_BOTH';
          this.hasSpokenForCurrentDwell = true;
        } else if (currentState === 'TOP_POSITION') {
          candidateIssue = exerciseId === 'bicep-curls' ? 'HOLD_BICEP_CURLS' : 'TOP_POSITION_HOLD';
          this.hasSpokenForCurrentDwell = true;
        } else if (currentState === 'LOWERING') {
          candidateIssue = exerciseId === 'bicep-curls' ? 'LOWERING_BICEP_CURLS' : 'LOWERING_DOWN';
          this.hasSpokenForCurrentDwell = true;
        }
      }
      // Priority 5: Proactive Inactivity / Dwell Coaching (If user is idle/holding for > 1.5 - 2.0 seconds)
      else if (!this.isSpeaking && (now - this.lastMessageTimestamp) > 1800) {
        if (currentState === 'IDLE' && dwellTimeMs > 1800) {
          // User is standing ready but hasn't started movement
          if (completedReps > 0) {
            candidateIssue = exerciseId === 'bicep-curls' ? 'PROMPT_NEXT_REP_BICEP' : 'PROMPT_NEXT_REP_SHOULDER';
          } else {
            candidateIssue = exerciseId === 'bicep-curls' ? 'RAISING_BICEP_CURLS' : 'RAISING_BOTH';
          }
          this.stateEnteredTimestamp = now; // reset dwell timer after prompting
        } else if (currentState === 'TOP_POSITION' && dwellTimeMs > 1400) {
          // User has been holding at the peak and needs prompt to lower
          candidateIssue = exerciseId === 'bicep-curls' ? 'PROMPT_LOWER_BICEP' : 'PROMPT_LOWER_SHOULDER';
          this.stateEnteredTimestamp = now;
        } else if (currentState === 'LOWERING' && dwellTimeMs > 2200) {
          candidateIssue = 'PROMPT_FINISH_LOWERING';
          this.stateEnteredTimestamp = now;
        }
      }
    }

    if (!candidateIssue) {
      return { spoken: false, messageKey: null, text: '' };
    }

    // 3. Cooldown & Priority Interruption Rules
    const candidatePriority = ISSUE_PRIORITY[candidateIssue] || 99;
    const currentPriority = this.currentMessageKey ? (ISSUE_PRIORITY[this.currentMessageKey] || 99) : 99;
    const isSameIssue = candidateIssue === this.lastMessageKey;
    const isCooldownActive = (now - this.lastMessageTimestamp) < this.minimumFeedbackInterval;

    if (candidateIssue === 'REP_COMPLETE_DYNAMIC') {
      // Rep complete bypasses normal cooldown for instant celebration
    } else if (isSameIssue && isCooldownActive) {
      return { spoken: false, messageKey: null, text: '' };
    } else if (this.isSpeaking && candidatePriority >= currentPriority) {
      return { spoken: false, messageKey: null, text: '' };
    }

    // 4. Trigger Speech
    const text = getFeedbackText(candidateIssue, this.language, customVal);
    if (!text) return { spoken: false, messageKey: null, text: '' };

    if (this.synth && (this.synth.speaking || this.synth.pending)) {
      try {
        this.synth.cancel();
      } catch {
        // ignore cancel error
      }
    }

    return this.speakText(candidateIssue, text, now, candidateIssue === 'REP_COMPLETE_DYNAMIC' ? completedReps : null);
  }

  speakText(messageKey, text, timestamp, completedRepNum = null) {
    if (!this.synth || !text) return { spoken: false, messageKey: null, text: '' };

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;

      const bestVoice = this.findBestFemaleIndianVoice();
      if (bestVoice) {
        utterance.voice = bestVoice;
        utterance.lang = bestVoice.lang || 'hi-IN';
      } else {
        utterance.lang = 'hi-IN';
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.currentMessageKey = messageKey;
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentMessageKey = null;
        this.activeUtterance = null;
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        this.currentMessageKey = null;
        this.activeUtterance = null;
      };

      this.activeUtterance = utterance;
      this.lastMessageKey = messageKey;
      this.lastMessageTimestamp = timestamp;
      if (completedRepNum !== null) {
        this.lastSpokenRep = completedRepNum;
      }

      this.synth.speak(utterance);
      return { spoken: true, messageKey, text };
    } catch (err) {
      console.warn('SpeechSynthesis speak error:', err);
      this.isSpeaking = false;
      return { spoken: false, messageKey: null, text: '' };
    }
  }
}
