import { Link } from 'react-router-dom';
import { useAppParams, useAppNavigate } from '../utils/navigation';
import { EXERCISES } from '../data/rehabData';
import { ArrowLeft, Play, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import ExerciseVisualGuide from '../components/ExerciseVisualGuide';

export default function ExerciseDetailPage() {
  const { id } = useAppParams();
  const navigate = useAppNavigate();

  const exercise = EXERCISES.find((item) => item.id === id);

  if (!exercise) {
    return (
      <div className="py-20 text-center max-w-md mx-auto px-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Exercise Not Found</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">The exercise routine you requested does not exist in our catalog.</p>
        <Link
          to="/exercises"
          className="px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500 transition-colors inline-block"
        >
          Return to Exercise Catalog
        </Link>
      </div>
    );
  }

  const handleStartSession = () => {
    navigate(`/session/${exercise.id}`);
  };

  return (
    <div className="py-10 md:py-16 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-8rem)] transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button Navigation */}
        <Link
          to="/exercises"
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Exercises</span>
        </Link>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-10 space-y-8">
          
          {/* Header & Category Badge */}
          <div className="border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-3">
              <span>{exercise.category}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
              {exercise.name}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
              {exercise.shortDescription}
            </p>
          </div>

          {/* Quick Specs Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Target Muscle Group</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{exercise.targetArea}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Recommended Repetitions</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{exercise.recommendedReps}</span>
            </div>
          </div>

          {/* Animated Biomechanical Exercise Visual Demonstration Component */}
          <ExerciseVisualGuide exerciseId={exercise.id} />

          {/* Step-by-Step Instructions */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
              <span>Exercise Instructions</span>
            </h2>
            <div className="space-y-3">
              {exercise.instructions.map((step, idx) => (
                <div key={idx} className="flex items-start space-x-3 bg-slate-50/80 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Movement Guidance */}
          <div className="bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-teal-900 dark:text-teal-300 mb-1 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Recommended Movement Guidance</span>
            </h3>
            <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
              {exercise.guidance}
            </p>
          </div>

          {/* Medical Disclaimer */}
          <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 p-4 rounded-xl flex items-start space-x-3 text-xs text-slate-600 dark:text-slate-400">
            <ShieldAlert className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
            <p>
              <strong>Clinical Disclaimer:</strong> This exercise guide is provided for educational and rehabilitation tracking purposes. It is not intended as medical diagnosis or medical treatment advice. Stop immediately if you experience pain or discomfort.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => navigate('/exercises')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-sm transition-colors text-center cursor-pointer"
            >
              Back to Exercises
            </button>
            <button
              type="button"
              onClick={handleStartSession}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-base shadow-md hover:shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center space-x-2 focus:outline-none cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start Exercise</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
