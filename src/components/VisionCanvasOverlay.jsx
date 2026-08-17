import { useEffect, useRef } from 'react';
import { POSE_CONNECTIONS } from '../ai-engine/pose/landmarkUtils';
import { HAND_CONNECTIONS } from '../ai-engine/hands/handLandmarkUtils';
import { mapLandmarkToCanvasPixel } from '../ai-engine/pose/coordinateMapper';

/**
 * High-Performance Unified Vision Canvas Overlay
 * Renders Pose and Hand skeletons directly via requestAnimationFrame and Refs.
 * Dynamic posture color feedback (Teal for Good, Red/Amber for Posture Issue).
 */
export default function VisionCanvasOverlay({
  landmarksRef,
  leftHandRef,
  rightHandRef,
  isCameraActive,
  videoRef,
  isMirrored = true,
  fitMode = 'cover',
  enableHandTracking = false,
  postureState = 'GOOD',
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    let animId = null;

    function renderFrame() {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.clientWidth || 640;
          const height = canvas.clientHeight || 480;

          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
          }

          ctx.clearRect(0, 0, width, height);

          if (isCameraActive) {
            const video = videoRef?.current;
            const videoWidth = video?.videoWidth || 1280;
            const videoHeight = video?.videoHeight || 720;

            const mapPixel = (lm) => mapLandmarkToCanvasPixel(
              lm,
              width,
              height,
              videoWidth,
              videoHeight,
              isMirrored,
              fitMode
            );

            // Dynamic Skeleton Color based on Posture State
            const isIssue = postureState === 'NEEDS_ATTENTION';
            const isPositioning = postureState === 'INSUFFICIENT_DATA';
            const strokeColor = isIssue ? '#ef4444' : isPositioning ? '#f59e0b' : '#06b6d4'; // Red vs Amber vs Cyan
            const fillColor = isIssue ? '#dc2626' : isPositioning ? '#d97706' : '#0d9488';   // Red vs Amber vs Teal

            // 1. Draw Body Pose Skeleton
            const bodyLandmarks = landmarksRef?.current;
            if (bodyLandmarks && bodyLandmarks.length > 0) {
              ctx.lineWidth = 3.5;
              ctx.strokeStyle = strokeColor;
              ctx.lineCap = 'round';
              ctx.lineJoin = 'round';

              POSE_CONNECTIONS.forEach(([startIndex, endIndex]) => {
                const start = bodyLandmarks[startIndex];
                const end = bodyLandmarks[endIndex];

                if (start && end && (start.visibility ?? 1) > 0.35 && (end.visibility ?? 1) > 0.35) {
                  const p1 = mapPixel(start);
                  const p2 = mapPixel(end);

                  ctx.beginPath();
                  ctx.moveTo(p1.x, p1.y);
                  ctx.lineTo(p2.x, p2.y);
                  ctx.stroke();
                }
              });

              // Body Keypoints
              bodyLandmarks.forEach((lm) => {
                if (lm && (lm.visibility ?? 1) > 0.35) {
                  const p = mapPixel(lm);
                  ctx.beginPath();
                  ctx.arc(p.x, p.y, 6, 0, 2 * Math.PI);
                  ctx.fillStyle = fillColor;
                  ctx.fill();
                  ctx.beginPath();
                  ctx.arc(p.x, p.y, 2.5, 0, 2 * Math.PI);
                  ctx.fillStyle = '#ffffff';
                  ctx.fill();
                }
              });
            }

            // 2. Draw Hand Skeletons if enabled
            if (enableHandTracking) {
              const renderHand = (handLandmarks, hStrokeColor, hFillColor) => {
                if (!handLandmarks || handLandmarks.length === 0) return;

                ctx.lineWidth = 2.5;
                ctx.strokeStyle = hStrokeColor;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                HAND_CONNECTIONS.forEach(([startIndex, endIndex]) => {
                  const start = handLandmarks[startIndex];
                  const end = handLandmarks[endIndex];

                  if (start && end) {
                    const p1 = mapPixel(start);
                    const p2 = mapPixel(end);

                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                  }
                });

                handLandmarks.forEach((lm) => {
                  if (lm) {
                    const p = mapPixel(lm);
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
                    ctx.fillStyle = hFillColor;
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 1.8, 0, 2 * Math.PI);
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();
                  }
                });
              };

              renderHand(leftHandRef?.current, '#c084fc', '#9333ea');
              renderHand(rightHandRef?.current, '#34d399', '#059669');
            }
          }
        }
      }

      animId = requestAnimationFrame(renderFrame);
    }

    animId = requestAnimationFrame(renderFrame);

    return () => {
      if (animId) {
        cancelAnimationFrame(animId);
      }
    };
  }, [isCameraActive, videoRef, isMirrored, fitMode, enableHandTracking, postureState, landmarksRef, leftHandRef, rightHandRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
}
