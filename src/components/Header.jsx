import { Activity, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PLATFORM_INFO } from '../data/rehabData';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-clinical-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name with Link to Home */}
        <Link to="/" className="flex items-center space-x-3 group focus:outline-none">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-sm group-hover:bg-brand-600 transition-colors">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-lg text-clinical-textPrimary tracking-tight group-hover:text-brand-600 transition-colors">
              {PLATFORM_INFO.name}
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-100">
              Healthcare AI
            </span>
          </div>
        </Link>

        {/* Navigation & Phase Status Badge */}
        <div className="flex items-center space-x-4">
          <Link
            to="/exercises"
            className="text-sm font-medium text-clinical-textSecondary hover:text-brand-600 transition-colors"
          >
            Catalog
          </Link>
          <div className="flex items-center space-x-2 text-xs font-medium text-clinical-textSecondary bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <Shield className="w-3.5 h-3.5 text-teal-600" />
            <span>Phase 1: Session Flow</span>
          </div>
        </div>
      </div>
    </header>
  );
}
