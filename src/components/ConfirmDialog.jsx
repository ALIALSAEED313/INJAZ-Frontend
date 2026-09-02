import { useEffect, useRef } from "react";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  busy = false,
  variant = "primary",
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    if (open && !dialog.open) {
      previousFocusRef.current = document.activeElement;
      dialog.showModal();
      requestAnimationFrame(() => cancelButtonRef.current?.focus());
    } else if (!open && dialog.open) {
      dialog.close();
    }

    return () => {
      if (dialog.open) dialog.close();
      previousFocusRef.current?.focus?.();
    };
  }, [open]);

  function closeDialog() {
    if (busy) return;
    onCancel();
    requestAnimationFrame(() => previousFocusRef.current?.focus?.());
  }

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      className="injaz-confirm-dialog"
      aria-labelledby="injaz-confirm-title"
      aria-describedby="injaz-confirm-description"
      onCancel={event => {
        event.preventDefault();
        closeDialog();
      }}
      onClick={event => {
        if (event.target === event.currentTarget) closeDialog();
      }}
    >
      <div className="injaz-confirm-dialog__surface">
        <h2 id="injaz-confirm-title">{title}</h2>
        <p id="injaz-confirm-description">{description}</p>
        <div className="action-group injaz-confirm-dialog__actions">
          <button
            ref={cancelButtonRef}
            type="button"
            className="secondary-btn"
            disabled={busy}
            onClick={closeDialog}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={variant === "danger" ? "danger-btn" : "primary-btn"}
            disabled={busy}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
