import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
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
  TrendingUp,
  ShieldCheck,
  Zap,
  BarChart3
} from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import api from '../services/api';

const COLOR_OPTIONS = [
  { key: 'cyan', label: 'Neon Cyan', colorClass: 'bg-cyan-400', borderClass: 'border-cyan-400', textClass: 'text-cyan-400' },
  { key: 'emerald', label: 'Neon Emerald', colorClass: 'bg-emerald-400', borderClass: 'border-emerald-400', textClass: 'text-emerald-400' },
  { key: 'sky', label: 'Electric Sky', colorClass: 'bg-sky-400', borderClass: 'border-sky-400', textClass: 'text-sky-400' },
  { key: 'violet', label: 'Cyber Violet', colorClass: 'bg-violet-400', borderClass: 'border-violet-400', textClass: 'text-violet-400' },
];

const PRESET_SUGGESTIONS = [
  {
    metric_value: '3,000+',
    metric_label: 'Workforce Automated',
    sub_context: 'HR & Payroll Engine',
    accent_color: 'cyan'
  },
  {
    metric_value: '99.4%',
    metric_label: 'OCR Extraction Accuracy',
    sub_context: 'Garment Production & Quality Audit Automation',
    accent_color: 'emerald'
  },
  {
    metric_value: '10+',
    metric_label: 'Production AI & Full-Stack Systems',
    sub_context: 'FastAPI, LangGraph & Flutter Deployments',
    accent_color: 'sky'
  },
  {
    metric_value: '< 2 Hr',
    metric_label: 'Global Response SLA',
    sub_context: 'PKT (UTC+5) // Async Ready',
    accent_color: 'violet'
  }
];

export default function MetricsPage() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State
  const formRef = useRef(null);
  const valueInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    metric_value: '',
    metric_label: '',
    sub_context: '',
    accent_color: 'cyan',
    order_index: 0,
    is_active: true
  });
  const [submitting, setSubmitting] = useState(false);

  // Deletion Modal
  const [metricToDelete, setMetricToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAdminMetrics();
      setMetrics(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Failed to load telemetry impact metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
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
      metric_value: preset.metric_value,
      metric_label: preset.metric_label,
      sub_context: preset.sub_context,
      accent_color: preset.accent_color
    }));
    valueInputRef.current?.focus();
  };

  const handleStartEdit = (metric) => {
    setIsEditing(true);
    setEditingId(metric.id);
    setFormData({
      metric_value: metric.metric_value || '',
      metric_label: metric.metric_label || '',
      sub_context: metric.sub_context || '',
      accent_color: metric.accent_color || 'cyan',
      order_index: metric.order_index ?? 0,
      is_active: metric.is_active ?? true
    });
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    valueInputRef.current?.focus();
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      metric_value: '',
      metric_label: '',
      sub_context: '',
      accent_color: 'cyan',
      order_index: metrics.length,
      is_active: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.metric_value.trim() || !formData.metric_label.trim()) {
      setError('Both KPI Value and Primary Metric Label are required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (isEditing && editingId) {
        await api.updateMetric(editingId, {
          metric_value: formData.metric_value.trim(),
          metric_label: formData.metric_label.trim(),
          sub_context: formData.sub_context.trim(),
          accent_color: formData.accent_color,
          order_index: Number(formData.order_index) || 0,
          is_active: formData.is_active
        });
        showToast('Telemetry metric updated successfully.');
      } else {
        await api.createMetric({
          metric_value: formData.metric_value.trim(),
          metric_label: formData.metric_label.trim(),
          sub_context: formData.sub_context.trim(),
          accent_color: formData.accent_color,
          order_index: Number(formData.order_index) || metrics.length,
          is_active: formData.is_active
        });
        showToast('New telemetry metric created successfully.');
      }

      handleCancelEdit();
      await fetchMetrics();
    } catch (err) {
      setError(err?.message || 'Failed to save impact metric.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (metricId) => {
    try {
      await api.toggleMetricStatus(metricId);
      setMetrics((prev) =>
        prev.map((m) => (m.id === metricId ? { ...m, is_active: !m.is_active } : m))
      );
      showToast('Visibility status updated.');
    } catch (err) {
      setError(err?.message || 'Failed to toggle status.');
    }
  };

  const handleMoveMetric = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= metrics.length) return;

    const reordered = [...metrics];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    // Update order_index
    const payload = reordered.map((m, idx) => ({ id: m.id, order_index: idx }));
    setMetrics(reordered.map((m, idx) => ({ ...m, order_index: idx })));

    try {
      await api.reorderMetrics(payload);
      showToast('Display sequence reordered.');
    } catch (err) {
      setError(err?.message || 'Failed to persist reordering.');
      fetchMetrics();
    }
  };

  const handleOpenDelete = (metric) => {
    setMetricToDelete(metric);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!metricToDelete) return;
    try {
      setDeleteLoading(true);
      await api.deleteMetric(metricToDelete.id);
      setIsDeleteModalOpen(false);
      setMetricToDelete(null);
      showToast('Telemetry metric purged.');
      await fetchMetrics();
    } catch (err) {
      setError(err?.message || 'Failed to delete metric.');
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
              <TrendingUp className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight">
                PRODUCTION METRICS & IMPACT TELEMETRY
              </h1>
              <p className="text-xs font-mono text-slate-400">
                100% database-driven high-impact KPIs positioned immediately beneath the Hero section
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchMetrics}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#080d1a] border border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/40 text-xs font-mono transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>SYNC TELEMETRY</span>
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
                  {isEditing ? `EDIT METRIC #${editingId}` : 'ADD TELEMETRY METRIC'}
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

            {/* Quick Preset Buttons */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>QUICK PRESET SUGGESTIONS</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {PRESET_SUGGESTIONS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="p-1.5 text-left rounded bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-[10px] font-mono text-slate-300 hover:text-cyan-300 transition-colors truncate"
                    title={`Click to fill: ${preset.metric_value} - ${preset.metric_label}`}
                  >
                    <span className="font-bold text-cyan-400">{preset.metric_value}</span>{' '}
                    <span>{preset.metric_label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Metric Value */}
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  KPI Value (Figure / Percentage) *
                </label>
                <input
                  ref={valueInputRef}
                  type="text"
                  required
                  value={formData.metric_value}
                  onChange={(e) => setFormData({ ...formData, metric_value: e.target.value })}
                  placeholder='e.g. "3,000+", "99.4%", "10+", "< 2 Hr"'
                  className="w-full px-3.5 py-2.5 rounded-lg cyber-input font-mono text-sm placeholder:text-slate-600 focus:border-cyan-400"
                />
                <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                  Rendered in large glowing monospace typography.
                </span>
              </div>

              {/* Metric Label */}
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Primary Impact Label *
                </label>
                <input
                  type="text"
                  required
                  value={formData.metric_label}
                  onChange={(e) => setFormData({ ...formData, metric_label: e.target.value })}
                  placeholder='e.g. "Workforce Automated", "OCR Extraction Accuracy"'
                  className="w-full px-3.5 py-2.5 rounded-lg cyber-input font-mono text-sm placeholder:text-slate-600 focus:border-cyan-400"
                />
                <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                  Crisp uppercase headline describing the verified achievement.
                </span>
              </div>

              {/* Sub-Context */}
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Project / Domain Context (Subtitle)
                </label>
                <input
                  type="text"
                  value={formData.sub_context}
                  onChange={(e) => setFormData({ ...formData, sub_context: e.target.value })}
                  placeholder='e.g. "HR & Payroll Engine", "PKT (UTC+5) // Async Ready"'
                  className="w-full px-3.5 py-2.5 rounded-lg cyber-input font-mono text-xs placeholder:text-slate-600 focus:border-cyan-400"
                />
                <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                  Optional subtle engineering context or client domain.
                </span>
              </div>

              {/* Accent Color Selection */}
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Telemetry Accent Color
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {COLOR_OPTIONS.map((col) => {
                    const isSelected = formData.accent_color === col.key;
                    return (
                      <button
                        key={col.key}
                        type="button"
                        onClick={() => setFormData({ ...formData, accent_color: col.key })}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-mono transition-all ${
                          isSelected
                            ? 'bg-slate-900 border-cyan-400 text-white shadow-neon-cyan'
                            : 'bg-[#050811] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full ${col.colorClass}`}></span>
                        <span>{col.label}</span>
                      </button>
                    );
                  })}
                </div>
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
                      <span>{isEditing ? 'UPDATE METRIC' : 'SAVE TO DATABASE'}</span>
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

        {/* RIGHT PANEL: Live Configured Metrics & Live Telemetry Strip Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live Preview Card */}
          <div className="cyber-card rounded-xl p-5 border border-cyan-500/30 bg-[#060a16] shadow-[0_0_25px_rgba(6,182,212,0.08)]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <h3 className="font-mono font-bold text-xs text-white uppercase tracking-wider">
                  LIVE TELEMETRY STRIP PREVIEW (PUBLIC VIEW)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                {metrics.filter((m) => m.is_active).length} Active Nodes
              </span>
            </div>

            {metrics.filter((m) => m.is_active).length === 0 ? (
              <div className="p-6 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-lg">
                NO ACTIVE METRICS DISPLAYED (STRIP COLLAPSED AUTOMATICALLY)
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {metrics
                  .filter((m) => m.is_active)
                  .map((m, idx) => {
                    const col = COLOR_OPTIONS.find((c) => c.key === m.accent_color) || COLOR_OPTIONS[0];
                    return (
                      <div
                        key={m.id || idx}
                        className="p-3.5 rounded-lg bg-[#080d1a] border border-cyan-500/20 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-1">
                            <span className="flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${col.colorClass}`}></span>
                              NODE 0{idx + 1}
                            </span>
                            <span className="text-slate-400">ACTIVE</span>
                          </div>
                          <div className={`text-2xl font-mono font-extrabold ${col.textClass}`}>
                            {m.metric_value}
                          </div>
                          <div className="text-xs font-mono font-bold text-slate-100 uppercase mt-1 line-clamp-1">
                            {m.metric_label}
                          </div>
                        </div>
                        {m.sub_context && (
                          <div className="text-[10px] font-mono text-slate-400 mt-2 pt-1.5 border-t border-slate-800/80 truncate">
                            {m.sub_context}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Metrics List Table / Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span>CONFIGURED DATABASE METRICS</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950/50 text-cyan-400 border border-cyan-500/30 text-[10px]">
                  {metrics.length}
                </span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                DRAG / USE ARROWS TO SET SEQUENCE
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>QUERYING SQLITE TELEMETRY NODES...</span>
              </div>
            ) : metrics.length === 0 ? (
              <div className="cyber-card p-8 text-center rounded-xl border border-cyan-500/20 text-slate-400 font-mono text-xs">
                <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p>No impact metrics registered in portfolio.db.</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Use the left panel or click any preset to seed your verified metrics.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {metrics.map((metric, index) => {
                  const col = COLOR_OPTIONS.find((c) => c.key === metric.accent_color) || COLOR_OPTIONS[0];

                  return (
                    <div
                      key={metric.id}
                      className={`p-4 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        metric.is_active
                          ? 'bg-[#080d1a] border-cyan-500/25 hover:border-cyan-400/50'
                          : 'bg-[#060913]/60 border-slate-800 opacity-60'
                      }`}
                    >
                      {/* Left info */}
                      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                        {/* Order Reorder Buttons */}
                        <div className="flex flex-col gap-1 shrink-0 bg-[#050811] p-1 rounded-md border border-slate-800">
                          <button
                            type="button"
                            onClick={() => handleMoveMetric(index, 'up')}
                            disabled={index === 0}
                            className="p-1 rounded text-slate-400 hover:text-cyan-300 disabled:opacity-20 hover:bg-slate-800/80 transition-colors"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveMetric(index, 'down')}
                            disabled={index === metrics.length - 1}
                            className="p-1 rounded text-slate-400 hover:text-cyan-300 disabled:opacity-20 hover:bg-slate-800/80 transition-colors"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Metric Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-slate-400 border border-slate-800">
                              #{index + 1}
                            </span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                                metric.is_active
                                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                                  : 'bg-slate-900 text-slate-500 border-slate-800'
                              }`}
                            >
                              {metric.is_active ? '● LIVE' : '○ HIDDEN'}
                            </span>
                            <span className="text-[10px] font-mono flex items-center gap-1 text-slate-400">
                              <span className={`w-2 h-2 rounded-full ${col.colorClass}`}></span>
                              {col.label}
                            </span>
                          </div>

                          <div className="flex items-baseline gap-2">
                            <span className={`text-lg font-mono font-bold ${col.textClass}`}>
                              {metric.metric_value}
                            </span>
                            <span className="text-xs font-mono font-semibold text-slate-100 truncate">
                              {metric.metric_label}
                            </span>
                          </div>

                          {metric.sub_context && (
                            <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                              {metric.sub_context}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right action buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(metric.id)}
                          className={`p-1.5 rounded-lg border text-xs font-mono transition-colors ${
                            metric.is_active
                              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/40'
                              : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'
                          }`}
                          title={metric.is_active ? 'Hide from public site' : 'Make live on public site'}
                        >
                          {metric.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStartEdit(metric)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-400 text-xs font-mono transition-colors"
                          title="Edit Metric"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>EDIT</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDelete(metric)}
                          className="p-1.5 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-400 hover:bg-rose-900/40 hover:text-rose-200 transition-colors"
                          title="Delete Metric"
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
        title="PURGE TELEMETRY METRIC?"
        message={`Are you sure you want to permanently delete the metric "${metricToDelete?.metric_value} - ${metricToDelete?.metric_label}"? This will remove it immediately from both SQLite and the live portfolio.`}
        confirmText="PERMANENTLY PURGE"
        loading={deleteLoading}
      />
    </div>
  );
}
