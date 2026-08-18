import {
  ArrowLeft,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Hand,
  UserCheck,
  Square,
} from 'lucide-react';
import VisionCanvasOverlay from './VisionCanvasOverlay';
import FramingGuideOverlay from './FramingGuideOverlay';
import { ShoulderElevationIcon, ElbowFlexionIcon, TorsoTiltIcon } from './JointVectorIcons';

export default function CameraFeed({
  videoRef,
  isCameraActive,
  isLoading,
  cameraError,
  onRetry,
  exerciseName = 'Shoulder Raise',
  landmarksRef,
  leftHandRef,
  rightHandRef,
  _aiStatus,
  framingStatus,
  guidanceText,
  cameraMode = 'upper-body',
  facingMode = 'user',
  _onToggleCamera,
  formattedTime = '00:00',
  onStopSession,
  isFullscreen,
  onToggleFullscreen,
  enableHandTracking = false,
  onToggleHandTracking,
  analysisResult,
  enableVoice = true,
  onToggleVoice,
  voiceSupported = true,
  activeSpeechText = '',
}) {
  const isMirrored = facingMode === 'user';
  const fitMode = 'cover';

  const completedReps = analysisResult?.repetition?.completedReps ?? 0;
  const validReps = analysisResult?.repetition?.repHistory?.filter((r) => r.valid).length ?? completedReps;
  const movementState = analysisResult?.movement?.state || 'IDLE';
  const postureState = analysisResult?.posture?.state || 'INSUFFICIENT_DATA';
  const postureIssues = analysisResult?.posture?.issues || [];
  const angles = analysisResult?.angles || {};

  const isFramingMissing = postureState === 'INSUFFICIENT_DATA' || postureIssues.some((i) => i.code === 'STEP_BACK_FOR_FRAMING' || i.code === 'INSUFFICIENT_TRACKING');
  const isPostureIssue = postureState === 'NEEDS_ATTENTION';

  // Format angles strictly: Display '--' when landmarks are not visible in frame (NO fake default numbers!)
  const leftShoulderElev = (angles.leftShoulderElevation !== null && angles.leftShoulderElevation !== undefined) ? `${angles.leftShoulderElevation}°` : '--';
  const rightShoulderElev = (angles.rightShoulderElevation !== null && angles.rightShoulderElevation !== undefined) ? `${angles.rightShoulderElevation}°` : '--';
  const leftElbowAngle = (angles.leftElbowFlexion !== null && angles.leftElbowFlexion !== undefined) ? `${angles.leftElbowFlexion}°` : '--';
  const rightElbowAngle = (angles.rightElbowFlexion !== null && angles.rightElbowFlexion !== undefined) ? `${angles.rightElbowFlexion}°` : '--';
  const torsoTilt = (angles.torsoTiltDegrees !== null && angles.torsoTiltDegrees !== undefined && !isFramingMissing) ? `${angles.torsoTiltDegrees}°` : '--';

  // Dynamic Step State Verification
  let activeStep = 1; // 1: Position, 2: Posture Check, 3: Active, 4: Complete
  if (isCameraActive && !isLoading) {
    if (completedReps > 0 || (movementState !== 'IDLE' && movementState !== 'INSUFFICIENT_DATA')) {
      activeStep = 3;
    } else if (postureState === 'GOOD' && !isFramingMissing) {
      activeStep = 2;
    } else {
      activeStep = 1;
    }
  }

  return (
    <div className="relative w-full min-h-[88vh] bg-white dark:bg-slate-950 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl flex flex-col justify-between p-3 sm:p-5 transition-colors duration-200">
      
      {/* 1. Top Navigation Bar & 4-Step Guided Progress Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 z-30 pb-3 border-b border-slate-200 dark:border-slate-800/80 transition-colors">
        
        {/* Left: Back Button & Exercise Title */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onStopSession}
            className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
            title="Back / Exit Session"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-wider text-slate-900 dark:text-white uppercase font-mono">
              {exerciseName}
            </h2>
            <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 font-bold block">
              REAL-TIME AI GUIDED SESSION
            </span>
          </div>
        </div>

        {/* Center: 4-Step Visual Progress Bar */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-100 dark:bg-slate-900/90 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <StepBadge num={1} label="Positioning" active={activeStep === 1} completed={activeStep > 1} />
          <span className="text-slate-400 dark:text-slate-700 font-mono text-xs">→</span>
          <StepBadge num={2} label="Posture Check" active={activeStep === 2} completed={activeStep > 2} />
          <span className="text-slate-400 dark:text-slate-700 font-mono text-xs">→</span>
          <StepBadge num={3} label="Exercise Active" active={activeStep === 3} completed={activeStep > 3} />
          <span className="text-slate-400 dark:text-slate-700 font-mono text-xs">→</span>
          <StepBadge num={4} label="Complete" active={activeStep === 4} completed={false} />
        </div>

        {/* Right Controls Group & Single Prominent FINISH EXERCISE Button */}
        <div className="flex items-center space-x-2">
          {/* Prominent Finish / Stop Button */}
          <button
            type="button"
            onClick={onStopSession}
            className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all cursor-pointer border border-red-500"
            title="Finish Exercise & View Report"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">FINISH EXERCISE</span>
            <span className="sm:hidden">STOP</span>
          </button>

          {onToggleVoice && (
            <button
              type="button"
              onClick={onToggleVoice}
              disabled={!voiceSupported}
              className={`p-2 rounded-xl text-xs font-mono font-bold flex items-center border transition-all cursor-pointer ${
                !voiceSupported
                  ? 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                  : enableVoice
                  ? 'bg-cyan-50 dark:bg-cyan-900/80 border-cyan-300 dark:border-cyan-500 text-cyan-700 dark:text-cyan-300'
                  : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
              title={voiceSupported ? 'Toggle Voice Assistance' : 'Voice Unavailable'}
            >
              {enableVoice && voiceSupported ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          )}

          {onToggleHandTracking && (
            <button
              type="button"
              onClick={onToggleHandTracking}
              className={`p-2 rounded-xl border text-xs font-mono font-bold flex items-center transition-all cursor-pointer ${
                enableHandTracking
                  ? 'bg-purple-50 dark:bg-purple-900/80 border-purple-300 dark:border-purple-500 text-purple-700 dark:text-purple-300'
                  : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
              title="Toggle Hand Tracking"
            >
              <Hand className="w-4 h-4" />
            </button>
          )}

          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}

          <button
            type="button"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Main Center Portal Layout (3 Columns: Left Controls | Center Video | Right Live Angles) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 my-3 items-stretch flex-1 relative z-20">
        
        {/* LEFT COLUMN: Time, Valid Reps, Total Reps & Posture Status Card */}
        <div className="lg:col-span-3 flex flex-col justify-between space-y-4">
          
          {/* TIME & REPS BOX */}
          <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-2xl flex flex-col justify-between space-y-4 transition-colors">
            <div>
              <span className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold block mb-1">TIME</span>
              <div className="text-3xl sm:text-4xl font-mono font-black text-slate-900 dark:text-white tracking-widest">
                {formattedTime}
              </div>
            </div>

            {/* Valid Reps & Total Reps Breakdown */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2">
              <div className="bg-white dark:bg-slate-950 p-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 shadow-xs">
                <span className="text-[9px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-extrabold block">VALID REPS</span>
                <span className="text-2xl font-mono font-black text-emerald-600 dark:text-emerald-300">{validReps}</span>
              </div>
              <div className="bg-white dark:bg-slate-950 p-2.5 rounded-2xl border border-cyan-200 dark:border-cyan-900/40 shadow-xs">
                <span className="text-[9px] font-mono uppercase text-cyan-600 dark:text-cyan-400 font-extrabold block">TOTAL REPS</span>
                <span className="text-2xl font-mono font-black text-cyan-600 dark:text-teal-300">{completedReps}</span>
              </div>
            </div>
          </div>

          {/* DYNAMIC POSTURE STATUS CARD */}
          <div
            className={`rounded-3xl p-4 sm:p-5 border-2 shadow-sm dark:shadow-2xl transition-all flex items-start space-x-3 flex-1 ${
              isFramingMissing
                ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-400 dark:border-amber-500 text-amber-900 dark:text-amber-200'
                : isPostureIssue
                ? 'bg-red-50 dark:bg-red-950/80 border-red-400 dark:border-red-500 text-red-900 dark:text-red-200'
                : 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-400 dark:border-emerald-500 text-emerald-900 dark:text-emerald-200'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isFramingMissing ? (
                <div className="w-9 h-9 rounded-2xl bg-amber-100 dark:bg-amber-900/80 border border-amber-400 dark:border-amber-500 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 animate-pulse" />
                </div>
              ) : isPostureIssue ? (
                <div className="w-9 h-9 rounded-2xl bg-red-100 dark:bg-red-900/80 border border-red-400 dark:border-red-500 text-red-700 dark:text-red-300 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-900/80 border border-emerald-400 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
            </div>
            <div>
              <h4 className="text-xs font-mono font-black tracking-wider uppercase">
                {isFramingMissing
                  ? 'POSITIONING CHECK'
                  : isPostureIssue
                  ? 'POSTURE ISSUE'
                  : 'GOOD POSTURE'}
              </h4>
              <p className="text-xs font-medium mt-1 leading-snug">
                {isFramingMissing
                  ? 'Thoda door jaayein taaki aapke shoulders aur torso clearly dikhein.'
                  : isPostureIssue
                  ? postureIssues[0]?.code === 'NOT_ENOUGH_RANGE_RIGHT'
                    ? 'Aapka sidha hath thoda aur upar le jao'
                    : postureIssues[0]?.code === 'NOT_ENOUGH_RANGE_LEFT'
                    ? 'Aapka ulta hath thoda aur upar le jao'
                    : postureIssues[0]?.code === 'ELBOW_TOO_BENT_RIGHT'
                    ? 'Sidhe hath ki elbow ko seedha rakhein'
                    : postureIssues[0]?.code === 'ELBOW_TOO_BENT_LEFT'
                    ? 'Ulte hath ki elbow ko seedha rakhein'
                    : postureIssues[0]?.code === 'TORSO_TILTED_LEFT' || postureIssues[0]?.code === 'TORSO_TILTED_RIGHT'
                    ? 'Body ko seedha rakhein'
                    : 'Movement thoda slowly karein'
                  : 'Posture bilkul sahi hai! Form is stable.'}
              </p>
            </div>
          </div>

        </div>

        {/* CENTER COLUMN: Full Viewport Video Feed with Pose Skeleton */}
        <div className="lg:col-span-6 relative bg-slate-900 dark:bg-slate-950 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl min-h-[420px] lg:min-h-[500px] flex items-center justify-center">
          
          {/* Video Element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isMirrored ? '-scale-x-100' : ''
            } ${isCameraActive ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Unified Vision Canvas Overlay */}
          <VisionCanvasOverlay
            landmarksRef={landmarksRef}
            leftHandRef={leftHandRef}
            rightHandRef={rightHandRef}
            isCameraActive={isCameraActive}
            videoRef={videoRef}
            isMirrored={isMirrored}
            fitMode={fitMode}
            enableHandTracking={enableHandTracking}
            postureState={isFramingMissing ? 'INSUFFICIENT_DATA' : postureState}
          />

          {/* Framing Overlay Guide */}
          {isCameraActive && !isLoading && (
            <FramingGuideOverlay
              cameraMode={cameraMode}
              guidanceText={isFramingMissing ? 'Step back so shoulders & torso are visible' : guidanceText}
              status={isFramingMissing ? 'OUT_OF_BOUNDS' : framingStatus}
            />
          )}

          {/* Speech Bubble Overlay */}
          {activeSpeechText && (
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-35 animate-fadeIn max-w-xs sm:max-w-md w-[90%] pointer-events-none">
              <div className="bg-slate-950/90 backdrop-blur-md border border-cyan-500/80 px-4 py-2 rounded-2xl shadow-2xl flex items-center space-x-2.5 text-xs font-semibold text-cyan-200">
                <Volume2 className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
                <div className="text-left">
                  <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase block leading-none mb-0.5">🔊 AI GUIDE</span>
                  <p className="leading-snug">{activeSpeechText}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading Camera State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
              <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
              <p className="text-white font-medium text-sm">Initializing Camera Stream...</p>
            </div>
          )}

          {/* Camera Error State */}
          {cameraError && !isLoading && (
            <div className="flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-4 z-20">
              <div className="w-14 h-14 rounded-2xl bg-red-950/80 border border-red-800 text-red-400 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1">Camera Access Required</h4>
                <p className="text-slate-300 text-xs leading-relaxed">{cameraError}</p>
              </div>
              <button
                type="button"
                onClick={onRetry}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Camera</span>
              </button>
            </div>
          )}

          {/* Bottom Floating State Pill (Center) & Posture Indicator (Right) */}
          {isCameraActive && !isLoading && (
            <div className="absolute bottom-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
              
              <div className="w-20" />

              {/* Center Floating Exercise State Pill */}
              <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 px-5 py-1.5 rounded-full shadow-2xl flex items-center space-x-2 border-slate-700">
                <span className="text-xs font-mono font-extrabold text-slate-300 uppercase tracking-widest">
                  STATE: <strong className={isFramingMissing ? 'text-amber-400' : isPostureIssue ? 'text-amber-400' : 'text-cyan-400'}>{isFramingMissing ? 'POSITIONING' : movementState}</strong>
                </span>
              </div>

              {/* Right Posture Indicator Dot */}
              <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 px-3.5 py-1 rounded-full shadow-2xl flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isFramingMissing ? 'bg-amber-500 animate-ping' : isPostureIssue ? 'bg-red-500 animate-ping' : 'bg-emerald-400'}`} />
                <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${isFramingMissing ? 'text-amber-300' : isPostureIssue ? 'text-red-300' : 'text-emerald-300'}`}>
                  {isFramingMissing ? 'POSITIONING' : isPostureIssue ? 'POSTURE ISSUE' : 'GOOD POSTURE'}
                </span>
              </div>

            </div>
          )}

        </div>

        {/* RIGHT COLUMN: LIVE ANGLES PANEL */}
        <div className="lg:col-span-3">
          <div
            className={`bg-slate-50 dark:bg-slate-900/90 rounded-3xl p-5 shadow-sm dark:shadow-2xl border-2 transition-all flex flex-col justify-between h-full space-y-4 ${
              isFramingMissing
                ? 'border-amber-400 dark:border-amber-500/80'
                : isPostureIssue
                ? 'border-red-400 dark:border-red-500/80'
                : 'border-emerald-400 dark:border-emerald-500/80'
            }`}
          >
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-mono font-black text-slate-900 dark:text-white uppercase tracking-wider">
                LIVE ANGLES
              </h3>
              <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                isFramingMissing
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                  : isPostureIssue
                  ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800'
                  : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
              }`}>
                {isFramingMissing ? 'POSITIONING' : isPostureIssue ? 'CHECK FORM' : 'LIVE'}
              </span>
            </div>

            {/* Angle Metric Rows with Mini Vector Diagram Icons */}
            <div className="space-y-3.5 flex-1">
              
              {/* 1. Primary Joint Angle (Left) */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800/60">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 block font-bold">
                    {analysisResult?.exerciseId === 'side-leg-raise' ? 'HIP ABDUCTION' : analysisResult?.exerciseId === 'knee-extension' ? 'KNEE ANGLE' : analysisResult?.exerciseId === 'bicep-curls' ? 'ELBOW FLEXION' : 'SHOULDER ELEVATION'}
                  </span>
                  <div className="text-xl font-mono font-black text-slate-900 dark:text-white">
                    {analysisResult?.exerciseId === 'bicep-curls' ? leftElbowAngle : leftShoulderElev} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">(Left)</span>
                  </div>
                </div>
                <ShoulderElevationIcon angle={parseInt(analysisResult?.exerciseId === 'bicep-curls' ? leftElbowAngle : leftShoulderElev) || 0} color={isFramingMissing ? '#f59e0b' : isPostureIssue ? '#f87171' : '#0d9488'} />
              </div>

              {/* 2. Secondary Joint Angle (Left) */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800/60">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 block font-bold">
                    {analysisResult?.exerciseId === 'bicep-curls' ? 'SHOULDER ANGLE' : 'ELBOW FLEXION'}
                  </span>
                  <div className="text-xl font-mono font-black text-slate-900 dark:text-white">
                    {analysisResult?.exerciseId === 'bicep-curls' ? leftShoulderElev : leftElbowAngle} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">(Left)</span>
                  </div>
                </div>
                <ElbowFlexionIcon angle={parseInt(analysisResult?.exerciseId === 'bicep-curls' ? leftShoulderElev : leftElbowAngle) || 0} color={isFramingMissing ? '#f59e0b' : isPostureIssue ? '#f87171' : '#0d9488'} />
              </div>

              {/* 3. Torso Tilt (Spine) */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800/60">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 block font-bold">TORSO TILT</span>
                  <div className="text-xl font-mono font-black text-slate-900 dark:text-white">
                    {torsoTilt} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">(Spine)</span>
                  </div>
                </div>
                <TorsoTiltIcon angle={parseFloat(torsoTilt) || 0} color={isFramingMissing ? '#f59e0b' : isPostureIssue ? '#f87171' : '#0d9488'} />
              </div>

              {/* 4. Primary Joint Angle (Right) */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800/60">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 block font-bold">
                    {analysisResult?.exerciseId === 'side-leg-raise' ? 'HIP ABDUCTION' : analysisResult?.exerciseId === 'knee-extension' ? 'KNEE ANGLE' : analysisResult?.exerciseId === 'bicep-curls' ? 'ELBOW FLEXION' : 'SHOULDER ELEVATION'}
                  </span>
                  <div className="text-xl font-mono font-black text-slate-900 dark:text-white">
                    {analysisResult?.exerciseId === 'bicep-curls' ? rightElbowAngle : rightShoulderElev} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">(Right)</span>
                  </div>
                </div>
                <ShoulderElevationIcon angle={parseInt(analysisResult?.exerciseId === 'bicep-curls' ? rightElbowAngle : rightShoulderElev) || 0} color={isFramingMissing ? '#f59e0b' : isPostureIssue ? '#f87171' : '#0d9488'} />
              </div>

              {/* 5. Secondary Joint Angle (Right) */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 block font-bold">
                    {analysisResult?.exerciseId === 'bicep-curls' ? 'SHOULDER ANGLE' : 'ELBOW FLEXION'}
                  </span>
                  <div className="text-xl font-mono font-black text-slate-900 dark:text-white">
                    {analysisResult?.exerciseId === 'bicep-curls' ? rightShoulderElev : rightElbowAngle} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">(Right)</span>
                  </div>
                </div>
                <ElbowFlexionIcon angle={parseInt(analysisResult?.exerciseId === 'bicep-curls' ? rightShoulderElev : rightElbowAngle) || 0} color={isFramingMissing ? '#f59e0b' : isPostureIssue ? '#f87171' : '#0d9488'} />
              </div>

            </div>

            {/* Bottom Panel Status Pill */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500 dark:text-slate-400">STATUS:</span>
              <span className={`font-bold ${isFramingMissing ? 'text-amber-600 dark:text-amber-400' : isPostureIssue ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {isFramingMissing ? 'POSITIONING CHECK' : isPostureIssue ? 'NEEDS ATTENTION' : 'GOOD POSTURE'}
              </span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

function StepBadge({ num, label, active, completed }) {
  return (
    <div className={`flex items-center space-x-1.5 text-[11px] font-mono font-bold ${
      active
        ? 'text-teal-600 dark:text-teal-300'
        : completed
        ? 'text-emerald-600 dark:text-emerald-400'
        : 'text-slate-400 dark:text-slate-500'
    }`}>
      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
        active
          ? 'bg-teal-600 text-white font-black'
          : completed
          ? 'bg-emerald-600 text-white font-black'
          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-500'
      }`}>
        {num}
      </span>
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
}
