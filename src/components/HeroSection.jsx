import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAppNavigate } from '../utils/navigation';
import { PLATFORM_INFO } from '../data/rehabData';

export default function HeroSection() {
  const navigate = useAppNavigate();

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-gradient-to-b from-brand-50/60 to-clinical-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-brand-100 shadow-sm mb-6">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-brand-900 tracking-wide uppercase">
            Clinical Motion Analytics
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-clinical-textPrimary tracking-tight mb-6">
          {PLATFORM_INFO.name}
        </h1>

        <p className="text-xl sm:text-2xl text-clinical-textSecondary max-w-3xl mx-auto font-medium leading-relaxed mb-8">
          {PLATFORM_INFO.subtitle}
        </p>

        <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto mb-10">
          Designed for patients and physical therapists to ensure safe form, track rehabilitation progress, and optimize injury recovery.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button
            type="button"
            onClick={() => navigate('/exercises')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-3 focus:outline-none focus:ring-4 focus:ring-brand-500/30 cursor-pointer"
            aria-label="Start Rehabilitation session"
          >
            <span>{PLATFORM_INFO.ctaText}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="pt-8 border-t border-slate-200/80 max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Form & Posture Tracking</span>
          </div>
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Physiotherapist Approved</span>
          </div>
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Safe & Private Sessions</span>
          </div>
        </div>

      </div>
    </section>
  );
}
