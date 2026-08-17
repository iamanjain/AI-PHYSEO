/**
 * Mini Vector Joint Icons for Live Angles Side Panel
 */

export function ShoulderElevationIcon({ angle = 90, color = '#2dd4bf' }) {
  const rad = ((180 - angle) * Math.PI) / 180;
  const armX = 22 + Math.cos(rad) * 16;
  const armY = 22 - Math.sin(rad) * 16;

  return (
    <svg width="40" height="40" viewBox="0 0 44 44" className="shrink-0">
      {/* Torso Vertical Reference */}
      <line x1="22" y1="22" x2="22" y2="38" stroke="#64748b" strokeWidth="2" />
      <line x1="22" y1="22" x2="22" y2="6" stroke="#475569" strokeWidth="1.5" strokeDasharray="2 2" />
      {/* Shoulder Joint Pivot */}
      <circle cx="22" cy="22" r="3" fill={color} />
      {/* Arm Line */}
      <line x1="22" y1="22" x2={armX} y2={armY} stroke={color} strokeWidth="3" strokeLinecap="round" />
      <circle cx={armX} cy={armY} r="2.5" fill="#ffffff" />
      {/* Arc */}
      <path d={`M 22 14 A 8 8 0 0 1 ${22 + Math.cos(rad) * 8} ${22 - Math.sin(rad) * 8}`} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export function ElbowFlexionIcon({ angle = 175, color = '#2dd4bf' }) {
  const rad = ((180 - angle) * Math.PI) / 180;
  const foreX = 22 + Math.cos(rad) * 16;
  const foreY = 22 + Math.sin(rad) * 16;

  return (
    <svg width="40" height="40" viewBox="0 0 44 44" className="shrink-0">
      {/* Upper Arm Line */}
      <line x1="6" y1="22" x2="22" y2="22" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="6" cy="22" r="2.5" fill="#64748b" />
      {/* Elbow Joint Pivot */}
      <circle cx="22" cy="22" r="3" fill={color} />
      {/* Forearm Line */}
      <line x1="22" y1="22" x2={foreX} y2={foreY} stroke={color} strokeWidth="3" strokeLinecap="round" />
      <circle cx={foreX} cy={foreY} r="2.5" fill="#ffffff" />
      {/* Arc */}
      <path d="M 14 22 A 8 8 0 0 0 20 28" fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export function TorsoTiltIcon({ angle = 2, color = '#2dd4bf' }) {
  const tiltRad = (angle * Math.PI) / 180;
  const topX = 22 + Math.sin(tiltRad) * 14;
  const topY = 22 - Math.cos(tiltRad) * 14;

  return (
    <svg width="40" height="40" viewBox="0 0 44 44" className="shrink-0">
      {/* Vertical Reference */}
      <line x1="22" y1="6" x2="22" y2="38" stroke="#475569" strokeWidth="1.5" strokeDasharray="2 2" />
      {/* Spine Line */}
      <line x1="22" y1="36" x2={topX} y2={topY} stroke={color} strokeWidth="3" strokeLinecap="round" />
      {/* Shoulder Bar */}
      <line x1={topX - 10} y1={topY} x2={topX + 10} y2={topY} stroke={color} strokeWidth="2" />
      <circle cx={topX - 10} cy={topY} r="2.5" fill={color} />
      <circle cx={topX + 10} cy={topY} r="2.5" fill={color} />
      <circle cx="22" cy="36" r="3" fill="#64748b" />
    </svg>
  );
}
