"use client";

import { useEffect } from "react";
import { sans } from "@/lib/page-theme";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** When true, confirm button is styled as destructive and shows busy state */
  danger?: boolean;
  busy?: boolean;
};

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  danger = true,
  busy = false,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onCancel, busy]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" dir="rtl">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="إغلاق"
        onClick={() => {
          if (!busy) onCancel();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="relative z-[1] w-full max-w-md rounded-lg border border-black/10 bg-white p-6 shadow-xl"
        style={sans}
      >
        <h2 id="confirm-modal-title" className="text-lg font-medium text-neutral-900">
          {title}
        </h2>
        <p className="mt-3 text-sm text-neutral-600 leading-relaxed">{message}</p>
        <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 text-sm border border-black/15 rounded-sm hover:bg-neutral-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`px-4 py-2 text-sm rounded-sm text-white disabled:opacity-50 ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-black hover:bg-neutral-800"
            }`}
          >
            {busy ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
