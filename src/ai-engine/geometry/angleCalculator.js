import { subtract, dot, magnitude } from './vectorUtils';

/**
 * AI Engine — Joint Angle Calculator
 * Calculates the biomechanical joint angle A -> B -> C in degrees (0 - 180).
 * Point B is the joint pivot vertex.
 *
 * Example:
 * calculateAngle(HIP, SHOULDER, WRIST) -> Primary Shoulder Elevation Angle
 * calculateAngle(SHOULDER, ELBOW, WRIST) -> Elbow Flexion Angle
 */
export function calculateAngle(pointA, pointB, pointC, visibilityThreshold = 0.35) {
  if (!pointA || !pointB || !pointC) {
    return null;
  }

  // Verify landmark visibility/presence scores
  const visA = pointA.visibility ?? pointA.presence ?? 1.0;
  const visB = pointB.visibility ?? pointB.presence ?? 1.0;
  const visC = pointC.visibility ?? pointC.presence ?? 1.0;

  if (visA < visibilityThreshold || visB < visibilityThreshold || visC < visibilityThreshold) {
    return null;
  }

  // Vectors from joint vertex B to endpoints A and C
  const vectorBA = subtract(pointA, pointB);
  const vectorBC = subtract(pointC, pointB);

  const magBA = magnitude(vectorBA);
  const magBC = magnitude(vectorBC);

  // Prevent divide-by-zero or degenerate vectors
  if (magBA < 1e-6 || magBC < 1e-6) {
    return null;
  }

  // Cosine theorem dot product formula
  const dotProduct = dot(vectorBA, vectorBC);
  const cosTheta = dotProduct / (magBA * magBC);

  // Strict numerical clamping to [-1.0, 1.0] to prevent NaN from acos
  const clampedCos = Math.max(-1.0, Math.min(1.0, cosTheta));

  // Convert radians to degrees
  const angleDegrees = Math.acos(clampedCos) * (180 / Math.PI);

  if (isNaN(angleDegrees) || !isFinite(angleDegrees)) {
    return null;
  }

  return Math.round(angleDegrees * 10) / 10;
}
