/**
 * AI Engine — Coordinate Mapper
 * Single explicit coordinate transformation pipeline for object-fit: cover / contain and mirroring.
 *
 * Inputs:
 * - landmark: MediaPipe normalized landmark { x, y, z }
 * - containerWidth, containerHeight: Rendered canvas/video container dimensions
 * - videoWidth, videoHeight: Raw camera native resolution (e.g. 1280x720)
 * - isMirrored: boolean (true for front selfie camera)
 * - fitMode: 'cover' | 'contain'
 *
 * Returns: { x: pixelX, y: pixelY }
 */

export function mapLandmarkToCanvasPixel(
  landmark,
  containerWidth,
  containerHeight,
  videoWidth = 1280,
  videoHeight = 720,
  isMirrored = true,
  fitMode = 'cover'
) {
  if (!landmark) return { x: 0, y: 0 };

  const validVideoWidth = (videoWidth && videoWidth > 0) ? videoWidth : 1280;
  const validVideoHeight = (videoHeight && videoHeight > 0) ? videoHeight : 720;
  const validContainerWidth = (containerWidth && containerWidth > 0) ? containerWidth : 640;
  const validContainerHeight = (containerHeight && containerHeight > 0) ? containerHeight : 480;

  const scale = fitMode === 'cover'
    ? Math.max(validContainerWidth / validVideoWidth, validContainerHeight / validVideoHeight)
    : Math.min(validContainerWidth / validVideoWidth, validContainerHeight / validVideoHeight);

  const scaledVideoWidth = validVideoWidth * scale;
  const scaledVideoHeight = validVideoHeight * scale;

  const offsetX = (validContainerWidth - scaledVideoWidth) / 2;
  const offsetY = (validContainerHeight - scaledVideoHeight) / 2;

  // Single explicit horizontal mirror transformation
  const mappedX = isMirrored ? (1 - landmark.x) : landmark.x;

  const pixelX = offsetX + mappedX * scaledVideoWidth;
  const pixelY = offsetY + landmark.y * scaledVideoHeight;

  return { x: pixelX, y: pixelY };
}
