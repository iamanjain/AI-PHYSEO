import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ShieldCheck, Activity } from 'lucide-react';

const EXERCISE_GUIDE_DATA = {
  'shoulder-raise': {
    title: 'Shoulder Lateral Raise',
    frames: [
      {
        title: '1. Starting Rest Position',
        angleLabel: '20° (Rest)',
        description: 'Stand upright with arms resting naturally at your sides.',
        angle: 20,
      },
      {
        title: '2. Lateral Arm Elevation',
        angleLabel: '90° (Shoulder Level)',
        description: 'Slowly raise both arms out to the sides up to shoulder height.',
        angle: 90,
      },
      {
        title: '3. Smooth Return',
        angleLabel: '30° (Lowering)',
        description: 'Lower your arms smoothly back down to the starting position.',
        angle: 30,
      },
    ],
  },
  'bicep-curls': {
    title: 'Bicep Curls',
    frames: [
      {
        title: '1. Fully Extended Arms',
        angleLabel: '160° (Extended)',
        description: 'Start with arms extended down and elbows pinned close to your ribs.',
        angle: 160,
      },
      {
        title: '2. Peak Curl Flexion',
        angleLabel: '50° (Peak Contraction)',
        description: 'Bend elbows and curl hands up toward shoulders, squeezing biceps.',
        angle: 50,
      },
      {
        title: '3. Controlled Extension',
        angleLabel: '120° (Lowering)',
        description: 'Slowly uncurl your arms back down without swinging your elbows.',
        angle: 120,
      },
    ],
  },
  'side-leg-raise': {
    title: 'Side Leg Raise',
    frames: [
      {
        title: '1. Standing Neutral',
        angleLabel: '0° (Neutral)',
        description: 'Stand upright with feet hip-width apart and core engaged.',
        angle: 0,
      },
      {
        title: '2. Lateral Leg Lift',
        angleLabel: '30° (Peak Abduction)',
        description: 'Lift your leg out sideways while keeping your torso upright.',
        angle: 30,
      },
      {
        title: '3. Controlled Return',
        angleLabel: '10° (Lowering)',
        description: 'Lower your leg slowly back to the ground without tilting.',
        angle: 10,
      },
    ],
  },
  'knee-extension': {
    title: 'Seated Knee Extension',
    frames: [
      {
        title: '1. Seated 90° Position',
        angleLabel: '90° (Seated Bent)',
        description: 'Sit tall with your knees bent at 90 degrees.',
        angle: 90,
      },
      {
        title: '2. Full Leg Extension',
        angleLabel: '160° (Straight Leg)',
        description: 'Extend your lower leg forward until your knee is straight.',
        angle: 160,
      },
      {
        title: '3. Controlled Lowering',
        angleLabel: '110° (Bending)',
        description: 'Slowly bend your knee back to the seated rest position.',
        angle: 110,
      },
    ],
  },
};

export default function ExerciseVisualGuide({ exerciseId = 'shoulder-raise' }) {
  const [activeFrame, setActiveFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const guide = EXERCISE_GUIDE_DATA[exerciseId] || EXERCISE_GUIDE_DATA['shoulder-raise'];
  const frames = guide.frames;

  // Auto-play timer
  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveFrame((prev) => (prev + 1) % frames.length);
      }, 1800);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, frames.length]);

  // Reset frame when exercise changes
  useEffect(() => {
    setActiveFrame(0);
  }, [exerciseId]);

  const currentFrame = frames[activeFrame] || frames[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-teal-400" />
          <h3 className="text-base font-bold text-white tracking-wide">
            {guide.title} — Biomechanical Demonstration
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold flex items-center space-x-1 border border-slate-700 transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFrame(0)}
            className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
            title="Reset to Start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Animated Biomechanical Diagram */}
      <div className="relative w-full h-60 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center p-4">
        <svg viewBox="0 0 400 300" className="w-full h-full max-w-sm">
          <defs>
            <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(51, 65, 85, 0.25)" strokeWidth="1" />
            </pattern>
            <linearGradient id="activeLimbGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill="url(#gridPattern)" />

          {/* Render Exercise Specific SVG Vector Figure */}
          {renderBiomechanicalSVG(exerciseId, currentFrame)}
        </svg>

        {/* Step Floating Badge */}
        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3 py-1 rounded-full text-xs font-mono font-bold text-teal-300 shadow-md">
          {currentFrame.title}
        </div>
      </div>

      {/* Step Switcher Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {frames.map((frame, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setActiveFrame(idx);
              setIsPlaying(false);
            }}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              activeFrame === idx
                ? 'bg-slate-800 border-teal-500 text-white shadow-md'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono font-bold mb-0.5">
              <span>STEP {idx + 1}</span>
              <span className={activeFrame === idx ? 'text-teal-400' : 'text-slate-500'}>{frame.angleLabel}</span>
            </div>
            <p className="text-[11px] font-medium leading-tight line-clamp-1">{frame.title.split('. ')[1]}</p>
          </button>
        ))}
      </div>

      {/* Clinical Guidance Footnote */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-start space-x-3 text-xs text-slate-300">
        <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-white">{currentFrame.title}: </strong>
          {currentFrame.description}
        </p>
      </div>
    </div>
  );
}

/**
 * Procedurally draws animated vector limbs based on the active exercise
 */
function renderBiomechanicalSVG(exerciseId, currentFrame) {
  const angle = currentFrame.angle ?? 20;

  if (exerciseId === 'bicep-curls') {
    // Standing Bicep Curl Figure
    const elbowX = 230;
    const elbowY = 160;
    const rad = (angle * Math.PI) / 180;
    const wristX = elbowX + Math.sin(rad) * 65;
    const wristY = elbowY - Math.cos(rad) * 65;

    return (
      <g>
        {/* Head */}
        <circle cx="200" cy="65" r="22" fill="#334155" stroke="#0f172a" strokeWidth="3" />
        <line x1="200" y1="87" x2="200" y2="105" stroke="#475569" strokeWidth="8" strokeLinecap="round" />
        {/* Torso */}
        <path d="M 175 105 L 225 105 L 215 200 L 185 200 Z" fill="#1e293b" stroke="#334155" strokeWidth="4" />
        {/* Legs */}
        <line x1="190" y1="200" x2="185" y2="280" stroke="#334155" strokeWidth="10" strokeLinecap="round" />
        <line x1="210" y1="200" x2="215" y2="280" stroke="#334155" strokeWidth="10" strokeLinecap="round" />

        {/* Left Arm (Resting) */}
        <line x1="175" y1="110" x2="165" y2="160" stroke="#475569" strokeWidth="8" strokeLinecap="round" />
        <line x1="165" y1="160" x2="165" y2="220" stroke="#475569" strokeWidth="7" strokeLinecap="round" />

        {/* Right Upper Arm (Pinned to side) */}
        <line x1="225" y1="110" x2={elbowX} y2={elbowY} stroke="#0d9488" strokeWidth="9" strokeLinecap="round" />
        <circle cx="225" cy="110" r="6" fill="#14b8a6" />
        <circle cx={elbowX} cy={elbowY} r="7" fill="#0f766e" />

        {/* Animated Forearm Flexing */}
        <g className="transition-all duration-700 ease-in-out">
          <line x1={elbowX} y1={elbowY} x2={wristX} y2={wristY} stroke="url(#activeLimbGlow)" strokeWidth="8" strokeLinecap="round" />
          <circle cx={wristX} cy={wristY} r="8" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
          {/* Angle Badge */}
          <g transform={`translate(${wristX + 15}, ${wristY - 5})`}>
            <rect x="-5" y="-12" width="55" height="20" rx="6" fill="#0f172a" stroke="#14b8a6" strokeWidth="1.5" />
            <text x="22" y="2" fill="#2dd4bf" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              {angle}°
            </text>
          </g>
        </g>
      </g>
    );
  }

  if (exerciseId === 'side-leg-raise') {
    // Standing Side Leg Raise Figure
    const hipX = 215;
    const hipY = 195;
    const rad = (angle * Math.PI) / 180;
    const footX = hipX + Math.sin(rad) * 90;
    const footY = hipY + Math.cos(rad) * 90;

    return (
      <g>
        {/* Head */}
        <circle cx="200" cy="65" r="22" fill="#334155" stroke="#0f172a" strokeWidth="3" />
        {/* Torso */}
        <path d="M 175 105 L 225 105 L 215 195 L 185 195 Z" fill="#1e293b" stroke="#334155" strokeWidth="4" />
        {/* Arms on Hips */}
        <line x1="175" y1="110" x2="160" y2="150" stroke="#475569" strokeWidth="7" strokeLinecap="round" />
        <line x1="160" y1="150" x2="185" y2="175" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
        <line x1="225" y1="110" x2="240" y2="150" stroke="#475569" strokeWidth="7" strokeLinecap="round" />
        <line x1="240" y1="150" x2="215" y2="175" stroke="#475569" strokeWidth="6" strokeLinecap="round" />

        {/* Standing Supporting Left Leg */}
        <line x1="185" y1="195" x2="185" y2="285" stroke="#334155" strokeWidth="10" strokeLinecap="round" />

        {/* Dynamic Abducting Right Leg */}
        <circle cx={hipX} cy={hipY} r="7" fill="#0d9488" />
        <g className="transition-all duration-700 ease-in-out">
          <line x1={hipX} y1={hipY} x2={footX} y2={footY} stroke="url(#activeLimbGlow)" strokeWidth="10" strokeLinecap="round" />
          <circle cx={footX} cy={footY} r="8" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
          {/* Target Arc */}
          <path d="M 215 285 A 90 90 0 0 0 280 250" fill="none" stroke="rgba(20, 184, 166, 0.2)" strokeWidth="5" strokeDasharray="4 4" />
          <g transform={`translate(${footX + 15}, ${footY - 10})`}>
            <rect x="-5" y="-12" width="55" height="20" rx="6" fill="#0f172a" stroke="#14b8a6" strokeWidth="1.5" />
            <text x="22" y="2" fill="#2dd4bf" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              {angle}°
            </text>
          </g>
        </g>
      </g>
    );
  }

  if (exerciseId === 'knee-extension') {
    // Seated Knee Extension Figure
    const kneeX = 230;
    const kneeY = 210;
    const rad = (angle * Math.PI) / 180;
    const ankleX = kneeX + Math.sin(rad) * 65;
    const ankleY = kneeY + Math.cos(rad) * 65;

    return (
      <g>
        {/* Chair */}
        <path d="M 140 100 L 140 230 L 220 230" fill="none" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
        <line x1="140" y1="230" x2="140" y2="285" stroke="#475569" strokeWidth="5" />
        <line x1="210" y1="230" x2="210" y2="285" stroke="#475569" strokeWidth="5" />

        {/* Torso & Head */}
        <circle cx="170" cy="70" r="20" fill="#334155" stroke="#0f172a" strokeWidth="3" />
        <line x1="170" y1="90" x2="170" y2="200" stroke="#1e293b" strokeWidth="14" strokeLinecap="round" />

        {/* Thigh (horizontal on chair) */}
        <line x1="170" y1="200" x2={kneeX} y2={kneeY} stroke="#0d9488" strokeWidth="11" strokeLinecap="round" />
        <circle cx={kneeX} cy={kneeY} r="7" fill="#14b8a6" />

        {/* Animated Extending Lower Leg */}
        <g className="transition-all duration-700 ease-in-out">
          <line x1={kneeX} y1={kneeY} x2={ankleX} y2={ankleY} stroke="url(#activeLimbGlow)" strokeWidth="9" strokeLinecap="round" />
          <circle cx={ankleX} cy={ankleY} r="8" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
          <g transform={`translate(${ankleX + 15}, ${ankleY - 5})`}>
            <rect x="-5" y="-12" width="55" height="20" rx="6" fill="#0f172a" stroke="#14b8a6" strokeWidth="1.5" />
            <text x="22" y="2" fill="#2dd4bf" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              {angle}°
            </text>
          </g>
        </g>
      </g>
    );
  }

  // Default: Shoulder Lateral Raise & Front Raise
  const rad = (angle * Math.PI) / 180;
  const armEndX = 225 + Math.sin(rad) * 85;
  const armEndY = 110 + Math.cos(rad) * 85;

  return (
    <g>
      {/* Head & Neck */}
      <circle cx="200" cy="65" r="22" fill="#334155" stroke="#0f172a" strokeWidth="3" />
      <line x1="200" y1="87" x2="200" y2="105" stroke="#475569" strokeWidth="8" strokeLinecap="round" />

      {/* Torso & Hips */}
      <path d="M 175 105 L 225 105 L 215 200 L 185 200 Z" fill="#1e293b" stroke="#334155" strokeWidth="4" />

      {/* Legs */}
      <line x1="190" y1="200" x2="185" y2="280" stroke="#334155" strokeWidth="10" strokeLinecap="round" />
      <line x1="210" y1="200" x2="215" y2="280" stroke="#334155" strokeWidth="10" strokeLinecap="round" />

      {/* Left Arm (Resting) */}
      <line x1="175" y1="110" x2="160" y2="190" stroke="#475569" strokeWidth="8" strokeLinecap="round" />
      <circle cx="160" cy="190" r="6" fill="#64748b" />

      {/* Right Shoulder Pivot Point */}
      <circle cx="225" cy="110" r="7" fill="#0d9488" />

      {/* Dynamic Active Right Arm */}
      <g className="transition-all duration-700 ease-in-out">
        <path d="M 225 195 A 85 85 0 0 0 310 110" fill="none" stroke="rgba(20, 184, 166, 0.2)" strokeWidth="6" strokeDasharray="4 4" />
        <line x1="225" y1="110" x2={armEndX} y2={armEndY} stroke="url(#activeLimbGlow)" strokeWidth="9" strokeLinecap="round" />
        <circle cx={armEndX} cy={armEndY} r="8" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
        <g transform={`translate(${armEndX + 10}, ${armEndY - 10})`}>
          <rect x="-5" y="-12" width="55" height="20" rx="6" fill="#0f172a" stroke="#14b8a6" strokeWidth="1.5" />
          <text x="22" y="2" fill="#2dd4bf" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
            {angle}°
          </text>
        </g>
      </g>

      <line x1="150" y1="110" x2="330" y2="110" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="1.5" strokeDasharray="3 3" />
      <text x="335" y="114" fill="#38bdf8" fontSize="10" fontFamily="monospace">90° Level</text>
    </g>
  );
}
