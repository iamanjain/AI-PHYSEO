import { useEffect, useState, useRef, useCallback } from 'react';
import { useAppParams, useAppNavigate } from '../utils/navigation';
import { EXERCISES } from '../data/rehabData';
import { useRehabSession } from '../hooks/useRehabSession';
import { useCamera } from '../hooks/useCamera';
import { useFullscreen } from '../hooks/useFullscreen';
import { PoseDetectorEngine } from '../ai-engine/pose/poseDetector';
import { LandmarkSmoother } from '../ai-engine/pose/landmarkSmoother';
import { filterLandmarkConfidence } from '../ai-engine/pose/landmarkFilter';
import { analyzeFraming } from '../ai-engine/pose/framingAnalyzer';
import {
  analyzeUnifiedFrame,
  initHandDetector,
  closeHandDetector,
  startExerciseSession,
  resetExerciseSession,
  endExerciseSession,
  processVoiceFeedback,
  stopVoiceAssistant,
  setVoiceAssistantEnabled,
  isVoiceSupported,
} from '../ai-engine/index.js';
import CameraFeed from '../components/CameraFeed';

export default function ExerciseSessionPage() {
  const { id } = useAppParams();
  const navigate = useAppNavigate();
  const exercise = EXERCISES.find((item) => item.id === id);

  const recommendedMode = exercise?.cameraConfig?.mode || 'upper-body';
  const [cameraMode] = useState(recommendedMode);
  const [enableHandTracking, setEnableHandTracking] = useState(false);
  const [enableVoice, setEnableVoice] = useState(true);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [activeSpeechText, setActiveSpeechText] = useState('');

  const sessionContainerRef = useRef(null);
  const { isFullscreen, toggleFullscreen, exitFullscreen } = useFullscreen(sessionContainerRef);

  const { formattedTime, startSession, endSession } = useRehabSession();
  const {
    videoRef,
    isCameraActive,
    isLoading,
    cameraError,
    facingMode,
    startCamera,
    stopCamera,
    toggleCameraFacing,
  } = useCamera();

  // High-performance refs for 60fps frame tracking
  const landmarksRef = useRef([]);
  const leftHandRef = useRef(null);
  const rightHandRef = useRef(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  // UI-level status state
  const [_aiStatus, setAiStatus] = useState('INITIALIZING');
  const [framingStatus, setFramingStatus] = useState('NO_PERSON');
  const [guidanceText, setGuidanceText] = useState('Initializing AI pose detection...');

  const detectorRef = useRef(null);
  const smootherRef = useRef(new LandmarkSmoother(0.65));
  const animFrameId = useRef(null);
  const frameCountRef = useRef(0);
  const lastGuidanceStatusRef = useRef('');
  const lastHudUpdateRef = useRef(0);
  const speechBubbleTimerRef = useRef(null);

  // Check speech synthesis support on mount
  useEffect(() => {
    setVoiceSupported(isVoiceSupported());
  }, []);

  // Initialize MediaPipe PoseLandmarker Engine & Start AI Exercise Session
  useEffect(() => {
    let isMounted = true;
    const detector = new PoseDetectorEngine();
    const smoother = smootherRef.current;
    detectorRef.current = detector;

    startExerciseSession(id);

    async function initPoseEngine() {
      setAiStatus('INITIALIZING');
      const success = await detector.initialize();
      if (isMounted) {
        if (!success) {
          setAiStatus('ERROR');
          setGuidanceText('Pose detection unavailable');
        }
      }
    }

    initPoseEngine();

    return () => {
      isMounted = false;
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
      if (detector) {
        detector.close();
        detectorRef.current = null;
      }
      if (smoother) {
        smoother.reset();
      }
      if (speechBubbleTimerRef.current) {
        clearTimeout(speechBubbleTimerRef.current);
      }
      closeHandDetector();
      stopVoiceAssistant();
      resetExerciseSession(id);
    };
  }, [id]);

  // Toggle Voice Assistant handler
  const handleToggleVoice = useCallback(() => {
    const nextState = !enableVoice;
    setEnableVoice(nextState);
    setVoiceAssistantEnabled(nextState);
    if (!nextState) {
      setActiveSpeechText('');
    }
  }, [enableVoice]);

  // Toggle Hand Tracking handler
  const handleToggleHandTracking = useCallback(async () => {
    const nextState = !enableHandTracking;
    if (nextState) {
      setGuidanceText('Initializing Hand Landmarker...');
      await initHandDetector();
    }
    setEnableHandTracking(nextState);
  }, [enableHandTracking]);

  // High-performance frame loop (0 React re-renders per frame)
  useEffect(() => {
    let isProcessing = true;

    function processFrame(timestamp) {
      if (!isProcessing) return;

      const video = videoRef.current;
      const detector = detectorRef.current;
      const smoother = smootherRef.current;

      if (isCameraActive && video && detector && detector.isInitialized && video.readyState >= 2) {
        frameCountRef.current++;

        // 1. MediaPipe Pose Detection
        const result = detector.detect(video, timestamp);

        if (result && result.landmarks && result.landmarks.length > 0) {
          const filtered = filterLandmarkConfidence(result.landmarks, 0.35);
          const smoothed = smoother.smooth(filtered);

          landmarksRef.current = smoothed;

          // 2. Unified Analysis
          const analysis = analyzeUnifiedFrame({
            videoElement: video,
            timestamp,
            exerciseId: id,
            poseLandmarks: smoothed,
            enableHandTracking,
            handThrottleInterval: 3,
            frameCount: frameCountRef.current,
          });

          leftHandRef.current = analysis.leftHandLandmarks;
          rightHandRef.current = analysis.rightHandLandmarks;

          // 3. Event-Driven Real-Time Voice Guidance & Visual Prompt Processing
          if (enableVoice) {
            const voiceResult = processVoiceFeedback(analysis);
            if (voiceResult) {
              if (voiceResult.spoken && voiceResult.text) {
                setActiveSpeechText(voiceResult.text);
                if (speechBubbleTimerRef.current) {
                  clearTimeout(speechBubbleTimerRef.current);
                }
                speechBubbleTimerRef.current = setTimeout(() => {
                  setActiveSpeechText('');
                }, 3200);
              }
            }
          }

          // Throttle UI updates to 10 Hz (every 100ms)
          if (timestamp - lastHudUpdateRef.current >= 100) {
            lastHudUpdateRef.current = timestamp;
            setAnalysisResult(analysis);
          }

          // 4. Framing Analyzer
          const containerWidth = video.clientWidth || 640;
          const containerHeight = video.clientHeight || 480;
          const videoWidth = video.videoWidth || 1280;
          const videoHeight = video.videoHeight || 720;
          const isMirrored = facingMode === 'user';

          const framing = analyzeFraming(
            smoothed,
            cameraMode,
            containerWidth,
            containerHeight,
            videoWidth,
            videoHeight,
            isMirrored,
            'cover'
          );
          
          if (framing.status !== lastGuidanceStatusRef.current) {
            lastGuidanceStatusRef.current = framing.status;
            setFramingStatus(framing.status);
            setGuidanceText(framing.guidanceText);
          }

          setAiStatus('ACTIVE');
        } else {
          landmarksRef.current = [];
          leftHandRef.current = null;
          rightHandRef.current = null;
          smoother.reset();

          if (enableVoice) {
            const voiceResult = processVoiceFeedback(null);
            if (voiceResult && voiceResult.spoken && voiceResult.text) {
              setActiveSpeechText(voiceResult.text);
              if (speechBubbleTimerRef.current) {
                clearTimeout(speechBubbleTimerRef.current);
              }
              speechBubbleTimerRef.current = setTimeout(() => {
                setActiveSpeechText('');
              }, 3200);
            }
          }

          if (timestamp - lastHudUpdateRef.current >= 100) {
            lastHudUpdateRef.current = timestamp;
            setAnalysisResult(null);
          }

          if (lastGuidanceStatusRef.current !== 'NO_PERSON') {
            lastGuidanceStatusRef.current = 'NO_PERSON';
            setFramingStatus('NO_PERSON');
            setGuidanceText('No person detected');
          }
          setAiStatus('NO_PERSON');
        }
      }

      if (isProcessing) {
        animFrameId.current = requestAnimationFrame(processFrame);
      }
    }

    if (isCameraActive) {
      startSession();
      animFrameId.current = requestAnimationFrame(processFrame);
    }

    return () => {
      isProcessing = false;
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [id, isCameraActive, cameraMode, facingMode, enableHandTracking, enableVoice, startSession, videoRef]);

  // Start camera on session mount
  useEffect(() => {
    startCamera();
    return () => {
      endSession();
      stopCamera();
      exitFullscreen();
    };
  }, [startCamera, stopCamera, endSession, exitFullscreen]);

  // Stop Exercise Handler — Finalizes session, generates AI report, saves to localStorage & navigates to report page
  const handleStopSession = useCallback(() => {
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
    }
    if (detectorRef.current) {
      detectorRef.current.close();
    }
    if (smootherRef.current) {
      smootherRef.current.reset();
    }
    if (speechBubbleTimerRef.current) {
      clearTimeout(speechBubbleTimerRef.current);
    }
    closeHandDetector();

    // Finalize session and generate report
    const report = endExerciseSession();

    exitFullscreen();
    stopCamera();
    endSession();

    // Navigate to generated report view
    if (report && report.sessionId) {
      navigate(`/report/${report.sessionId}`);
    } else {
      navigate('/exercises');
    }
  }, [endSession, exitFullscreen, navigate, stopCamera]);

  return (
    <div
      ref={sessionContainerRef}
      className="py-2 px-2 sm:py-4 sm:px-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white min-h-[calc(100vh-4rem)] flex flex-col justify-center select-none relative transition-colors duration-200"
    >
      <div className="max-w-4xl mx-auto w-full space-y-3 relative">
        {/* Automated Clean Patient-Facing Exercise Camera Portal */}
        <CameraFeed
          videoRef={videoRef}
          isCameraActive={isCameraActive}
          isLoading={isLoading}
          cameraError={cameraError}
          onRetry={startCamera}
          exerciseName={exercise?.name}
          landmarksRef={landmarksRef}
          leftHandRef={leftHandRef}
          rightHandRef={rightHandRef}
          _aiStatus={_aiStatus}
          framingStatus={framingStatus}
          guidanceText={guidanceText}
          cameraMode={cameraMode}
          facingMode={facingMode}
          _onToggleCamera={toggleCameraFacing}
          formattedTime={formattedTime}
          onStopSession={handleStopSession}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          enableHandTracking={enableHandTracking}
          onToggleHandTracking={handleToggleHandTracking}
          analysisResult={analysisResult}
          enableVoice={enableVoice}
          onToggleVoice={handleToggleVoice}
          voiceSupported={voiceSupported}
          activeSpeechText={activeSpeechText}
        />
      </div>
    </div>
  );
}
