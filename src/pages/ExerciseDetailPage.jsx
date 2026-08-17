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
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Exercise Not Found</h2>
        <p className="text-slate-600 mb-6 text-sm">The exercise routine you requested does not exist in our catalog.</p>
        <Link
          to="/exercises"
          className="px-5 py-2.5 bg-brand-500 text-white font-medium rounded-xl hover:bg-brand-600 transition-colors inline-block"
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
    <div className="py-10 md:py-16 bg-clinical-bg min-h-[calc(100vh-8rem)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button Navigation */}
        <Link
          to="/exercises"
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-brand-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Exercises</span>
        </Link>

        <div className="bg-white rounded-3xl border border-clinical-border shadow-sm p-6 sm:p-10 space-y-8">
          
          {/* Header & Category Badge */}
          <div className="border-b border-slate-100 pb-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold mb-3">
              <span>{exercise.category}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-clinical-textPrimary tracking-tight mb-3">
              {exercise.name}
            </h1>
            <p className="text-slate-600 text-base sm:text-lg">
              {exercise.shortDescription}
            </p>
          </div>

          {/* Quick Specs Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Target Muscle Group</span>
              <span className="font-semibold text-slate-800 text-sm">{exercise.targetArea}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Recommended Repetitions</span>
              <span className="font-semibold text-slate-800 text-sm">{exercise.recommendedReps}</span>
            </div>
          </div>

          {/* Animated Biomechanical Exercise Visual Demonstration Component */}
          <ExerciseVisualGuide exerciseId={exercise.id} />

          {/* Step-by-Step Instructions */}
          <div>
            <h2 className="text-xl font-bold text-clinical-textPrimary mb-4 flex items-center space-x-2">
              <span>Exercise Instructions</span>
            </h2>
            <div className="space-y-3">
              {exercise.instructions.map((step, idx) => (
                <div key={idx} className="flex items-start space-x-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                  <div className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Movement Guidance */}
          <div className="bg-teal-50/70 border border-teal-200 p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-teal-900 mb-1 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Recommended Movement Guidance</span>
            </h3>
            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
              {exercise.guidance}
            </p>
          </div>

          {/* Medical Disclaimer */}
          <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl flex items-start space-x-3 text-xs text-slate-600">
            <ShieldAlert className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            <p>
              <strong>Clinical Disclaimer:</strong> This exercise guide is provided for educational and rehabilitation tracking purposes. It is not intended as medical diagnosis or medical treatment advice. Stop immediately if you experience pain or discomfort.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/exercises')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors text-center cursor-pointer"
            >
              Back to Exercises
            </button>
            <button
              type="button"
              onClick={handleStartSession}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 focus:outline-none focus:ring-4 focus:ring-brand-500/30 cursor-pointer"
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
