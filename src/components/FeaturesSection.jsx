import FeatureCard from './FeatureCard';
import { REHAB_FEATURES } from '../data/rehabData';

export default function FeaturesSection() {
  return (
    <section className="py-16 bg-white border-t border-b border-clinical-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-clinical-textPrimary mb-3">
            Smarter Rehabilitation Workflows
          </h2>
          <p className="text-clinical-textSecondary text-base sm:text-lg">
            Empowering patients to complete home exercise programs with correct form and clinical confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REHAB_FEATURES.map((feature) => (
            <FeatureCard
              key={feature.id}
              title={feature.title}
              description={feature.description}
              iconName={feature.iconName}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
