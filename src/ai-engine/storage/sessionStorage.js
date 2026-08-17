/**
 * AI Engine — Local Session Storage Manager
 * Persists finalized exercise session reports to browser localStorage (v1 key: ai-rehab-session-reports-v1).
 */

const STORAGE_KEY = 'ai-rehab-session-reports-v1';

export function saveSessionReport(report) {
  if (!report || !report.sessionId) return false;

  try {
    const existing = getAllSessionReports();
    const index = existing.findIndex((r) => r.sessionId === report.sessionId);
    if (index >= 0) {
      existing[index] = report;
    } else {
      existing.unshift(report); // Newest first
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    return true;
  } catch (err) {
    console.error('Error saving session report to localStorage:', err);
    return false;
  }
}

export function getSessionReport(sessionId) {
  if (!sessionId) return null;
  const reports = getAllSessionReports();
  return reports.find((r) => r.sessionId === sessionId) || null;
}

export function getAllSessionReports() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error reading session reports from localStorage:', err);
    return [];
  }
}

export function clearSessionReports() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (err) {
    console.error('Error clearing session reports:', err);
    return false;
  }
}
