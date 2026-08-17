import { Activity, ShieldCheck, TrendingUp } from 'lucide-react';

const iconMap = {
  Activity,
  ShieldCheck,
  TrendingUp,
};

export default function FeatureCard({ title, description, iconName }) {
  const IconComponent = iconMap[iconName] || Activity;

  return (
    <div className="bg-clinical-card p-6 sm:p-8 rounded-2xl border border-clinical-border shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-5">
        <IconComponent className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-clinical-textPrimary mb-2">
        {title}
      </h3>
      <p className="text-clinical-textSecondary text-sm sm:text-base leading-relaxed">
        {description}
      </p>
    </div>
  );
}
