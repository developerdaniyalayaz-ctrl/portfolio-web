import React, { useState, useEffect } from 'react';
import {
  Mail,
  Check,
  Trash2,
  Clock,
  User,
  Filter,
  RefreshCw,
  Send,
  Eye,
  MessageSquarePlus,
  Inbox,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import InquiryReplyModal from '../components/InquiryReplyModal';

export default function InquiriesPage({
  onOpenInquiryDetail,
  onOpenDeleteConfirm,
}) {
  const [inquiries, setInquiries] = useState([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmittingSample, setIsSubmittingSample] = useState(false);

  // Direct Reply Modal State
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyTargetInquiry, setReplyTargetInquiry] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const data = await api.getInquiries({ unreadOnly });
      setInquiries(data);
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [unreadOnly]);

  useEffect(() => {
    const handleInquiryChanged = () => {
      fetchInquiries();
    };
    const handleOpenReplyEvent = (e) => {
      if (e.detail) {
        setReplyTargetInquiry(e.detail);
        setIsReplyModalOpen(true);
      }
    };

    window.addEventListener('cyber:inquiry-changed', handleInquiryChanged);
    window.addEventListener('cyber:open-reply-modal', handleOpenReplyEvent);
    return () => {
      window.removeEventListener('cyber:inquiry-changed', handleInquiryChanged);
      window.removeEventListener('cyber:open-reply-modal', handleOpenReplyEvent);
    };
  }, []);

  const handleToggleRead = async (inquiryId) => {
    try {
      const updated = await api.toggleInquiryRead(inquiryId);
      setInquiries((prev) =>
        prev.map((item) =>
          item.id === inquiryId ? { ...item, is_read: updated.is_read } : item
        )
      );
    } catch (err) {
      console.error('Failed to toggle read status:', err);
    }
  };

  const handleOpenReply = (inquiry, e) => {
    if (e) e.stopPropagation();
    setReplyTargetInquiry(inquiry);
    setIsReplyModalOpen(true);
  };

  const handleReplySuccess = (updatedInquiry) => {
    setInquiries((prev) =>
      prev.map((item) =>
        item.id === updatedInquiry.id
          ? { ...item, ...updatedInquiry, status: 'REPLIED', is_read: true }
          : item
      )
    );
    setToastMessage(`Email delivered directly to ${updatedInquiry.email}`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Helper to simulate a client submitting a contact message through the public portfolio endpoint
  const handleSimulateInquiry = async () => {
    setIsSubmittingSample(true);
    try {
      const randomNames = ['Aria Stark', 'Deckard Shaw', 'Kassandra Jones', 'Hiro Protagonist'];
      const randomSubjects = [
        'Contract Lead: Full-Stack Architecture',
        'AI Multi-Agent System Inquiry',
        'High-Performance Rust Backend Consultation',
        'Advisory for High-Frequency Trading'
      ];
      const name = randomNames[Math.floor(Math.random() * randomNames.length)];
      const subject = randomSubjects[Math.floor(Math.random() * randomSubjects.length)];

      await api.createInquiry({
        name,
        email: `${name.toLowerCase().replace(' ', '.')}@cyberlab.dev`,
        subject,
        message: `Greetings! We reviewed your portfolio projects and would love to discuss an architectural engagement for an upcoming Q2 launch. Looking forward to your response.`,
      });
      fetchInquiries();
    } catch (err) {
      console.error('Failed to simulate inquiry:', err);
    } finally {
      setIsSubmittingSample(false);
    }
  };

  const unreadCount = inquiries.filter((i) => !i.is_read).length;

  return (
    <div className="space-y-6 animate-fade-in font-mono">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-cyan-950/95 border border-cyan-400 text-cyan-200 text-xs flex items-center gap-3 shadow-[0_0_25px_rgba(0,240,255,0.3)] animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-cyan-500/20">
        <div>
          <h1 className="text-2xl font-bold tracking-wide text-slate-100 flex items-center gap-2">
            CLIENT INQUIRIES & LEADS
            {unreadCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                {unreadCount} NEW
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Communications and contract proposals received from public portfolio visitors.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchInquiries}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 bg-slate-900 border border-slate-700 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors cursor-pointer"
            title="Refresh Inquiries"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>SYNC</span>
          </button>

          <button
            onClick={handleSimulateInquiry}
            disabled={isSubmittingSample}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-400 shadow-neon-cyan transition-all cursor-pointer"
            title="Simulate a client submitting the contact form"
          >
            <MessageSquarePlus className="w-4 h-4 text-cyan-400" />
            <span>{isSubmittingSample ? 'SENDING...' : '+ SIMULATE INCOMING LEAD'}</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-[#080d1a]/80 border border-cyan-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setUnreadOnly(false)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              !unreadOnly
                ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Messages ({inquiries.length})
          </button>

          <button
            onClick={() => setUnreadOnly(true)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              unreadOnly
                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Unread Only
          </button>
        </div>

        <span className="text-xs text-slate-500 hidden sm:inline">
          Showing {inquiries.length} transmission(s)
        </span>
      </div>

      {/* Inquiries Table / Feed */}
      {loading ? (
        <div className="py-20 text-center text-xs text-cyan-400 animate-pulse flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>RECEIVING INQUIRY FEED...</span>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="cyber-card p-12 text-center rounded-2xl border border-cyan-500/20 space-y-3">
          <Inbox className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-300">
            {unreadOnly ? 'No unread inquiries. Inbox zero achieved!' : 'No client messages recorded.'}
          </p>
          <button
            onClick={handleSimulateInquiry}
            className="text-xs text-cyan-400 underline hover:text-cyan-300 cursor-pointer"
          >
            Send a sample inquiry via the public endpoint
          </button>
        </div>
      ) : (
        <div className="cyber-card rounded-xl border border-cyan-500/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#050811]/90 border-b border-cyan-500/20 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Sender</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Message Snippet</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {inquiries.map((inquiry) => (
                  <tr
                    key={inquiry.id}
                    onClick={() => onOpenInquiryDetail(inquiry)}
                    className={`cursor-pointer transition-colors ${
                      inquiry.is_read
                        ? 'hover:bg-slate-900/30'
                        : 'bg-cyan-950/20 hover:bg-cyan-900/30'
                    }`}
                  >
                    <td className="p-3.5">
                      {inquiry.status === 'REPLIED' || inquiry.replied_at ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-400/50 shadow-neon-cyan">
                          REPLIED
                        </span>
                      ) : inquiry.is_read ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-500">
                          PROCESSED
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-neon-emerald">
                          NEW
                        </span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-slate-200">{inquiry.name}</div>
                      <div className="text-[11px] text-slate-400">{inquiry.email}</div>
                    </td>

                    <td className="p-3.5 text-cyan-300 font-medium max-w-xs truncate">
                      {inquiry.subject || 'Portfolio Inquiry'}
                    </td>

                    <td className="p-3.5 max-w-md truncate text-slate-400">
                      {inquiry.message}
                    </td>

                    <td className="p-3.5 text-slate-400 whitespace-nowrap">
                      {new Date(inquiry.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td
                      className="p-3.5 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleRead(inquiry.id)}
                          className={`p-1.5 rounded transition-colors cursor-pointer ${
                            inquiry.is_read
                              ? 'bg-slate-900 text-slate-400 hover:text-slate-200'
                              : 'bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60'
                          }`}
                          title={inquiry.is_read ? 'Mark as Unread' : 'Mark as Read'}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => handleOpenReply(inquiry, e)}
                          className="p-1.5 rounded bg-cyan-950/40 text-cyan-400 hover:bg-cyan-900/60 hover:text-cyan-200 border border-cyan-500/30 transition-colors cursor-pointer"
                          title="Direct SMTP Email Reply"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onOpenDeleteConfirm(inquiry)}
                          className="p-1.5 rounded bg-rose-950/20 text-rose-400 hover:bg-rose-900/40 transition-colors cursor-pointer"
                          title="Delete Message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Direct SMTP Email Dispatch Modal */}
      <InquiryReplyModal
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        inquiry={replyTargetInquiry}
        onReplySuccess={handleReplySuccess}
      />
    </div>
  );
}
