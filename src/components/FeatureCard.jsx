import { Activity, ShieldCheck, TrendingUp } from 'lucide-react';

const iconMap = {
  Activity,
  ShieldCheck,
  TrendingUp,
};

export default function FeatureCard({ title, description, iconName }) {
  const IconComponent = iconMap[iconName] || Activity;

  return (
    <div className="bg-slate-50 dark:bg-slate-800/80 p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-700/80 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
      <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-5 border border-teal-200/60 dark:border-teal-800/60">
        <IconComponent className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
        {description}
      </p>
    </div>
  );
}
