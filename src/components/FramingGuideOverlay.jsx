import { Target } from 'lucide-react';

export default function FramingGuideOverlay({ _cameraMode = 'upper-body', guidanceText, status }) {
  const isReady = status === 'UPPER_BODY_READY' || status === 'FULL_BODY_READY';

  return (
    <div className="absolute inset-0 pointer-events-none z-15 flex flex-col items-center justify-center p-2 sm:p-4">
      {/* Full Viewport Camera Framing Guide Box */}
      <div
        className={`relative border-2 border-dashed transition-all duration-300 rounded-3xl flex items-center justify-center w-[94%] h-[92%] ${
          isReady
            ? 'border-emerald-400/40 bg-emerald-950/5'
            : 'border-cyan-400/30 bg-cyan-950/10'
        }`}
      >
        {/* Corner Guide Accents */}
        <div className={`absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 ${isReady ? 'border-emerald-400' : 'border-cyan-400'}`} />
        <div className={`absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 ${isReady ? 'border-emerald-400' : 'border-cyan-400'}`} />
        <div className={`absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 ${isReady ? 'border-emerald-400' : 'border-cyan-400'}`} />
        <div className={`absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 ${isReady ? 'border-emerald-400' : 'border-cyan-400'}`} />

        {/* Central Icon Accent when Positioning */}
        {!isReady && (
          <div className="opacity-20 flex flex-col items-center space-y-1">
            <Target className="w-12 h-12 text-cyan-400" />
            <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-widest">
              FULL CAMERA VIEW TARGET AREA
            </span>
          </div>
        )}
      </div>

      {/* Real-time Framing Guidance Banner */}
      {guidanceText && (
        <div className="absolute bottom-16 z-30 transition-all duration-200">
          <div
            className={`px-4 py-1.5 rounded-full backdrop-blur-md border text-xs font-mono font-bold tracking-wide shadow-xl flex items-center space-x-2 ${
              isReady
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300'
                : status === 'NO_PERSON'
                ? 'bg-amber-950/90 border-amber-500 text-amber-300 animate-pulse'
                : 'bg-slate-900/90 border-cyan-500 text-cyan-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isReady ? 'bg-emerald-400' : 'bg-cyan-400 animate-ping'
              }`}
            />
            <span>{guidanceText}</span>
          </div>
        </div>
      )}
    </div>
  );
}
