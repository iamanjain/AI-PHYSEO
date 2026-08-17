import { User, UserCheck } from 'lucide-react';

export default function CameraModeSelector({ currentMode, onSelectMode, recommendedMode }) {
  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
      <span className="text-slate-400 font-medium px-2">Camera Setup Mode:</span>
      
      <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => onSelectMode('upper-body')}
          className={`flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
            currentMode === 'upper-body'
              ? 'bg-brand-500 text-white shadow-md'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <User className="w-3.5 h-3.5 shrink-0" />
          <span>Upper Body</span>
          {recommendedMode === 'upper-body' && (
            <span className="ml-1 text-[9px] bg-teal-900/90 text-teal-300 px-1.5 py-0.5 rounded-full border border-teal-700">
              Rec
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onSelectMode('full-body')}
          className={`flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
            currentMode === 'full-body'
              ? 'bg-brand-500 text-white shadow-md'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 shrink-0" />
          <span>Full Body</span>
          {recommendedMode === 'full-body' && (
            <span className="ml-1 text-[9px] bg-teal-900/90 text-teal-300 px-1.5 py-0.5 rounded-full border border-teal-700">
              Rec
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
