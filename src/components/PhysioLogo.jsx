/**
 * PhysioTrack — Clinical Biomechanics & Physiotherapy Brand Logo
 * Symbolizes human kinetic movement, joint angle articulation, and AI posture tracking.
 */
export default function PhysioLogo({ className = 'w-6 h-6', variant = 'icon' }) {
  if (variant === 'badge') {
    return (
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-white"
        >
          {/* Head Keypoint */}
          <circle cx="12" cy="3.5" r="2" fill="currentColor" />
          {/* Torso & Kinetic Arms (Physio Motion Arc) */}
          <path d="M5 8.5L12 6.5L19 8.5" />
          <path d="M12 6.5V14" />
          <path d="M5 8.5L3.5 13.5" />
          <path d="M19 8.5L20.5 13.5" />
          {/* Pelvis & Lower Body Kinematics */}
          <path d="M8.5 19.5L12 14L15.5 19.5" />
          <path d="M7 22L8.5 19.5" />
          <path d="M17 22L15.5 19.5" />
          {/* Joint Articulation Nodes */}
          <circle cx="5" cy="8.5" r="0.9" fill="currentColor" />
          <circle cx="19" cy="8.5" r="0.9" fill="currentColor" />
        </svg>
      </div>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="3.5" r="2" fill="currentColor" />
      <path d="M5 8.5L12 6.5L19 8.5" />
      <path d="M12 6.5V14" />
      <path d="M5 8.5L3.5 13.5" />
      <path d="M19 8.5L20.5 13.5" />
      <path d="M8.5 19.5L12 14L15.5 19.5" />
      <path d="M7 22L8.5 19.5" />
      <path d="M17 22L15.5 19.5" />
      <circle cx="5" cy="8.5" r="0.9" fill="currentColor" />
      <circle cx="19" cy="8.5" r="0.9" fill="currentColor" />
    </svg>
  );
}
