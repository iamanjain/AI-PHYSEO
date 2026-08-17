import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import { CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative">
      <HeroSection />
      <FeaturesSection />

      <section className="py-12 bg-clinical-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="bg-brand-50/50 border border-brand-100 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-left">
              <CheckCircle className="w-6 h-6 text-brand-600 shrink-0" />
              <div>
                <h4 className="font-semibold text-slate-900 text-sm sm:text-base">
                  Rehabilitation Catalog Ready
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  Select your assigned exercise routine to prepare for AI movement analysis.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-brand-700 bg-white px-3 py-1.5 rounded-lg border border-brand-200 shrink-0">
              Phase 1 Flow Enabled
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
