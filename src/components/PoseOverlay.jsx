import { useEffect, useRef } from 'react';
import { POSE_CONNECTIONS } from '../ai-engine/pose/landmarkUtils';
import { mapLandmarkToCanvasPixel } from '../ai-engine/pose/coordinateMapper';

export default function PoseOverlay({
  landmarks,
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

    if (!isCameraActive || !landmarks || landmarks.length === 0) {
      return;
    }

    const video = videoRef?.current;
    const videoWidth = video?.videoWidth || 1280;
    const videoHeight = video?.videoHeight || 720;

    // Helper mapping using single explicit coordinate mapper
    const getMappedPixel = (lm) => mapLandmarkToCanvasPixel(
      lm,
      width,
      height,
      videoWidth,
      videoHeight,
      isMirrored,
      fitMode
    );

    // Draw Skeleton Connection Lines
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#06b6d4'; // Cyan-500
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    POSE_CONNECTIONS.forEach(([startIndex, endIndex]) => {
      const start = landmarks[startIndex];
      const end = landmarks[endIndex];

      if (start && end && (start.visibility ?? 1) > 0.35 && (end.visibility ?? 1) > 0.35) {
        const p1 = getMappedPixel(start);
        const p2 = getMappedPixel(end);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    });

    // Draw Landmark Keypoint Dots
    landmarks.forEach((lm) => {
      if (lm && (lm.visibility ?? 1) > 0.35) {
        const p = getMappedPixel(lm);

        // Outer glow halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6.5, 0, 2 * Math.PI);
        ctx.fillStyle = '#0d9488'; // Teal-600
        ctx.fill();

        // Inner core
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
    });

  }, [landmarks, isCameraActive, videoRef, isMirrored, fitMode]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
}
