"use client";

// A small centered confirmation popup. Used before removing cart items.
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Remove",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} aria-hidden />
      <div
        role="dialog"
        aria-label={title}
        className="relative w-full max-w-sm rounded-2xl border border-edge bg-coal p-6 text-chalk shadow-2xl"
      >
        <h3 className="font-heading text-lg font-bold">{title}</h3>
        <p className="mt-2 text-sm text-ash">{message}</p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="h-10 flex-1 rounded-full border border-edge text-sm font-medium text-chalk transition-colors hover:border-volt/50 hover:text-volt"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="h-10 flex-1 rounded-full bg-red-600 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
