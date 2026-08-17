import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing rehabilitation session state and timer.
 * Provides live interval timer formatting (mm:ss) for Phase 1 session monitoring.
 */
export function useRehabSession() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isSessionActive) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isSessionActive]);

  const startSession = useCallback(() => {
    setElapsedSeconds(0);
    setIsSessionActive(true);
  }, []);

  const endSession = useCallback(() => {
    setIsSessionActive(false);
    setElapsedSeconds(0);
  }, []);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');
    return `${formattedMins}:${formattedSecs}`;
  };

  return {
    isSessionActive,
    elapsedSeconds,
    formattedTime: formatTime(elapsedSeconds),
    startSession,
    endSession,
  };
}
