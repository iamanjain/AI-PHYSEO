import { useState, useEffect } from 'react';
import { Activity, Shield, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PLATFORM_INFO } from '../data/rehabData';

export default function Header() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name with Link to Home */}
        <Link to="/" className="flex items-center space-x-3 group focus:outline-none">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-sm group-hover:bg-brand-600 transition-colors">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight group-hover:text-brand-600 transition-colors">
              {PLATFORM_INFO.name}
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-100 dark:border-brand-800">
              Healthcare AI
            </span>
          </div>
        </Link>

        {/* Navigation, Theme Toggle & Status Badge */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link
            to="/exercises"
            className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            Catalog
          </Link>

          {/* Black & White / Light-Dark Screen Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
            title={isDark ? 'Switch to Light Theme (White Screen)' : 'Switch to Dark Theme (Black Screen)'}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold hidden md:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700" />
                <span className="text-xs font-semibold hidden md:inline">Dark</span>
              </>
            )}
          </button>

          <div className="hidden sm:flex items-center space-x-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Phase 1 Active</span>
          </div>
        </div>
      </div>
    </header>
  );
}
