import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppParams, useAppNavigate } from '../utils/navigation';
import { getSessionReport } from '../ai-engine/index.js';
import {
  Activity,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  RotateCcw,
  Home,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function SessionReportPage() {
  const { sessionId } = useAppParams();
  const navigate = useAppNavigate();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      const data = getSessionReport(sessionId);
      if (data) {
        setReport(data);
      }
    }
    setIsLoading(false);
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="py-20 text-center max-w-md mx-auto">
        <Activity className="w-10 h-10 text-teal-400 animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Generating AI Session Report...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="py-20 text-center max-w-md mx-auto px-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Report Not Found</h2>
        <p className="text-slate-400 mb-6 text-sm">The requested exercise session report could not be loaded.</p>
        <Link
          to="/exercises"
          className="px-5 py-2.5 bg-brand-500 text-white font-medium rounded-xl hover:bg-brand-600 transition-colors inline-block"
        >
          Return to Exercise Catalog
        </Link>
      </div>
    );
  }

  const {
    exerciseName = 'Shoulder Raise',
    durationSeconds = 0,
    score = 100,
    grade = 'Excellent',
    completedReps = 0,
    validReps = 0,
    accuracy = { overall: 100, posture: 100, movement: 100, rangeOfMotion: 100 },
    trackingConfidence = 100,
    strengths = [],
    improvements = [],
    repPerformance = [],
    recommendation = '',
  } = report;

  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  const formattedDuration = `${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`;

  return (
    <div className="py-8 md:py-14 bg-slate-950 text-white min-h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Completion Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Award className="w-48 h-48 text-teal-400" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-3">
                <SparklesIcon />
                <span>AI REHAB SESSION COMPLETE</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
                {exerciseName} Report
              </h1>
              <p className="text-slate-400 text-sm flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-teal-400" />
                  <span>Duration: {formattedDuration}</span>
                </span>
                <span>•</span>
                <span>{completedReps} Reps Completed</span>
              </p>
            </div>

            {/* Score Badge Card */}
            <div className="bg-slate-900/90 border border-teal-500/40 p-4 sm:p-5 rounded-2xl text-center shadow-xl min-w-[170px]">
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">
                OVERALL SCORE
              </span>
              <div className="text-4xl font-mono font-black text-teal-300 mb-1">
                {score}%
              </div>
              <span className="inline-block px-3 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold font-mono">
                {grade.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Metric Breakdown Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <MetricCard title="Overall Accuracy" value={`${accuracy.overall}%`} icon={<Activity className="w-4 h-4 text-teal-400" />} />
          <MetricCard title="Posture Stability" value={`${accuracy.posture}%`} icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />} />
          <MetricCard title="Movement Control" value={`${accuracy.movement}%`} icon={<Zap className="w-4 h-4 text-cyan-400" />} />
          <MetricCard title="Range of Motion" value={`${accuracy.rangeOfMotion}%`} icon={<Award className="w-4 h-4 text-purple-400" />} />
        </div>

        {/* Session Stats Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Session Duration</span>
            <span className="text-lg font-mono font-bold text-white">{formattedDuration}</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Total Repetitions</span>
            <span className="text-lg font-mono font-bold text-teal-300">{completedReps} Reps</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Valid Form Reps</span>
            <span className="text-lg font-mono font-bold text-emerald-400">{validReps} / {completedReps}</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">AI Camera Framing</span>
            <span className="text-lg font-mono font-bold text-cyan-300">{trackingConfidence}% Quality</span>
          </div>
        </div>

        {/* Strengths & Improvements Dual Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Strengths */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
            <h3 className="text-base font-bold text-emerald-400 flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>WHAT YOU DID WELL</span>
            </h3>
            <div className="space-y-3">
              {strengths.map((item, idx) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-emerald-900/30 flex items-start space-x-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-white mb-0.5">{item.title}</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Improvements */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
            <h3 className="text-base font-bold text-amber-400 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>AREAS TO IMPROVE</span>
            </h3>
            <div className="space-y-3">
              {improvements.map((item, idx) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-amber-900/30 flex items-start space-x-3">
                  <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-white mb-0.5">{item.title}</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rep Performance Breakdown */}
        {repPerformance.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-teal-400" />
              <span>REPETITION PERFORMANCE BREAKDOWN</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {repPerformance.map((rep) => (
                <div
                  key={rep.repNumber}
                  className={`p-3 rounded-2xl border ${
                    rep.valid ? 'bg-slate-950 border-teal-900/50' : 'bg-amber-950/20 border-amber-900/40'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-mono mb-1">
                    <span className="text-slate-400">REP {rep.repNumber}</span>
                    <span className="font-bold text-teal-300">{rep.score}%</span>
                  </div>
                  <div className="text-[11px] text-slate-300 flex items-center justify-between">
                    <span>{rep.activeSide.toUpperCase()}</span>
                    <span>{rep.maxAngle}° ROM</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendation Summary Box */}
        <div className="bg-teal-950/40 border border-teal-800/80 p-5 sm:p-6 rounded-3xl space-y-2">
          <h3 className="text-sm font-bold text-teal-300 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>AI REHAB ASSISTANT RECOMMENDATION</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {recommendation}
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-900 font-semibold text-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigate('/exercises')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-semibold text-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Exercise Catalog</span>
            </button>
            <button
              type="button"
              onClick={() => navigate(`/session/${report.exerciseId}`)}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Start Another Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function MetricCard({ title, value, icon }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono text-slate-400 uppercase">{title}</span>
        {icon}
      </div>
      <span className="text-2xl font-mono font-bold text-white">{value}</span>
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}
