import { useEffect, useRef } from 'react';
import { HAND_CONNECTIONS } from '../ai-engine/hands/handLandmarkUtils';
import { mapLandmarkToCanvasPixel } from '../ai-engine/pose/coordinateMapper';

export default function HandPoseOverlay({
  leftHandLandmarks,
  rightHandLandmarks,
  isCameraActive,
  videoRef,
  isMirrored = true,
  fitMode = 'cover',
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.clientWidth || 640;
    const height = canvas.clientHeight || 480;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    ctx.clearRect(0, 0, width, height);

    if (!isCameraActive) return;

    const video = videoRef?.current;
    const videoWidth = video?.videoWidth || 1280;
    const videoHeight = video?.videoHeight || 720;

    const renderHandSkeleton = (handLandmarks, strokeColor, fillColor) => {
      if (!handLandmarks || handLandmarks.length === 0) return;

      const getMappedPixel = (lm) => mapLandmarkToCanvasPixel(
        lm,
        width,
        height,
        videoWidth,
        videoHeight,
        isMirrored,
        fitMode
      );

      // Draw Hand Connections
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = strokeColor;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      HAND_CONNECTIONS.forEach(([startIndex, endIndex]) => {
        const start = handLandmarks[startIndex];
        const end = handLandmarks[endIndex];

        if (start && end) {
          const p1 = getMappedPixel(start);
          const p2 = getMappedPixel(end);

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      });

      // Draw 21 Hand Keypoint Dots
      handLandmarks.forEach((lm) => {
        if (lm) {
          const p = getMappedPixel(lm);

          // Outer Keypoint Circle
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4.5, 0, 2 * Math.PI);
          ctx.fillStyle = fillColor;
          ctx.fill();

          // Inner Core White Dot
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
      });
    };

    // Render Left Hand (Purple/Pink Theme)
    renderHandSkeleton(leftHandLandmarks, '#c084fc', '#9333ea');

    // Render Right Hand (Emerald/Teal Theme)
    renderHandSkeleton(rightHandLandmarks, '#34d399', '#059669');

  }, [leftHandLandmarks, rightHandLandmarks, isCameraActive, videoRef, isMirrored, fitMode]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-15"
    />
  );
}
