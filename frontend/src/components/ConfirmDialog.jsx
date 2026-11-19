import React from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  title = 'CONFIRM DELETION',
  message = 'Are you certain you wish to purge this record from the database? This operation is permanent.',
  confirmText = 'PURGE RECORD',
  cancelText = 'ABORT',
  onConfirm,
  onCancel,
  onClose,
  loading = false,
}) {
  if (!isOpen) return null;

  const handleClose = () => {
    if (loading) return;
    if (onClose) {
      onClose();
    } else if (onCancel) {
      onCancel();
    }
  };

  const handleConfirmClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md bg-[#080d1a] border border-rose-500/40 rounded-2xl shadow-[0_0_30px_rgba(255,0,85,0.25)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Crimson Accent */}
        <div className="h-1 bg-gradient-to-r from-rose-500 via-red-600 to-amber-500"></div>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={loading}
          className="absolute top-3.5 right-3.5 p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors disabled:opacity-40"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-400 shadow-neon-crimson shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="pr-6">
              <h3 className="font-mono font-bold text-base text-rose-300 tracking-wide">
                {title}
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                CRITICAL ACTION SECURITY CONFIRMATION
              </p>
            </div>
          </div>

          <p className="text-xs font-mono text-slate-300 leading-relaxed bg-[#050811] p-3 rounded-lg border border-slate-800">
            {message}
          </p>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg font-mono text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-40"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={handleConfirmClick}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-mono text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-neon-crimson transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>PURGING...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>{confirmText}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
