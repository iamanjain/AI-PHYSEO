import { useAppNavigate } from '../utils/navigation';
import ExerciseCard from '../components/ExerciseCard';
import { EXERCISES } from '../data/rehabData';
import { Sparkles, ShieldCheck, Activity } from 'lucide-react';

export default function ExerciseSelectionPage() {
  const navigate = useAppNavigate();

  const handleSelectExercise = (exerciseId) => {
    navigate(`/exercises/${exerciseId}`);
  };

  return (
    <div className="py-10 md:py-14 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-8rem)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title Section */}
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>AI Movement Analysis Protocol Active</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
            Choose Your Exercise
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
            Select a targeted rehabilitation routine below. The AI coach will track joint kinematics, verify form accuracy, and guide your posture in real time.
          </p>
        </div>

        {/* Exercises Grid (Responsive 4-Card Layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {EXERCISES.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onSelect={handleSelectExercise}
            />
          ))}
        </div>

        {/* Bottom Safety & Privacy Note */}
        <div className="mt-12 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400 shadow-sm">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span><strong>100% On-Device Privacy:</strong> All camera tracking is processed locally in your browser. No video is ever stored or uploaded.</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
            <Activity className="w-4 h-4 text-teal-500" />
            <span>Real-Time Biomechanical HUD Enabled</span>
          </div>
        </div>

      </div>
    </div>
  );
}
