import { Activity, ShieldCheck, TrendingUp, Award, Zap, Play, Target, Repeat } from 'lucide-react';

const iconMap = {
  Activity,
  ShieldCheck,
  TrendingUp,
  Award,
  Zap,
};

// Subtle themed accent styles for exercise icons
const iconColors = {
  'shoulder-raise': 'bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-950/80 dark:text-sky-400 dark:border-sky-800',
  'bicep-curls': 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-400 dark:border-indigo-800',
  'side-leg-raise': 'bg-teal-50 text-teal-600 border-teal-200 dark:bg-teal-950/80 dark:text-teal-400 dark:border-teal-800',
  'knee-extension': 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border-emerald-800',
};

export default function ExerciseCard({ exercise, onSelect }) {
  const IconComponent = iconMap[exercise.iconName] || Activity;
  const colorTheme = iconColors[exercise.id] || 'bg-brand-50 text-brand-600 border-brand-200 dark:bg-brand-950/80 dark:text-brand-400 dark:border-brand-800';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Header: Icon & Category Badge */}
        <div className="flex items-center justify-between mb-5">
          <div className={`w-13 h-13 rounded-2xl border flex items-center justify-center shadow-sm ${colorTheme}`}>
            <IconComponent className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
            {exercise.category}
          </span>
        </div>

        {/* Exercise Title */}
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {exercise.name}
        </h3>

        {/* Short Description */}
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 line-clamp-3">
          {exercise.shortDescription}
        </p>

        {/* Specifications Chips (Target Area & Reps) */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center space-x-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <Target className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
            <span className="text-slate-500 dark:text-slate-400">Target:</span>
            <strong className="text-slate-800 dark:text-slate-200 font-semibold truncate">{exercise.targetArea}</strong>
          </div>

          {exercise.recommendedReps && (
            <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/60 text-teal-800 dark:text-teal-300">
              <div className="flex items-center space-x-1.5">
                <Repeat className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span className="font-medium">Recommended:</span>
              </div>
              <span className="font-bold font-mono">{exercise.recommendedReps}</span>
            </div>
          )}
        </div>
      </div>

      {/* Prominent Green Start Exercise Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => onSelect(exercise.id)}
          className="w-full py-3 px-5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer group/btn"
        >
          <span>Start Exercise</span>
          <Play className="w-4 h-4 fill-current transform group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
