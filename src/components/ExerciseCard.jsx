import { Activity, ShieldCheck, TrendingUp, ChevronRight } from 'lucide-react';

const iconMap = {
  Activity,
  ShieldCheck,
  TrendingUp,
};

export default function ExerciseCard({ exercise, onSelect }) {
  const IconComponent = iconMap[exercise.iconName] || Activity;

  return (
    <div className="bg-clinical-card p-6 rounded-2xl border border-clinical-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Header Badges & Icon */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-colors">
            <IconComponent className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {exercise.category}
          </span>
        </div>

        {/* Exercise Title & Description */}
        <h3 className="text-xl font-bold text-clinical-textPrimary mb-2 group-hover:text-brand-600 transition-colors">
          {exercise.name}
        </h3>
        <p className="text-clinical-textSecondary text-sm leading-relaxed mb-6">
          {exercise.shortDescription}
        </p>
      </div>

      {/* Footer Info & Action Button */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">
          Target: <strong className="text-slate-700">{exercise.targetArea}</strong>
        </span>
        <button
          type="button"
          onClick={() => onSelect(exercise.id)}
          className="inline-flex items-center space-x-1 text-sm font-semibold text-brand-600 group-hover:text-brand-700 hover:underline focus:outline-none"
        >
          <span>Start Exercise</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
