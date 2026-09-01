import MorphingInfinity from "./morphing-infinity";
import "./morphing-infinity.css";

export function PageLoader({ message, size = 56 }) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <MorphingInfinity className="page-loader-icon" size={size} />
      {message && <div className="page-loader-message">{message}</div>}
    </div>
  );
}

export function InlineLoader({ size = 20, label }) {
  return (
    <span className="inline-loader" role="status" aria-live="polite">
      <MorphingInfinity className="inline-loader-icon" size={size} />
      {label && <span className="inline-loader-label">{label}</span>}
    </span>
  );
}

export function ButtonLoader({ size = 16 }) {
  return <MorphingInfinity className="button-loader-icon" size={size} aria-hidden="true" />;
}

export function AvatarLoader({ size = 32 }) {
  return <div className="avatar-loader" style={{ width: size, height: size }}><MorphingInfinity size={size} /></div>;
}

export default PageLoader;
