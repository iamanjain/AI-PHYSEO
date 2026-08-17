/**
 * AI Engine — Feedback Message Translations
 * Multi-language message dictionary supporting "mixed" (Hinglish - default), "hi" (Hindi), and "en" (English).
 * Modeled after a real-life physical rehabilitation coach.
 */

export const VOICE_FEEDBACK_MESSAGES = {
  // --- General Positioning & Readiness ---
  STEP_BACK_FOR_FRAMING: {
    mixed: 'Pehle camera ke samne seedhe khade ho jayein.',
    hi: 'पहले कैमरे के सामने सीधे खड़े हो जाएं।',
    en: 'Please stand straight facing the camera.',
  },
  UPPER_BODY_NOT_VISIBLE: {
    mixed: 'Camera ke samne seedhe khade ho jayein.',
    hi: 'कैमरे के सामने सीधे खड़े हो जाएं।',
    en: 'Please stand straight facing the camera.',
  },
  INSUFFICIENT_TRACKING: {
    mixed: 'Camera ke samne seedhe khade ho jayein.',
    hi: 'कैमरे के सामने सीधे खड़े हो जाएं।',
    en: 'Please stand straight facing the camera.',
  },
  READY_TO_START: {
    mixed: 'Bahut badhiya! Posture bilkul sahi hai. Ab exercise start karein.',
    hi: 'बहुत बढ़िया! पोस्चर बिल्कुल सही है। अब व्यायाम शुरू करें।',
    en: 'Great posture! Now begin your exercise.',
  },
  READY_TO_START_BICEP: {
    mixed: 'Posture bilkul sahi hai! Ab dono hath ko mod kar upar layein.',
    hi: 'पोस्चर बिल्कुल सही है! अब दोनों हाथों को मोड़कर ऊपर लाएं।',
    en: 'Great posture! Now curl both hands upward toward shoulders.',
  },
  READY_TO_START_SHOULDER: {
    mixed: 'Posture bilkul sahi hai! Ab dono hath upar uthaiye.',
    hi: 'पोस्चर बिल्कुल सही है! अब दोनों हाथ ऊपर उठाइए।',
    en: 'Great posture! Now raise both hands up to shoulder level.',
  },

  // --- Shoulder Lateral Raise Specific ---
  RAISING_BOTH: {
    mixed: 'Dono hath upar uthaiye.',
    hi: 'दोनों हाथ ऊपर उठाइये।',
    en: 'Raise both hands up.',
  },
  TOP_POSITION_HOLD: {
    mixed: 'Ab seedha hold rakhein.',
    hi: 'अब सीधा होल्ड रखें।',
    en: 'Now hold it straight.',
  },
  LOWERING_DOWN: {
    mixed: 'Ab dhire dhire niche lao.',
    hi: 'अब धीरे धीरे नीचे लाओ।',
    en: 'Now slowly bring it down.',
  },
  PROMPT_LOWER_SHOULDER: {
    mixed: 'Bahut badhiya! Ab dhire dhire niche lao.',
    hi: 'बहुत बढ़िया! अब धीरे धीरे नीचे लाओ।',
    en: 'Great hold! Now slowly bring your arms down.',
  },
  PROMPT_NEXT_REP_SHOULDER: {
    mixed: 'Ab agla repetition karein, hath upar uthaiye.',
    hi: 'अब अगला रेपिटेशन करें, हाथ ऊपर उठाइए।',
    en: 'Now for the next rep, raise your arms up.',
  },

  // --- Bicep Curls Specific (Real-Coach Voice Flow) ---
  RAISING_BICEP_CURLS: {
    mixed: 'Dono hath ko mod kar upar layein.',
    hi: 'दोनों हाथों को मोड़कर ऊपर लाएं।',
    en: 'Curl both hands upward towards your shoulders.',
  },
  HOLD_BICEP_CURLS: {
    mixed: 'Ab upar squeeze karke hold rakhein.',
    hi: 'अब ऊपर स्क्वीज़ करके होल्ड रखें।',
    en: 'Now hold and squeeze at the top.',
  },
  LOWERING_BICEP_CURLS: {
    mixed: 'Ab slowly hath ko niche le jayein.',
    hi: 'अब धीरे धीरे हाथ नीचे ले जाएं।',
    en: 'Now slowly lower your arms back down.',
  },
  PROMPT_LOWER_BICEP: {
    mixed: 'Bahut acche! Ab slowly hath ko niche le jayein.',
    hi: 'बहुत अच्छे! अब धीरे धीरे हाथ नीचे ले जाएं।',
    en: 'Great squeeze! Now slowly lower your arms back down.',
  },
  PROMPT_NEXT_REP_BICEP: {
    mixed: 'Ab agla repetition karein, dono hath upar layein.',
    hi: 'अब अगला रेपिटेशन करें, दोनों हाथ ऊपर लाएं।',
    en: 'Now for the next repetition, curl your hands up.',
  },
  PROMPT_FINISH_LOWERING: {
    mixed: 'Hath ko poora niche tak le jayein.',
    hi: 'हाथ को पूरा नीचे तक ले जाएं।',
    en: 'Lower your arms all the way down.',
  },
  ELBOW_FLARE: {
    mixed: 'Elbows ko body ke paas rakhein.',
    hi: 'कोहनी को शरीर के पास रखें।',
    en: 'Keep your elbows close to your torso.',
  },

  // --- Side Leg Raise Specific ---
  RAISING_SIDE_LEG_RAISE: {
    mixed: 'Ek pair ko side me upar uthaiye.',
    hi: 'एक पैर को साइड में ऊपर उठाइये।',
    en: 'Raise your leg out to the side.',
  },
  HOLD_SIDE_LEG_RAISE: {
    mixed: 'Ab side me hold rakhein.',
    hi: 'अब साइड में होल्ड रखें।',
    en: 'Now hold your leg to the side.',
  },
  LOWERING_SIDE_LEG_RAISE: {
    mixed: 'Ab slowly niche layein.',
    hi: 'अब धीरे धीरे नीचे लाएं।',
    en: 'Now slowly bring your leg back down.',
  },

  // --- Knee Extension Specific ---
  RAISING_KNEE_EXTENSION: {
    mixed: 'Pair ko aage seedha extend karein.',
    hi: 'पैर को आगे सीधा एक्सटेंड करें।',
    en: 'Extend your leg straight forward.',
  },
  HOLD_KNEE_EXTENSION: {
    mixed: 'Ab seedha hold rakhein.',
    hi: 'अब सीधा होल्ड रखें।',
    en: 'Now hold your leg straight.',
  },
  LOWERING_KNEE_EXTENSION: {
    mixed: 'Ab slowly niche layein.',
    hi: 'अब धीरे धीरे नीचे लाएं।',
    en: 'Now slowly bend your knee back down.',
  },

  // --- Form Alignment & Corrections ---
  TORSO_TILTED_LEFT: {
    mixed: 'Body ko seedha rakhein, peeche mat jhukiye.',
    hi: 'शरीर को सीधा रखें, पीछे न झुकें।',
    en: 'Please keep your body straight and upright.',
  },
  TORSO_TILTED_RIGHT: {
    mixed: 'Body ko seedha rakhein, peeche mat jhukiye.',
    hi: 'शरीर को सीधा रखें, पीछे न झुकें।',
    en: 'Please keep your body straight and upright.',
  },
  ELBOW_TOO_BENT_LEFT: {
    mixed: 'Elbows ko seedha rakhein.',
    hi: 'कोहनी को सीधा रखें।',
    en: 'Keep your elbows straight.',
  },
  ELBOW_TOO_BENT_RIGHT: {
    mixed: 'Elbows ko seedha rakhein.',
    hi: 'कोहनी को सीधा रखें।',
    en: 'Keep your elbows straight.',
  },
  NOT_ENOUGH_RANGE: {
    mixed: 'Hath ko thoda aur upar le jao.',
    hi: 'हाथ को थोड़ा और ऊपर ले जाएं।',
    en: 'Raise your arm a little higher.',
  },
  MOVEMENT_TOO_FAST: {
    mixed: 'Exercise thoda slowly karein.',
    hi: 'व्यायाम थोड़ा धीरे करें।',
    en: 'Slow down your movement.',
  },
  GOOD_REP: {
    mixed: 'Shabash! Repetition complete ho gaya.',
    hi: 'शाबाश! रेपिटेशन कम्प्लीट हो गया।',
    en: 'Great job! Repetition complete.',
  },
  POSTURE_PERFECT: {
    mixed: 'Perfect! Form bilkul sahi hai.',
    hi: 'परफेक्ट! फॉर्म बिल्कुल सही है।',
    en: 'Perfect! Form is completely correct.',
  },
  MOVE_CLOSER: {
    mixed: 'Thoda paas aayein.',
    hi: 'थोड़ा पास आएं।',
    en: 'Please move a little closer.',
  },
  MOVE_FARTHER: {
    mixed: 'Thoda door jaayein.',
    hi: 'थोड़ा दूर जाएं।',
    en: 'Please move a little farther.',
  },
  SHOULDER_ASYMMETRY: {
    mixed: 'Dono shoulders ko barabar rakhein.',
    hi: 'दोनों कंधों को बराबर रखें।',
    en: 'Keep both shoulders level.',
  },
};

export function getFeedbackText(messageKey, language = 'mixed', customVal = null) {
  if (messageKey === 'REP_COMPLETE_DYNAMIC') {
    const num = customVal || 1;
    if (language === 'hi') return `शाबाश! ${num} रेपिटेशन कम्प्लीट हो गया।`;
    if (language === 'en') return `Great job! ${num} repetition complete.`;
    return `Shabash! ${num} repetition complete ho gaya.`;
  }
  const msgObj = VOICE_FEEDBACK_MESSAGES[messageKey];
  if (!msgObj) return '';
  return msgObj[language] || msgObj['mixed'] || msgObj['en'] || '';
}
