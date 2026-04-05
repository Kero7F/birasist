"use client";

import { Loader2 } from "lucide-react";

export type ConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  isLoading: boolean;
  /** Sunucu / doğrulama hatası (ör. silme başarısız) */
  error?: string | null;
};

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading,
  error = null,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
      onClick={() => {
        if (!isLoading) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 text-left text-gray-900 shadow-xl dark:border-gray-800 dark:bg-[#1e1e24] dark:text-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-left">
          <h2 id="confirm-modal-title" className="text-lg font-bold">
            {title}
          </h2>
          <p
            id="confirm-modal-desc"
            className="mt-2 text-sm text-gray-500 dark:text-gray-400"
          >
            {message}
          </p>
          {error ? (
            <p
              className="mt-3 text-sm font-medium text-red-600 dark:text-red-400"
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </div>
        <div className="mt-6 flex flex-row justify-end gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="rounded bg-gray-200 px-4 py-2 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
          >
            İptal
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => void onConfirm()}
            className="inline-flex items-center gap-2 rounded bg-red-500 px-4 py-2 text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                Siliniyor…
              </>
            ) : (
              "Sil"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
