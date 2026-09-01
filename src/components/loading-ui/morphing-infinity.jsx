import "./morphing-infinity.css";

export function MorphingInfinity({ className = "", size = 24, color = "#4f3c34", ...props }) {
  return <span className={`mi-fallback ${className}`} style={{ width: size, height: size }} aria-hidden="true" {...props}>
    <svg viewBox="0 0 100 30" width={size} height={size} className="mi-svg" preserveAspectRatio="xMidYMid meet">
      <g fill="none" stroke={color} strokeWidth="4" strokeLinecap="round">
        <path d="M5 15 C 20 5, 40 5, 55 15 S 90 25, 95 15" className="mi-path" />
      </g>
    </svg>
  </span>;
}

export default MorphingInfinity;
