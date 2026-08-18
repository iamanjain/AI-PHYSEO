import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAppNavigate } from '../utils/navigation';
import { PLATFORM_INFO } from '../data/rehabData';

export default function HeroSection() {
  const navigate = useAppNavigate();

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-gradient-to-b from-brand-50/70 via-slate-50 to-slate-50 dark:from-slate-900/80 dark:via-slate-950 dark:to-slate-950 text-slate-900 dark:text-white transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-brand-100 dark:border-slate-700 shadow-sm mb-6 transition-colors">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-brand-900 dark:text-teal-300 tracking-wide uppercase">
            Clinical Motion Analytics
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 transition-colors">
          {PLATFORM_INFO.name}
        </h1>

        <p className="text-xl sm:text-2xl text-slate-700 dark:text-slate-200 max-w-3xl mx-auto font-medium leading-relaxed mb-8 transition-colors">
          {PLATFORM_INFO.subtitle}
        </p>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 transition-colors">
          Designed for patients and physical therapists to ensure safe form, track rehabilitation progress, and optimize injury recovery.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button
            type="button"
            onClick={() => navigate('/exercises')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-lg shadow-md hover:shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center space-x-3 focus:outline-none cursor-pointer"
            aria-label="Start Rehabilitation session"
          >
            <span>{PLATFORM_INFO.ctaText}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 text-left transition-colors">
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-600 dark:text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>Form & Posture Tracking</span>
          </div>
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-600 dark:text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>Physiotherapist Approved</span>
          </div>
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-600 dark:text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>Safe & Private Sessions</span>
          </div>
        </div>

      </div>
    </section>
  );
}
