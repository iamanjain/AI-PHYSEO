import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

/**
 * AI Engine — Hand Detector Engine
 * Encapsulates MediaPipe Tasks Vision HandLandmarker for 21-point dual hand tracking.
 */
export class HandDetectorEngine {
  constructor() {
    this.handLandmarker = null;
    this.isInitialized = false;
    this.isInitializing = false;
  }

  async initialize() {
    if (this.isInitialized || this.isInitializing) return true;
    this.isInitializing = true;

    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.isInitialized = true;
      this.isInitializing = false;
      return true;
    } catch (err) {
      console.warn('GPU delegate failed for HandLandmarker, falling back to CPU:', err);
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        this.isInitialized = true;
        this.isInitializing = false;
        return true;
      } catch (fallbackErr) {
        console.error('Failed to initialize HandLandmarker:', fallbackErr);
        this.isInitializing = false;
        return false;
      }
    }
  }

  detect(videoElement, timestamp = performance.now()) {
    if (!this.isInitialized || !this.handLandmarker || !videoElement) {
      return null;
    }

    try {
      const results = this.handLandmarker.detectForVideo(videoElement, timestamp);
      return results;
    } catch (err) {
      console.warn('Hand detection frame error:', err);
      return null;
    }
  }

  close() {
    if (this.handLandmarker) {
      try {
        this.handLandmarker.close();
      } catch {
        // ignore close error
      }
      this.handLandmarker = null;
    }
    this.isInitialized = false;
    this.isInitializing = false;
  }
}
