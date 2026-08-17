import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing HTML5 Fullscreen API lifecycle.
 * Gracefully handles mobile/desktop fullscreen requests without throwing uncaught errors.
 */
export function useFullscreen(containerRef) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterFullscreen = useCallback(async () => {
    try {
      const targetEl = containerRef?.current || document.documentElement;
      if (!targetEl) return;

      if (targetEl.requestFullscreen) {
        await targetEl.requestFullscreen();
      } else if (targetEl.webkitRequestFullscreen) {
        await targetEl.webkitRequestFullscreen();
      } else if (targetEl.msRequestFullscreen) {
        await targetEl.msRequestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request blocked or unsupported:', err);
    }
  }, [containerRef]);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen exit warning:', err);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [enterFullscreen, exitFullscreen]);

  useEffect(() => {
    function handleFullscreenChange() {
      const active = !!(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(active);
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      exitFullscreen();
    };
  }, [exitFullscreen]);

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
}
