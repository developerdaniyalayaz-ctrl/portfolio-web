import React, { useState, useEffect, useRef } from 'react';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  Eye,
  EyeOff,
  Save,
  X,
  Zap,
  ArrowRight
} from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import api from '../services/api';
import { getTierColorClasses } from '../components/public/EngagementSection';

const COLOR_OPTIONS = [
  { key: 'cyan', label: 'Electric Cyan', colorClass: 'bg-cyan-400' },
  { key: 'emerald', label: 'Neon Emerald', colorClass: 'bg-emerald-400' },
  { key: 'violet', label: 'Cyber Violet', colorClass: 'bg-violet-400' },
];

const STARTER_PRESETS = [
  {
    tier_badge: 'PHASE 01 // PROOF OF VALUE',
    title: 'Rapid MVP / AI Prototype',
    timeline: '5–7 Days',
    summary: 'FastAPI backend + LLM/OCR pipeline + clean web UI.',
    deliverables: [
      'Python FastAPI REST Backend',
      'LLM / Vision OCR Integration',
      'Interactive Web UI (React / Streamlit)',
      'GitHub Repo & Live Demo Setup',
    ],
    accent_color: 'cyan',
    is_featured: false,
    inquiry_subject: 'Scope Inquiry: Rapid MVP / AI Prototype (5–7 Days)',
  },
  {
    tier_badge: 'PHASE 02 // PRODUCTION BUILD',
    title: 'Full-Stack Web & Mobile System',
    timeline: '2–4 Weeks',
    summary: 'React/Flutter + PostgreSQL/SQLite + Auth + Admin Dashboard.',
    deliverables: [
      'React Web App or Cross-Platform Flutter Client',
      'PostgreSQL / SQLite WAL Relational Schema',
      'JWT Role-Based Auth & Admin Studio',
      'Dockerized Production Deployment',
    ],
    accent_color: 'emerald',
    is_featured: true,
    inquiry_subject: 'Scope Inquiry: Full-Stack Web & Mobile System (2–4 Weeks)',
  },
  {
    tier_badge: 'PHASE 03 // SCALE & OPS',
    title: 'Enterprise Workflow & Data Automation',
    timeline: 'Custom / Dedicated Sprint',
    summary: 'Custom Python pipelines, Excel/ERP automation, and Docker deployment.',
    deliverables: [
      'Multi-Agent Data & Audit Pipelines',
      'Automated Excel, PDF & ERP Reporting',
      'High-Concurrency Workforce / Payroll Engines',
      'On-Premise or Cloud Docker Architecture',
    ],
    accent_color: 'violet',
    is_featured: false,
    inquiry_subject: 'Scope Inquiry: Enterprise Workflow & Data Automation',
  },
];

export default function EngagementsPage() {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State
  const formRef = useRef(null);
  const titleInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    tier_badge: 'PHASE 01 // PROOF OF VALUE',
    title: '',
    timeline: '5–7 Days',
    summary: '',
    deliverables_text: '',
    accent_color: 'cyan',
    is_featured: false,
    inquiry_subject: '',
    order_index: 0,
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [tierToDelete, setTierToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTiers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAdminEngagements();
      setTiers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Failed to load engagement tiers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleApplyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      tier_badge: preset.tier_badge,
      title: preset.title,
      timeline: preset.timeline,
      summary: preset.summary,
      deliverables_text: preset.deliverables.join('\n'),
      accent_color: preset.accent_color,
      is_featured: preset.is_featured,
      inquiry_subject: preset.inquiry_subject,
    }));
    titleInputRef.current?.focus();
  };

  const handleStartEdit = (tier) => {
    setIsEditing(true);
    setEditingId(tier.id);

    const deliverablesArr = Array.isArray(tier.deliverables)
      ? tier.deliverables
      : typeof tier.deliverables === 'string'
      ? (() => {
          try {
            const p = JSON.parse(tier.deliverables);
            return Array.isArray(p) ? p : [tier.deliverables];
          } catch {
            return tier.deliverables.split('\n').filter(Boolean);
          }
        })()
      : [];

    setFormData({
      tier_badge: tier.tier_badge || '',
      title: tier.title || '',
      timeline: tier.timeline || '',
      summary: tier.summary || '',
      deliverables_text: deliverablesArr.join('\n'),
      accent_color: tier.accent_color || 'cyan',
      is_featured: tier.is_featured ?? false,
      inquiry_subject: tier.inquiry_subject || '',
      order_index: tier.order_index ?? 0,
      is_active: tier.is_active ?? true,
    });

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    titleInputRef.current?.focus();
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      tier_badge: 'PHASE 01 // PROOF OF VALUE',
      title: '',
      timeline: '5–7 Days',
      summary: '',
      deliverables_text: '',
      accent_color: 'cyan',
      is_featured: false,
      inquiry_subject: '',
      order_index: tiers.length,
      is_active: true,
    });
  };

  // Auto-generate inquiry subject if empty when title/timeline change
  const handleTitleChange = (newTitle) => {
    setFormData((prev) => {
      const autoSub = prev.inquiry_subject.startsWith('Scope Inquiry:') || !prev.inquiry_subject
        ? `Scope Inquiry: ${newTitle} (${prev.timeline || 'Sprint'})`
        : prev.inquiry_subject;
      return { ...prev, title: newTitle, inquiry_subject: autoSub };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.summary.trim() || !formData.timeline.trim()) {
      setError('Title, delivery timeline, and summary are required.');
      return;
    }

    const deliverablesList = formData.deliverables_text
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (deliverablesList.length === 0) {
      setError('Please provide at least one deliverable item.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        tier_badge: formData.tier_badge.trim() || 'PHASE // SPRINT',
        title: formData.title.trim(),
        timeline: formData.timeline.trim(),
        summary: formData.summary.trim(),
        deliverables: deliverablesList,
        accent_color: formData.accent_color,
        is_featured: formData.is_featured,
        inquiry_subject:
          formData.inquiry_subject.trim() ||
          `Scope Inquiry: ${formData.title.trim()} (${formData.timeline.trim()})`,
        order_index: Number(formData.order_index) || 0,
        is_active: formData.is_active,
      };

      if (isEditing && editingId) {
        await api.updateEngagement(editingId, payload);
        showToast('Engagement scope tier updated successfully.');
      } else {
        await api.createEngagement(payload);
        showToast('New engagement tier added successfully.');
      }

      handleCancelEdit();
      await fetchTiers();
    } catch (err) {
      setError(err?.message || 'Failed to save engagement model.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.toggleEngagementStatus(id);
      setTiers((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_active: !t.is_active } : t))
      );
      showToast('Visibility status updated.');
    } catch (err) {
      setError(err?.message || 'Failed to toggle tier visibility.');
    }
  };

  const handleMove = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tiers.length) return;

    const reordered = [...tiers];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const payload = reordered.map((t, idx) => ({ id: t.id, order_index: idx }));
    setTiers(reordered.map((t, idx) => ({ ...t, order_index: idx })));

    try {
      await api.reorderEngagements(payload);
      showToast('Tiers sequence persisted.');
    } catch (err) {
      setError(err?.message || 'Failed to persist reordering.');
      fetchTiers();
    }
  };

  const handleOpenDelete = (tier) => {
    setTierToDelete(tier);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!tierToDelete) return;
    try {
      setDeleteLoading(true);
      await api.deleteEngagement(tierToDelete.id);
      setIsDeleteModalOpen(false);
      setTierToDelete(null);
      showToast('Engagement tier purged.');
      await fetchTiers();
    } catch (err) {
      setError(err?.message || 'Failed to delete engagement tier.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Preview helper values
  const previewDeliverables = formData.deliverables_text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  const previewStyles = getTierColorClasses(formData.accent_color, formData.is_featured);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-cyan-950/40 text-cyan-400 border border-cyan-500/30">
              <Briefcase className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight">
                ENGAGEMENT MODELS // HOW WE WORK
              </h1>
              <p className="text-xs font-mono text-slate-400">
                100% database-driven sprint scopes, core deliverables, and one-click contact auto-fill presets
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchTiers}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#080d1a] border border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/40 text-xs font-mono transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>SYNC ENGAGEMENTS</span>
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)] animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-center justify-between gap-2 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Split-View Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL: Form Editor (5 cols) */}
        <div className="lg:col-span-5">
          <div
            ref={formRef}
            className="cyber-card rounded-xl p-5 border border-cyan-500/25 bg-[#080d1a]/90 backdrop-blur-md space-y-5 sticky top-20"
          >
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <h2 className="font-mono font-bold text-sm text-cyan-300 tracking-wide uppercase">
                  {isEditing ? `EDIT ENGAGEMENT TIER #${editingId}` : 'ADD ENGAGEMENT TIER'}
                </h2>
              </div>

              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>CANCEL</span>
                </button>
              )}
            </div>

            {/* Quick Starter Presets */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>CORE STARTER PRESETS</span>
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {STARTER_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="p-2 text-left rounded bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-[11px] font-mono text-slate-300 hover:text-cyan-300 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-cyan-400 block">{p.title}</span>
                      <span className="text-[10px] text-slate-400">{p.tier_badge} • {p.timeline}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">USE PRESET</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tier Phase Badge & Delivery Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Phase / Tier Badge *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.tier_badge}
                    onChange={(e) => setFormData({ ...formData, tier_badge: e.target.value })}
                    placeholder='e.g. "PHASE 01 // PROOF OF VALUE"'
                    className="w-full px-3 py-2 rounded-lg cyber-input font-mono text-xs placeholder:text-slate-600 focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Delivery Timeline *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    placeholder='e.g. "5–7 Days", "2–4 Weeks"'
                    className="w-full px-3 py-2 rounded-lg cyber-input font-mono text-xs placeholder:text-slate-600 focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Package Title */}
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Package Title *
                </label>
                <input
                  ref={titleInputRef}
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder='e.g. "Rapid MVP / AI Prototype"'
                  className="w-full px-3.5 py-2.5 rounded-lg cyber-input font-mono text-sm placeholder:text-slate-600 focus:border-cyan-400"
                />
              </div>

              {/* Scope Summary */}
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Scope Summary *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="e.g. FastAPI backend + LLM/OCR pipeline + clean web UI."
                  className="w-full px-3.5 py-2 rounded-lg cyber-input font-mono text-xs placeholder:text-slate-600 focus:border-cyan-400 resize-none"
                />
              </div>

              {/* Deliverables (One per line) */}
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Deliverables Checklist (One bullet per line) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.deliverables_text}
                  onChange={(e) => setFormData({ ...formData, deliverables_text: e.target.value })}
                  placeholder="Python FastAPI REST Backend&#10;LLM / Vision OCR Integration&#10;Interactive Web UI (React / Streamlit)&#10;GitHub Repo & Live Demo Setup"
                  className="w-full px-3.5 py-2 rounded-lg cyber-input font-mono text-xs placeholder:text-slate-600 focus:border-cyan-400 font-mono resize-y"
                />
                <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                  Each line renders as a verified deliverable with a neon checkmark.
                </span>
              </div>

              {/* Inquiry Auto-Fill Subject */}
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Inquiry Form Auto-Fill Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formData.inquiry_subject}
                  onChange={(e) => setFormData({ ...formData, inquiry_subject: e.target.value })}
                  placeholder='e.g. "Scope Inquiry: Rapid MVP / AI Prototype (5–7 Days)"'
                  className="w-full px-3.5 py-2 rounded-lg cyber-input font-mono text-xs placeholder:text-slate-600 focus:border-cyan-400"
                />
                <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                  Automatically populates the subject line when the client clicks "DISCUSS THIS SCOPE".
                </span>
              </div>

              {/* Accent Color Selection */}
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tier Accent Theme
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {COLOR_OPTIONS.map((col) => {
                    const isSelected = formData.accent_color === col.key;
                    return (
                      <button
                        key={col.key}
                        type="button"
                        onClick={() => setFormData({ ...formData, accent_color: col.key })}
                        className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-mono transition-all ${
                          isSelected
                            ? 'bg-slate-900 border-cyan-400 text-white shadow-neon-cyan'
                            : 'bg-[#050811] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${col.colorClass}`}></span>
                        <span>{col.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Featured / Recommended & Public Visibility Toggle */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Recommended Badge
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_featured: !formData.is_featured })}
                    className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-mono font-semibold transition-all ${
                      formData.is_featured
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-neon-emerald'
                        : 'bg-slate-900 border-slate-700 text-slate-500'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{formData.is_featured ? 'RECOMMENDED' : 'STANDARD TIER'}</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Public Visibility
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                    className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-mono font-semibold transition-all ${
                      formData.is_active
                        ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-900 border-slate-700 text-slate-500'
                    }`}
                  >
                    {formData.is_active ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>ACTIVE / LIVE</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>HIDDEN</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider shadow-neon-cyan transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>PERSISTING...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{isEditing ? 'UPDATE TIER' : 'SAVE TO DATABASE'}</span>
                    </>
                  )}
                </button>

                {isEditing && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono"
                  >
                    CANCEL
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT PANEL: Live Preview & Configured Tiers List (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live Simulated Card Preview */}
          <div className="cyber-card rounded-xl p-5 border border-cyan-500/30 bg-[#060a16] shadow-[0_0_25px_rgba(6,182,212,0.08)]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <h3 className="font-mono font-bold text-xs text-white uppercase tracking-wider">
                  LIVE CARD PREVIEW (HOW CLIENTS WILL SEE IT)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                {tiers.filter((t) => t.is_active).length} Active Live Tiers
              </span>
            </div>

            {/* Simulated Public Tier Card */}
            <div
              className={`rounded-xl p-5 flex flex-col justify-between border ${previewStyles.cardBorder}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${previewStyles.badge}`}
                    >
                      {formData.tier_badge || 'PHASE 01 // PROOF OF VALUE'}
                    </span>

                    {formData.is_featured && (
                      <span className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-neon-emerald">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>RECOMMENDED</span>
                      </span>
                    )}
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${previewStyles.timeline}`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{formData.timeline || '5–7 Days'}</span>
                  </span>
                </div>

                <h4 className="text-lg font-mono font-bold text-white tracking-tight">
                  {formData.title || 'Package Title'}
                </h4>

                <p className="text-xs font-sans text-slate-300 mt-1.5 leading-relaxed">
                  {formData.summary || 'Summary description of scope and delivery.'}
                </p>

                {previewDeliverables.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                      DELIVERABLES
                    </span>
                    <ul className="space-y-1.5">
                      {previewDeliverables.slice(0, 4).map((b, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs font-mono text-slate-300">
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${previewStyles.check}`} />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/80">
                <div
                  className={`w-full py-2.5 px-3 rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer ${previewStyles.btn}`}
                >
                  <span>DISCUSS THIS SCOPE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-mono text-slate-500 text-center block mt-1.5">
                  Auto-fills: "{formData.inquiry_subject || 'Scope Inquiry: ...'}"
                </span>
              </div>
            </div>
          </div>

          {/* Configured Tiers List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span>CONFIGURED DATABASE SCOPE TIERS</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950/50 text-cyan-400 border border-cyan-500/30 text-[10px]">
                  {tiers.length}
                </span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                REORDER OR EDIT SPRINT TIERS
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>QUERYING SCOPE TIERS FROM SQLITE...</span>
              </div>
            ) : tiers.length === 0 ? (
              <div className="cyber-card p-8 text-center rounded-xl border border-cyan-500/20 text-slate-400 font-mono text-xs">
                <Briefcase className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p>No engagement tiers configured in portfolio.db.</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Use the left form or starter presets to add your scope models.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tiers.map((tier, index) => {
                  const cardStyles = getTierColorClasses(tier.accent_color, tier.is_featured);

                  return (
                    <div
                      key={tier.id}
                      className={`p-4 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        tier.is_active
                          ? 'bg-[#080d1a] border-cyan-500/25 hover:border-cyan-400/50'
                          : 'bg-[#060913]/60 border-slate-800 opacity-60'
                      }`}
                    >
                      {/* Left info & reorder */}
                      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                        {/* Order Reorder Buttons */}
                        <div className="flex flex-col gap-1 shrink-0 bg-[#050811] p-1 rounded-md border border-slate-800">
                          <button
                            type="button"
                            onClick={() => handleMove(index, 'up')}
                            disabled={index === 0}
                            className="p-1 rounded text-slate-400 hover:text-cyan-300 disabled:opacity-20 hover:bg-slate-800/80 transition-colors"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(index, 'down')}
                            disabled={index === tiers.length - 1}
                            className="p-1 rounded text-slate-400 hover:text-cyan-300 disabled:opacity-20 hover:bg-slate-800/80 transition-colors"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-slate-400 border border-slate-800">
                              #{index + 1}
                            </span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                                tier.is_active
                                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                                  : 'bg-slate-900 text-slate-500 border-slate-800'
                              }`}
                            >
                              {tier.is_active ? '● LIVE' : '○ HIDDEN'}
                            </span>
                            {tier.is_featured && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 uppercase">
                                RECOMMENDED
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30">
                              {tier.timeline}
                            </span>
                          </div>

                          <h4 className="text-sm font-mono font-bold text-slate-100 truncate">
                            {tier.title}
                          </h4>

                          <p className="text-xs font-sans text-slate-300 truncate mt-0.5">
                            {tier.summary}
                          </p>

                          <span className="text-[10px] font-mono text-slate-400 block mt-1 truncate">
                            Auto-Fill: {tier.inquiry_subject}
                          </span>
                        </div>
                      </div>

                      {/* Right action buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(tier.id)}
                          className={`p-1.5 rounded-lg border text-xs font-mono transition-colors ${
                            tier.is_active
                              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/40'
                              : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'
                          }`}
                          title={tier.is_active ? 'Hide from public site' : 'Make live on public site'}
                        >
                          {tier.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStartEdit(tier)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-400 text-xs font-mono transition-colors"
                          title="Edit Tier"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>EDIT</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDelete(tier)}
                          className="p-1.5 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-400 hover:bg-rose-900/40 hover:text-rose-200 transition-colors"
                          title="Delete Tier"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="PURGE ENGAGEMENT TIER?"
        message={`Are you sure you want to permanently delete the engagement scope tier "${tierToDelete?.title}"? This cannot be undone.`}
        confirmText="PERMANENTLY PURGE"
        loading={deleteLoading}
      />
    </div>
  );
}
