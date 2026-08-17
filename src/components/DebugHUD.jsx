import { useState } from 'react';
import { Terminal, ChevronDown, ChevronUp, AlertCircle, Hand } from 'lucide-react';

export default function DebugHUD({ analysisResult, enableHandTracking = false }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!analysisResult) return null;

  const {
    movement,
    angles,
    posture,
    repetition,
    accuracy,
    tracking,
    leftHandLandmarks,
    rightHandLandmarks,
    leftHandednessScore,
    rightHandednessScore,
  } = analysisResult;

  const confidencePct = Math.round((tracking?.confidence || 0) * 100);

  return (
    <div className="absolute top-14 left-3 z-40 max-w-[250px] bg-slate-950/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl text-[11px] font-mono text-slate-200 overflow-hidden">
      {/* HUD Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between font-bold text-teal-400 cursor-pointer"
      >
        <div className="flex items-center space-x-1.5">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>DEV DEBUG HUD</span>
        </div>
        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {/* Expanded Metrics Content */}
      {isExpanded && (
        <div className="p-2.5 space-y-1.5">
          {/* Diagnostic FPS & Confidence */}
          <div className="flex justify-between items-center pb-1 border-b border-slate-800 text-[10px]">
            <span className="text-slate-400">POSE FPS: <strong className="text-emerald-400">{tracking?.poseFps || 0}</strong></span>
            <span className="text-slate-400">HAND FPS: <strong className="text-purple-400">{tracking?.handFps || 0}</strong></span>
          </div>

          <div className="flex justify-between items-center pb-1 border-b border-slate-800/60">
            <span className="text-slate-400">TRACK CONFIDENCE:</span>
            <span className={`font-bold ${confidencePct >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {confidencePct}%
            </span>
          </div>

          {/* Repetition & State Metrics */}
          <div className="flex justify-between items-center bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-300 font-bold">COMPLETED REPS:</span>
            <span className="font-mono text-base font-extrabold text-teal-300">
              {repetition?.completedReps ?? 0}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">STATE:</span>
            <span className="font-bold text-cyan-400">{movement?.state || 'IDLE'}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">DIRECTION:</span>
            <span className="font-bold text-slate-200">{movement?.direction || 'STATIONARY'}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">ACTIVE SIDE:</span>
            <span className="font-bold text-purple-400">
              {movement?.activeSide ? movement.activeSide.toUpperCase() : 'NONE'}
            </span>
          </div>

          {/* Angles */}
          <div className="pt-1 border-t border-slate-800 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">L SHOULDER ELEV:</span>
              <span className="font-bold text-white">
                {angles?.leftShoulderElevation !== null ? `${angles.leftShoulderElevation}°` : '--'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">R SHOULDER ELEV:</span>
              <span className="font-bold text-white">
                {angles?.rightShoulderElevation !== null ? `${angles.rightShoulderElevation}°` : '--'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">L ELBOW FLEXION:</span>
              <span className="text-slate-300">
                {angles?.leftElbowFlexion !== null ? `${angles.leftElbowFlexion}°` : '--'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">R ELBOW FLEXION:</span>
              <span className="text-slate-300">
                {angles?.rightElbowFlexion !== null ? `${angles.rightElbowFlexion}°` : '--'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">TORSO TILT:</span>
              <span className="text-slate-300">
                {angles?.torsoTiltDegrees !== undefined ? `${angles.torsoTiltDegrees}°` : '--'}
              </span>
            </div>
          </div>

          {/* Posture & Accuracy */}
          <div className="pt-1 border-t border-slate-800 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">POSTURE STATE:</span>
              <span className={`font-bold ${posture?.state === 'GOOD' ? 'text-emerald-400' : posture?.state === 'NEEDS_ATTENTION' ? 'text-amber-400' : 'text-slate-400'}`}>
                {posture?.state || 'GOOD'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">ACCURACY:</span>
              <span className="font-bold text-emerald-400">
                {accuracy?.overall !== undefined ? `${accuracy.overall}%` : '--'}
              </span>
            </div>
          </div>

          {/* Posture Issues List */}
          {posture?.issues && posture.issues.length > 0 && (
            <div className="pt-1 border-t border-amber-900/60 space-y-1">
              <div className="text-[10px] text-amber-400 font-bold flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>POSTURE ISSUES DETECTED:</span>
              </div>
              {posture.issues.map((issue, idx) => (
                <div key={idx} className="text-[9px] bg-amber-950/80 text-amber-300 px-1.5 py-0.5 rounded border border-amber-800/60">
                  ⚠️ {issue.code}
                </div>
              ))}
            </div>
          )}

          {/* Hand Detection Metrics */}
          {enableHandTracking && (
            <div className="pt-1 border-t border-purple-900/60 space-y-1 text-[10px]">
              <div className="flex items-center space-x-1 text-purple-300 font-bold">
                <Hand className="w-3 h-3" />
                <span>HAND TRACKING</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">L HAND:</span>
                <span className={`font-bold ${leftHandLandmarks ? 'text-purple-400' : 'text-slate-500'}`}>
                  {leftHandLandmarks ? `DETECTED (${leftHandednessScore}%)` : 'NOT DETECTED'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">R HAND:</span>
                <span className={`font-bold ${rightHandLandmarks ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {rightHandLandmarks ? `DETECTED (${rightHandednessScore}%)` : 'NOT DETECTED'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
