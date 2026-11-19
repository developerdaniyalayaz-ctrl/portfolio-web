import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  RotateCcw,
  History
} from 'lucide-react';
import api from '../services/api';

const QUICK_TEMPLATES = [
  {
    name: 'Standard Acknowledgment',
    body: (name) =>
      `Hi ${name},\n\nThank you for reaching out through my portfolio. I've received your project inquiry and would love to learn more about your technical requirements and timeline.\n\nCould you share any architectural constraints or preferred milestones? Looking forward to collaborating.\n\nBest regards,\nDaniyal Ayaz\nFull-Stack & AI Automation Engineer\nhttps://daniyalayaz.com`
  },
  {
    name: 'Schedule Discovery Call',
    body: (name) =>
      `Hi ${name},\n\nThank you for your inquiry. Your project scope looks very exciting and directly aligns with my full-stack and AI workflow expertise.\n\nI would be glad to hop on a quick 15-minute discovery call to discuss architectural deliverables and budget constraints. What times work best for you this week?\n\nBest regards,\nDaniyal Ayaz\nFull-Stack & AI Automation Engineer\nhttps://daniyalayaz.com`
  },
  {
    name: 'Custom Proposal Follow-up',
    body: (name) =>
      `Hi ${name},\n\nThank you for considering my engineering services. I am reviewing the details of your inquiry and am currently drafting an architectural summary and milestone breakdown.\n\nI will follow up shortly with a comprehensive proposal.\n\nBest regards,\nDaniyal Ayaz\nFull-Stack & AI Automation Engineer\nhttps://daniyalayaz.com`
  }
];

export default function InquiryReplyModal({
  isOpen,
  onClose,
  inquiry,
  onReplySuccess
}) {
  if (!isOpen || !inquiry) return null;

  const firstName = inquiry.name?.trim().split(' ')[0] || 'there';

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (inquiry) {
      const initialSubject = inquiry.subject?.startsWith('Re:')
        ? inquiry.subject
        : `Re: ${inquiry.subject || 'Portfolio Project Specification'}`;
      setSubject(initialSubject);
      setMessage(QUICK_TEMPLATES[0].body(firstName));
      setError(null);
      setShowHistory(Boolean(inquiry.replied_at));
    }
  }, [inquiry]);

  const handleApplyTemplate = (template) => {
    setMessage(template.body(firstName));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setError('Please provide both an email subject and response message.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedInquiry = await api.replyToInquiry(inquiry.id, {
        subject: subject.trim(),
        message: message.trim()
      });
      if (onReplySuccess) {
        onReplySuccess(updatedInquiry);
      }
      onClose();
    } catch (err) {
      console.error('Direct email dispatch failed:', err);
      const detail = err.message || 'SMTP delivery failed. Please check backend SMTP configuration.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const mailtoFallbackUrl = `mailto:${inquiry.email}?subject=${encodeURIComponent(
    subject || 'Portfolio Inquiry'
  )}&body=${encodeURIComponent(message)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-mono">
      <div className="relative w-full max-w-2xl bg-[#080d1e] border border-cyan-500/40 rounded-2xl shadow-[0_0_40px_rgba(0,240,255,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Neon Top Accent Line */}
        <div className="h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 shrink-0"></div>

        {/* Modal Header */}
        <div className="p-5 border-b border-cyan-500/20 bg-[#060a17] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 shadow-neon-cyan">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                DIRECT SMTP DISPATCH
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/40">
                  TLS PORT 587
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Transmit a real email directly to the client's electronic inbox.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Recipient Metadata Card */}
          <div className="p-3.5 rounded-xl bg-[#04060e] border border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                TARGET CLIENT RECIPIENT
              </span>
              <span className="text-cyan-300 font-bold text-sm">
                {inquiry.name}
              </span>
              <span className="text-slate-400 ml-2">
                &lt;{inquiry.email}&gt;
              </span>
            </div>

            {inquiry.replied_at && (
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40 transition-colors text-[10px] cursor-pointer"
              >
                <History className="w-3.5 h-3.5" />
                <span>{showHistory ? 'HIDE PREVIOUS REPLY' : 'VIEW PREVIOUS REPLY'}</span>
              </button>
            )}
          </div>

          {/* Previous Reply History Callout */}
          {showHistory && inquiry.replied_at && (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between text-emerald-300 text-[11px] font-bold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  PREVIOUSLY SENT REPLY LOG
                </span>
                <span className="text-slate-400 text-[10px]">
                  {new Date(inquiry.replied_at).toLocaleString()}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 font-semibold">
                Subject: {inquiry.reply_subject || 'No subject logged'}
              </div>
              <div className="p-3 rounded-lg bg-[#04060e] border border-emerald-500/20 text-slate-300 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                {inquiry.reply_body || 'No message body logged.'}
              </div>
            </div>
          )}

          {/* Original Client Inquiry Context Drawer */}
          <details className="group border border-slate-800 rounded-xl bg-[#04060e] overflow-hidden">
            <summary className="p-3 text-slate-400 hover:text-cyan-300 cursor-pointer flex items-center justify-between select-none font-semibold">
              <span className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                Original Transmission from {inquiry.name} ({new Date(inquiry.created_at).toLocaleDateString()})
              </span>
              <span className="text-[10px] text-cyan-400 group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <div className="p-3.5 border-t border-slate-800/80 text-slate-300 whitespace-pre-wrap leading-relaxed bg-[#02040a] max-h-40 overflow-y-auto">
              <div className="text-cyan-400/80 font-bold mb-1">
                Subject: {inquiry.subject || 'Portfolio Contact'}
              </div>
              {inquiry.message}
            </div>
          </details>

          {/* Error Banner with Mailto Fallback */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-300 space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">DIRECT SMTP DISPATCH EXCEPTION</span>
                  <p className="text-[11px] text-rose-200 leading-relaxed">{error}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-rose-500/20 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  Alternative dispatch option:
                </span>
                <a
                  href={mailtoFallbackUrl}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-900/30 border border-rose-400/40 text-rose-200 hover:bg-rose-900/60 transition-colors font-semibold text-[10px]"
                >
                  <span>Open in Default Mail Client (mailto)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Quick Presets Picker */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              QUICK RESPONSE TEMPLATES:
            </span>
            <div className="flex flex-wrap gap-2">
              {QUICK_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.name}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="px-2.5 py-1 rounded-lg bg-[#04060e] border border-cyan-500/20 hover:border-cyan-400 hover:text-cyan-300 text-slate-300 text-[10px] transition-all cursor-pointer"
                >
                  {tmpl.name}
                </button>
              ))}
            </div>
          </div>

          <form id="smtp-reply-form" onSubmit={handleSend} className="space-y-4">
            {/* Subject Line */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block uppercase text-[10px] tracking-wider">
                EMAIL SUBJECT *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#04060e] border border-cyan-500/30 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs"
              />
            </div>

            {/* Message Body */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-semibold block uppercase text-[10px] tracking-wider">
                  MESSAGE BODY *
                </label>
                <span className="text-[10px] text-slate-500">
                  {message.length} characters
                </span>
              </div>
              <textarea
                rows={8}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-[#04060e] border border-cyan-500/30 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs resize-none leading-relaxed font-mono"
              />
              <span className="text-[10px] text-slate-500 block">
                * The client will receive this formatted alongside your professional engineering signature block.
              </span>
            </div>
          </form>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-cyan-500/20 bg-[#060a17] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            CANCEL
          </button>

          <button
            type="submit"
            form="smtp-reply-form"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-black font-bold text-xs uppercase tracking-wider hover:from-cyan-300 hover:to-indigo-500 shadow-neon-cyan transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>DISPATCHING VIA SMTP...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>SEND DIRECT EMAIL</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
