import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

/**
 * AI Engine — Pose Detector Engine
 * Encapsulates MediaPipe Tasks Vision PoseLandmarker initialization, video frame detection, and memory cleanup.
 */
export class PoseDetectorEngine {
  constructor(options = {}) {
    this.options = options;
    this.landmarker = null;
    this.isInitialized = false;
    this.isLoading = false;
    this.initError = null;
  }

  async initialize() {
    if (this.isInitialized) return true;
    if (this.isLoading) return false;

    this.isLoading = true;
    this.initError = null;

    try {
      // Load WASM fileset from jsDelivr CDN
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      // Create PoseLandmarker using official lite model asset
      this.landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.isInitialized = true;
      this.isLoading = false;
      return true;
    } catch (err) {
      console.error('MediaPipe PoseLandmarker initialization error:', err);
      // Fallback attempt without GPU delegate if GPU fails on low-end devices
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        this.landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        this.isInitialized = true;
        this.isLoading = false;
        return true;
      } catch (fallbackErr) {
        console.error('MediaPipe CPU Fallback initialization error:', fallbackErr);
        this.initError = fallbackErr.message || 'Failed to initialize MediaPipe Pose Detector';
        this.isLoading = false;
        return false;
      }
    }
  }

  detect(videoElement, timestamp = performance.now()) {
    if (!this.isInitialized || !this.landmarker || !videoElement) {
      return null;
    }

    if (videoElement.readyState < 2) {
      return null;
    }

    try {
      const results = this.landmarker.detectForVideo(videoElement, timestamp);
      if (results && results.landmarks && results.landmarks.length > 0) {
        return {
          landmarks: results.landmarks[0],
          worldLandmarks: results.worldLandmarks ? results.worldLandmarks[0] : null,
        };
      }
    } catch (err) {
      console.warn('Pose detection frame processing warning:', err);
    }

    return null;
  }

  close() {
    if (this.landmarker) {
      try {
        this.landmarker.close();
      } catch (err) {
        console.warn('Error closing MediaPipe landmarker:', err);
      }
      this.landmarker = null;
    }
    this.isInitialized = false;
    this.isLoading = false;
  }
}
