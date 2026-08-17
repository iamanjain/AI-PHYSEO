import { useAppNavigate } from '../utils/navigation';
import ExerciseCard from '../components/ExerciseCard';
import { EXERCISES } from '../data/rehabData';
import { Sparkles } from 'lucide-react';

export default function ExerciseSelectionPage() {
  const navigate = useAppNavigate();

  const handleSelectExercise = (exerciseId) => {
    navigate(`/exercises/${exerciseId}`);
  };

  return (
    <div className="py-12 md:py-16 bg-clinical-bg min-h-[calc(100vh-8rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title Section */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Movement Analysis Protocol</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-clinical-textPrimary tracking-tight mb-3">
            Choose Your Exercise
          </h1>
          <p className="text-clinical-textSecondary text-base sm:text-lg leading-relaxed">
            Select an exercise routine below. The AI assistant will monitor your movement, form, and posture during your session.
          </p>
        </div>

        {/* Exercises Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {EXERCISES.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onSelect={handleSelectExercise}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
