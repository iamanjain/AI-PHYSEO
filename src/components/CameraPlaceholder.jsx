import { Camera, Sparkles, UserCheck } from 'lucide-react';

export default function CameraPlaceholder({ exerciseName }) {
  return (
    <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-xl flex flex-col items-center justify-center p-6 text-center">
      {/* Background Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#0284c7 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Anatomical Posture Alignment Guides */}
      <div className="absolute inset-8 border border-dashed border-cyan-500/30 rounded-xl pointer-events-none flex items-center justify-center">
        <div className="w-48 h-48 border border-cyan-400/20 rounded-full flex items-center justify-center">
          <div className="w-24 h-24 border border-cyan-300/30 rounded-full" />
        </div>
      </div>

      {/* Main Content Info */}
      <div className="relative z-10 max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 text-teal-400 flex items-center justify-center mx-auto shadow-inner">
          <Camera className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Motion Sensor Area</span>
          </span>
          <h3 className="text-xl font-bold text-white tracking-wide pt-2">
            {exerciseName || 'Exercise Monitoring'}
          </h3>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed max-w-sm mx-auto">
          AI posture estimation, joint angle calculation, and repetition counting will activate in this area during Phase 2.
        </p>

        <div className="pt-2 flex items-center justify-center space-x-2 text-xs text-slate-400">
          <UserCheck className="w-4 h-4 text-teal-400" />
          <span>Position yourself 5–7 feet back facing the screen</span>
        </div>
      </div>

      {/* Top Corner Live AI Status Badge */}
      <div className="absolute top-4 left-4 bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center space-x-2 text-xs text-slate-300 font-mono">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
        <span>STATUS: SENSOR STANDBY</span>
      </div>
    </div>
  );
}
