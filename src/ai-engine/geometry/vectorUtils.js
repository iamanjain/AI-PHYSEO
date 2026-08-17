/**
 * AI Engine — Vector Mathematics Utilities
 * Generic 2D/3D vector calculations for MediaPipe landmark objects { x, y, z, visibility }.
 */

export function subtract(a, b) {
  if (!a || !b) return { x: 0, y: 0, z: 0 };
  return {
    x: (a.x ?? 0) - (b.x ?? 0),
    y: (a.y ?? 0) - (b.y ?? 0),
    z: (a.z ?? 0) - (b.z ?? 0),
  };
}

export function add(a, b) {
  if (!a || !b) return { x: 0, y: 0, z: 0 };
  return {
    x: (a.x ?? 0) + (b.x ?? 0),
    y: (a.y ?? 0) + (b.y ?? 0),
    z: (a.z ?? 0) + (b.z ?? 0),
  };
}

export function distance(a, b) {
  if (!a || !b) return 0;
  const dx = (a.x ?? 0) - (b.x ?? 0);
  const dy = (a.y ?? 0) - (b.y ?? 0);
  const dz = (a.z ?? 0) - (b.z ?? 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function magnitude(v) {
  if (!v) return 0;
  return Math.sqrt((v.x ?? 0) * (v.x ?? 0) + (v.y ?? 0) * (v.y ?? 0) + (v.z ?? 0) * (v.z ?? 0));
}

export function normalize(v) {
  const mag = magnitude(v);
  if (mag === 0) return { x: 0, y: 0, z: 0 };
  return {
    x: (v.x ?? 0) / mag,
    y: (v.y ?? 0) / mag,
    z: (v.z ?? 0) / mag,
  };
}

export function dot(a, b) {
  if (!a || !b) return 0;
  return (a.x ?? 0) * (b.x ?? 0) + (a.y ?? 0) * (b.y ?? 0) + (a.z ?? 0) * (b.z ?? 0);
}
