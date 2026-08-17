import React, { Component } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import ExerciseSelectionPage from './pages/ExerciseSelectionPage';
import ExerciseDetailPage from './pages/ExerciseDetailPage';
import ExerciseSessionPage from './pages/ExerciseSessionPage';
import SessionReportPage from './pages/SessionReportPage';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-2xl mx-auto my-12 bg-red-50 border border-red-200 rounded-2xl text-red-900 font-sans">
          <h2 className="text-xl font-bold mb-2">Application Render Error</h2>
          <p className="text-sm mb-4">An error occurred while loading this view:</p>
          <pre className="bg-red-100 p-4 rounded-xl text-xs overflow-x-auto font-mono text-red-800 mb-4">
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg text-sm cursor-pointer"
          >
            Return to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/exercises" element={<ExerciseSelectionPage />} />
            <Route path="/exercises/:id" element={<ExerciseDetailPage />} />
            <Route path="/session/:id" element={<ExerciseSessionPage />} />
            <Route path="/report/:sessionId" element={<SessionReportPage />} />
          </Routes>
        </MainLayout>
      </Router>
    </ErrorBoundary>
  );
}
