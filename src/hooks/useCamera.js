import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing HTML5 MediaDevices webcam lifecycle with mobile & laptop optimizations.
 * Supports facingMode toggling (front/rear), adaptive aspect ratios, and stream cleanup.
 */
export function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' (front/selfie) | 'environment' (back/rear)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsLoading(false);
  }, []);

  const startCamera = useCallback(async (overrideFacingMode = null) => {
    stopCamera();

    setIsLoading(true);
    setCameraError(null);

    const targetFacingMode = overrideFacingMode || facingMode;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API is not supported in this browser environment.');
      setIsLoading(false);
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: targetFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch((playErr) => {
          console.warn('Video element play warning:', playErr);
        });
      }

      setFacingMode(targetFacingMode);
      setIsCameraActive(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Camera access error:', err);
      let errorMessage = 'Camera access is required for AI exercise monitoring.';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Camera access is required for AI exercise monitoring. Please allow camera permissions in your browser.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'No camera device found on your system.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'Camera is currently in use by another application.';
      }

      setCameraError(errorMessage);
      setIsLoading(false);
      stopCamera();
    }
  }, [facingMode, stopCamera]);

  const toggleCameraFacing = useCallback(() => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    startCamera(newFacingMode);
  }, [facingMode, startCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    isCameraActive,
    isLoading,
    cameraError,
    facingMode,
    startCamera,
    stopCamera,
    toggleCameraFacing,
  };
}
