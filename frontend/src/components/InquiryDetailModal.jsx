import React from 'react';
import { X, Mail, Calendar, User, Check, Trash2, Send, History, CheckCircle2 } from 'lucide-react';

export default function InquiryDetailModal({
  isOpen,
  onClose,
  inquiry,
  onToggleRead,
  onDelete,
  onOpenReply,
}) {
  if (!isOpen || !inquiry) return null;

  const dateStr = new Date(inquiry.created_at).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-mono">
      <div className="relative w-full max-w-xl bg-[#080d1a] border border-cyan-500/40 rounded-2xl shadow-[0_0_35px_rgba(0,240,255,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Neon Top Bar */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 shrink-0"></div>

        {/* Header */}
        <div className="p-5 border-b border-cyan-500/20 bg-[#0a0f24]/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                INQUIRY TRANSMISSION
                {inquiry.status === 'REPLIED' || inquiry.replied_at ? (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-400/50 shadow-neon-cyan font-bold">
                    REPLIED
                  </span>
                ) : inquiry.is_read ? (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">
                    PROCESSED
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                    UNREAD LEAD
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">ID #{inquiry.id}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg bg-[#050811] border border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Sender Name:</span>
              <span className="text-cyan-300 font-semibold">{inquiry.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Sender Email:</span>
              <a
                href={`mailto:${inquiry.email}`}
                className="text-cyan-400 underline hover:text-cyan-300"
              >
                {inquiry.email}
              </a>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Subject:</span>
              <span className="text-slate-200">{inquiry.subject || 'Portfolio Inquiry'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Timestamp:</span>
              <span className="text-slate-400">{dateStr}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
              Message Body:
            </label>
            <div className="p-4 rounded-xl bg-[#050811] border border-cyan-500/20 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap max-h-52 overflow-y-auto">
              {inquiry.message}
            </div>
          </div>

          {/* Sent Reply History if available */}
          {inquiry.replied_at && (
            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between text-cyan-300 text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  PREVIOUSLY SENT DIRECT REPLY
                </span>
                <span className="text-slate-400 text-[10px]">
                  {new Date(inquiry.replied_at).toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-slate-300 font-semibold">
                Subject: {inquiry.reply_subject || 'No subject logged'}
              </div>
              <div className="p-3 rounded-lg bg-[#04060e] border border-cyan-500/20 text-slate-300 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto text-xs">
                {inquiry.reply_body || 'No message body logged.'}
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onDelete(inquiry.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-rose-400 bg-rose-950/20 border border-rose-500/30 hover:bg-rose-900/40 hover:text-rose-200 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>DELETE</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleRead(inquiry.id)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs text-slate-300 bg-slate-800/60 border border-slate-700 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{inquiry.is_read ? 'MARK UNREAD' : 'MARK READ'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenReply) onOpenReply(inquiry);
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-black hover:from-cyan-300 hover:to-indigo-500 shadow-neon-cyan transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{inquiry.replied_at ? 'SEND ANOTHER REPLY' : 'SEND DIRECT REPLY'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
