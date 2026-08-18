import { Activity } from 'lucide-react';
import { PLATFORM_INFO } from '../data/rehabData';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0 mb-8">
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">
              {PLATFORM_INFO.name}
            </span>
          </div>

          <div className="text-xs text-slate-400 max-w-xl">
            <p>
              <strong className="text-slate-300">Medical Disclaimer:</strong> PhysioTrack is designed to assist physical rehabilitation exercises. Always consult a licensed physical therapist or medical professional for clinical diagnosis and exercise prescription.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PhysioTrack. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 font-mono">Phase 0 — Project Foundation</p>
        </div>
      </div>
    </footer>
  );
}
