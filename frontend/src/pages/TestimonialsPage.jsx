import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquareQuote,
  Star,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  Eye,
  EyeOff,
  Save,
  X,
  ShieldCheck,
  FolderGit2,
  Quote
} from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import api from '../services/api';
import { getBadgeColorClasses } from '../components/public/TestimonialsSection';

const PLATFORM_PRESETS = [
  { label: 'Enterprise Client', badge: 'Enterprise Client', color: 'sky' },
  { label: 'Upwork Verified', badge: 'Upwork Verified', color: 'emerald' },
  { label: 'Fiverr 5.0★', badge: 'Fiverr 5.0★', color: 'cyan' },
  { label: 'Direct Client', badge: 'Direct Client', color: 'violet' },
  { label: 'Verified Deployment', badge: 'Verified Deployment', color: 'emerald' },
];

const COLOR_OPTIONS = [
  { key: 'emerald', label: 'Upwork Emerald', colorClass: 'bg-emerald-400' },
  { key: 'cyan', label: 'Fiverr Cyan', colorClass: 'bg-cyan-400' },
  { key: 'sky', label: 'Enterprise Sky', colorClass: 'bg-sky-400' },
  { key: 'violet', label: 'Direct Violet', colorClass: 'bg-violet-400' },
];

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State
  const formRef = useRef(null);
  const nameInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    client_name: '',
    client_role: '',
    platform_badge: 'Enterprise Client',
    badge_color: 'emerald',
    rating: 5,
    review_text: '',
    project_ref: '',
    order_index: 0,
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete Modal State
  const [testimonialToDelete, setTestimonialToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAdminTestimonials();
      setTestimonials(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Failed to load client testimonials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
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
      platform_badge: preset.badge,
      badge_color: preset.color,
    }));
  };

  const handleStartEdit = (t) => {
    setIsEditing(true);
    setEditingId(t.id);
    setFormData({
      client_name: t.client_name || '',
      client_role: t.client_role || '',
      platform_badge: t.platform_badge || 'Enterprise Client',
      badge_color: t.badge_color || 'emerald',
      rating: t.rating ?? 5,
      review_text: t.review_text || '',
      project_ref: t.project_ref || '',
      order_index: t.order_index ?? 0,
      is_active: t.is_active ?? true,
    });
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    nameInputRef.current?.focus();
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      client_name: '',
      client_role: '',
      platform_badge: 'Enterprise Client',
      badge_color: 'emerald',
      rating: 5,
      review_text: '',
      project_ref: '',
      order_index: testimonials.length,
      is_active: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.client_name.trim() || !formData.review_text.trim()) {
      setError('Client Name and Review Quote text are required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        client_name: formData.client_name.trim(),
        client_role: formData.client_role.trim(),
        platform_badge: formData.platform_badge.trim() || 'Enterprise Client',
        badge_color: formData.badge_color,
        rating: Number(formData.rating) || 5,
        review_text: formData.review_text.trim(),
        project_ref: formData.project_ref.trim(),
        order_index: Number(formData.order_index) || 0,
        is_active: formData.is_active,
      };

      if (isEditing && editingId) {
        await api.updateTestimonial(editingId, payload);
        showToast('Client endorsement updated successfully.');
      } else {
        await api.createTestimonial(payload);
        showToast('New client endorsement published successfully.');
      }

      handleCancelEdit();
      await fetchTestimonials();
    } catch (err) {
      setError(err?.message || 'Failed to save testimonial.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.toggleTestimonialStatus(id);
      setTestimonials((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_active: !t.is_active } : t))
      );
      showToast('Visibility status toggled.');
    } catch (err) {
      setError(err?.message || 'Failed to toggle visibility status.');
    }
  };

  const handleMove = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= testimonials.length) return;

    const reordered = [...testimonials];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const payload = reordered.map((t, idx) => ({ id: t.id, order_index: idx }));
    setTestimonials(reordered.map((t, idx) => ({ ...t, order_index: idx })));

    try {
      await api.reorderTestimonials(payload);
      showToast('Review order sequence updated.');
    } catch (err) {
      setError(err?.message || 'Failed to persist reordering.');
      fetchTestimonials();
    }
  };

  const handleOpenDelete = (t) => {
    setTestimonialToDelete(t);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!testimonialToDelete) return;
    try {
      setDeleteLoading(true);
      await api.deleteTestimonial(testimonialToDelete.id);
      setIsDeleteModalOpen(false);
      setTestimonialToDelete(null);
      showToast('Testimonial record purged.');
      await fetchTestimonials();
    } catch (err) {
      setError(err?.message || 'Failed to delete testimonial.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-cyan-950/40 text-cyan-400 border border-cyan-500/30">
              <MessageSquareQuote className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight">
                CLIENT TESTIMONIALS & REVIEWS
              </h1>
              <p className="text-xs font-mono text-slate-400">
                Manage 100% database-driven client evaluations, star ratings, and verified platform badges
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchTestimonials}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#080d1a] border border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/40 text-xs font-mono transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>SYNC TESTIMONIALS</span>
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
        {/* LEFT PANEL: Add / Edit Form (5 cols) */}
        <div className="lg:col-span-5">
          <div
            ref={formRef}
            className="cyber-card rounded-xl p-5 border border-cyan-500/25 bg-[#080d1a]/90 backdrop-blur-md space-y-5 sticky top-20"
          >
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <h2 className="font-mono font-bold text-sm text-cyan-300 tracking-wide uppercase">
                  {isEditing ? `EDIT REVIEW #${editingId}` : 'ADD CLIENT TESTIMONIAL'}
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

            {/* Quick Platform Presets */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>QUICK PLATFORM PRESETS</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PLATFORM_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-all ${
                      formData.platform_badge === p.badge
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                        : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Client Name */}
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Client Name / Organization *
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  required
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  placeholder='e.g. "Operations Lead — Garment Unit K-03" or "Sophia Vance"'
                  className="w-full px-3.5 py-2.5 rounded-lg cyber-input font-mono text-sm placeholder:text-slate-600 focus:border-cyan-400"
                />
              </div>

              {/* Client Role */}
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Client Role / Domain (Subtitle)
                </label>
                <input
                  type="text"
                  value={formData.client_role}
                  onChange={(e) => setFormData({ ...formData, client_role: e.target.value })}
                  placeholder='e.g. "Apparel Manufacturing & Quality Audit" or "CTO"'
                  className="w-full px-3.5 py-2 rounded-lg cyber-input font-mono text-xs placeholder:text-slate-600 focus:border-cyan-400"
                />
              </div>

              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Star Rating (1–5)
                </label>
                <div className="flex items-center gap-2 bg-[#050811] p-2 rounded-lg border border-slate-800">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1 hover:scale-110 transition-transform"
                      title={`${star} Star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= formData.rating
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                            : 'text-slate-700 fill-slate-800'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono text-amber-300 font-bold ml-2">
                    {formData.rating}.0 / 5.0
                  </span>
                </div>
              </div>

              {/* Platform Badge Label & Badge Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Platform Badge Label
                  </label>
                  <input
                    type="text"
                    value={formData.platform_badge}
                    onChange={(e) => setFormData({ ...formData, platform_badge: e.target.value })}
                    placeholder='e.g. "Upwork Verified", "Fiverr 5.0★"'
                    className="w-full px-3 py-2 rounded-lg cyber-input font-mono text-xs placeholder:text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Badge Theme Accent
                  </label>
                  <select
                    value={formData.badge_color}
                    onChange={(e) => setFormData({ ...formData, badge_color: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg cyber-input font-mono text-xs"
                  >
                    {COLOR_OPTIONS.map((col) => (
                      <option key={col.key} value={col.key} className="bg-[#080d1a]">
                        {col.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Project Reference Tag */}
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Project Reference Tag (Optional)
                </label>
                <input
                  type="text"
                  value={formData.project_ref}
                  onChange={(e) => setFormData({ ...formData, project_ref: e.target.value })}
                  placeholder='e.g. "Garment Quality Audit OCR" or "Advocate Diary Suite"'
                  className="w-full px-3.5 py-2 rounded-lg cyber-input font-mono text-xs placeholder:text-slate-600 focus:border-cyan-400"
                />
                <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                  Connects the testimonial visually to a featured case study.
                </span>
              </div>

              {/* Review Text Body */}
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Review / Endorsement Quote *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.review_text}
                  onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                  placeholder="Paste the client's direct review or feedback quotation here..."
                  className="w-full px-3.5 py-2.5 rounded-lg cyber-input font-mono text-xs placeholder:text-slate-600 focus:border-cyan-400 resize-y"
                />
              </div>

              {/* Order & Visibility Grid */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Sequence Order (0 = First)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg cyber-input font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Public Visibility
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                    className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border text-xs font-mono font-semibold transition-all ${
                      formData.is_active
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900 border-slate-700 text-slate-500'
                    }`}
                  >
                    {formData.is_active ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
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

              {/* Submit / Cancel Buttons */}
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
                      <span>{isEditing ? 'UPDATE ENDORSEMENT' : 'SAVE TO DATABASE'}</span>
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

        {/* RIGHT PANEL: Live Preview & Configured Reviews List (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live Card Preview */}
          <div className="cyber-card rounded-xl p-5 border border-cyan-500/30 bg-[#060a16] shadow-[0_0_25px_rgba(6,182,212,0.08)]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <Quote className="w-4 h-4 text-cyan-400" />
                <h3 className="font-mono font-bold text-xs text-white uppercase tracking-wider">
                  LIVE CARD PREVIEW (SAMPLE CARD)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                {testimonials.filter((t) => t.is_active).length} Active Public Reviews
              </span>
            </div>

            {/* Simulated Public Testimonial Card */}
            <div className="rounded-xl bg-slate-950/80 border border-slate-800/90 p-5 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= (formData.rating || 5)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700 fill-slate-800'
                        }`}
                      />
                    ))}
                    <span className="text-[11px] font-mono font-bold text-amber-300 ml-1">
                      {formData.rating || 5}.0
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border uppercase tracking-wider ${
                      getBadgeColorClasses(formData.badge_color).pill
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        getBadgeColorClasses(formData.badge_color).dot
                      }`}
                    ></span>
                    <span>{formData.platform_badge || 'Enterprise Client'}</span>
                  </span>
                </div>

                <div className="my-3.5">
                  <p className="text-slate-300 text-xs font-sans italic leading-relaxed">
                    "{formData.review_text || 'Automated our daily line audit extraction and attendance matrices with near-zero error rates.'}"
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-1">
                <h4 className="text-xs font-mono font-bold text-slate-100">
                  {formData.client_name || 'Client Name / Enterprise Team'}
                </h4>
                {formData.client_role && (
                  <p className="text-[11px] font-mono text-slate-400">{formData.client_role}</p>
                )}
                {formData.project_ref && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 mt-1">
                    <FolderGit2 className="w-2.5 h-2.5 text-cyan-400" />
                    <span>{formData.project_ref}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Configured Testimonials List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span>CONFIGURED DATABASE TESTIMONIALS</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950/50 text-cyan-400 border border-cyan-500/30 text-[10px]">
                  {testimonials.length}
                </span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                DRAG / USE ARROWS TO SET SEQUENCE
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>QUERYING TESTIMONIALS FROM SQLITE...</span>
              </div>
            ) : testimonials.length === 0 ? (
              <div className="cyber-card p-8 text-center rounded-xl border border-cyan-500/20 text-slate-400 font-mono text-xs">
                <MessageSquareQuote className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p>No client testimonials registered in portfolio.db.</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Use the left form to add reviews and endorsements from Upwork, Fiverr, or Enterprise contracts.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {testimonials.map((t, index) => {
                  const badgeStyles = getBadgeColorClasses(t.badge_color);

                  return (
                    <div
                      key={t.id}
                      className={`p-4 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        t.is_active
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
                            disabled={index === testimonials.length - 1}
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
                                t.is_active
                                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                                  : 'bg-slate-900 text-slate-500 border-slate-800'
                              }`}
                            >
                              {t.is_active ? '● LIVE' : '○ HIDDEN'}
                            </span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase ${badgeStyles.pill}`}
                            >
                              {t.platform_badge}
                            </span>
                            <div className="flex items-center text-amber-400">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3 h-3 ${
                                    s <= (t.rating || 5)
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-slate-800'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          <h4 className="text-sm font-mono font-bold text-slate-100 truncate">
                            {t.client_name}
                            {t.client_role && (
                              <span className="text-slate-400 font-normal text-xs ml-2">
                                — {t.client_role}
                              </span>
                            )}
                          </h4>

                          <p className="text-xs font-sans text-slate-300 italic line-clamp-2 mt-1">
                            "{t.review_text}"
                          </p>

                          {t.project_ref && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-cyan-400 mt-1">
                              <FolderGit2 className="w-2.5 h-2.5" />
                              <span>{t.project_ref}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right action buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(t.id)}
                          className={`p-1.5 rounded-lg border text-xs font-mono transition-colors ${
                            t.is_active
                              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/40'
                              : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'
                          }`}
                          title={t.is_active ? 'Hide from public site' : 'Make live on public site'}
                        >
                          {t.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStartEdit(t)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-400 text-xs font-mono transition-colors"
                          title="Edit Testimonial"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>EDIT</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDelete(t)}
                          className="p-1.5 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-400 hover:bg-rose-900/40 hover:text-rose-200 transition-colors"
                          title="Delete Testimonial"
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
        title="PURGE CLIENT TESTIMONIAL?"
        message={`Are you sure you want to permanently delete the endorsement from "${testimonialToDelete?.client_name}"? This action cannot be undone.`}
        confirmText="PERMANENTLY PURGE"
        loading={deleteLoading}
      />
    </div>
  );
}
