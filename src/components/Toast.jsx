import { useEffect } from "react";
import Icon from "./Icon";

export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(onDismiss, 4000);
    return () => window.clearTimeout(timeout);
  }, [onDismiss, toast]);

  if (!toast) return null;

  return (
    <div
      className={`injaz-toast is-${toast.type}`}
      role={toast.type === "error" ? "alert" : "status"}
      aria-atomic="true"
    >
      <span>{toast.message}</span>
      <button type="button" onClick={onDismiss} aria-label={toast.closeLabel}>
        <Icon name="close" size={18} />
      </button>
    </div>
  );
}
