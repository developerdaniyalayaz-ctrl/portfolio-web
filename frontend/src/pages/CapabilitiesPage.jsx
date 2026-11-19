import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
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
  Cpu,
  Zap,
  ShieldCheck,
  Code2,
  Database,
  Smartphone,
  Globe,
  Terminal
} from 'lucide-react';
import { CapabilityIcon, getCapabilityAccentStyles } from '../components/Icons';
import ConfirmDialog from '../components/ConfirmDialog';
import api from '../services/api';

const CARD_PRESETS = [
  {
    title: 'AI AGENTIC PIPELINES',
    description: 'Gemini Vision OCR, Whisper & Multi-LLM Orchestration',
    icon_key: 'cpu',
    accent_color: 'cyan',
  },
  {
    title: 'FULL-STACK REST',
    description: 'FastAPI, SQLite WAL Mode & React Vite SPAs',
    icon_key: 'zap',
    accent_color: 'emerald',
  },
  {
    title: 'MOBILE & DESKTOP',
    description: 'Cross-Platform Flutter & Streamlit Automation Tools',
    icon_key: 'layers',
    accent_color: 'blue',
  },
  {
    title: 'HARDENED SECURITY',
    description: 'JWT Auth, Atomic Gzip Backups & Edge Telemetry',
    icon_key: 'shield',
    accent_color: 'violet',
  },
  {
    title: 'HIGH-CONCURRENCY DB',
    description: 'SQLite in WAL Mode, PostgreSQL & Redis Distributed Caching',
    icon_key: 'database',
    accent_color: 'cyan',
  },
  {
    title: 'DEV AUTOMATION & CLIs',
    description: 'Custom Shell Tooling, GitHub Actions & Autonomous CI/CD',
    icon_key: 'terminal',
    accent_color: 'emerald',
  },
];

const ICON_OPTIONS = [
  { key: 'cpu', label: 'cpu / AI core' },
  { key: 'zap', label: 'zap / lightning' },
  { key: 'layers', label: 'layers / stack' },
  { key: 'shield', label: 'shield / security' },
  { key: 'code', label: 'code / software' },
  { key: 'database', label: 'database / storage' },
  { key: 'smartphone', label: 'smartphone / mobile' },
  { key: 'terminal', label: 'terminal / CLI' },
  { key: 'globe', label: 'globe / network' },
];

const ACCENT_OPTIONS = [
  { key: 'cyan', label: 'Electric Cyan', colorClass: 'bg-cyan-400' },
  { key: 'emerald', label: 'Neon Emerald', colorClass: 'bg-emerald-400' },
  { key: 'blue', label: 'Vivid Blue', colorClass: 'bg-blue-400' },
  { key: 'violet', label: 'Cyber Violet', colorClass: 'bg-violet-400' },
];

export default function CapabilitiesPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Form & Edit State
  const formRef = useRef(null);
  const titleInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: 'AI AGENTIC PIPELINES',
    description: 'Gemini Vision OCR, Whisper & Multi-LLM Orchestration',
    icon_key: 'cpu',
    accent_color: 'cyan',
    order_index: 0,
    is_active: true,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Delete Confirm Modal State
  const [cardToDelete, setCardToDelete] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const data = await api.getAllCapabilities();
      setCards(data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load capability cards:', err);
      setError('Failed to query dynamic capability cards from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePresetSelect = (preset) => {
    setFormData((prev) => ({
      ...prev,
      title: preset.title,
      description: preset.description,
      icon_key: preset.icon_key,
      accent_color: preset.accent_color,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (formError) setFormError(null);
  };

  const handleStartCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      title: 'AI AGENTIC PIPELINES',
      description: 'Gemini Vision OCR, Whisper & Multi-LLM Orchestration',
      icon_key: 'cpu',
      accent_color: 'cyan',
      order_index: cards.length,
      is_active: true,
    });
    setFormError(null);
  };

  const handleEditClick = (card) => {
    setIsEditing(true);
    setEditingId(card.id);
    setFormData({
      title: card.title || '',
      description: card.description || '',
      icon_key: card.icon_key || 'cpu',
      accent_color: card.accent_color || 'cyan',
      order_index: card.order_index ?? 0,
      is_active: card.is_active ?? true,
    });
    setFormError(null);
    showToast(`Loaded capability "${card.title}" for editing.`);

    // Smoothly scroll up to the form container and focus title input
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (titleInputRef.current) {
        titleInputRef.current.focus();
        titleInputRef.current.select();
      }
    }, 50);
  };

  const handleCancelEdit = () => {
    handleStartCreate();
    showToast('Editing mode dismissed.');
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setFormError('Please provide a title and tech summary description.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        title: formData.title.trim().toUpperCase(),
        description: formData.description.trim(),
        icon_key: (formData.icon_key || 'cpu').trim().toLowerCase(),
        accent_color: (formData.accent_color || 'cyan').trim().toLowerCase(),
        order_index: Number(formData.order_index) || 0,
        is_active: Boolean(formData.is_active),
      };

      if (isEditing && editingId) {
        const updated = await api.updateCapability(editingId, payload);
        // Optimistically update list state
        setCards((prev) => prev.map((c) => (c.id === editingId ? updated : c)));
        showToast(`Capability "${updated.title}" updated successfully.`);
      } else {
        const created = await api.createCapability(payload);
        setCards((prev) => [...prev, created]);
        showToast(`New capability "${created.title}" registered.`);
      }

      await fetchCards();
      handleStartCreate();
    } catch (err) {
      console.error('Failed to save capability card:', err);
      const errDetail = err.message || 'Operation failed. Check server connectivity.';
      setFormError(errDetail);
      showToast(`Error: ${errDetail}`);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (cardId) => {
    try {
      const updated = await api.toggleCapabilityStatus(cardId);
      setCards((prev) => prev.map((c) => (c.id === cardId ? updated : c)));
      showToast(`Visibility set to ${updated.is_active ? 'ACTIVE' : 'HIDDEN'}.`);
    } catch (err) {
      console.error('Toggle status failed:', err);
      showToast('Status toggle failed.');
    }
  };

  const handleMovePriority = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= cards.length) return;

    const newCards = [...cards];
    const [moved] = newCards.splice(index, 1);
    newCards.splice(targetIndex, 0, moved);

    // Reassign order_index sequentially
    const reorderPayload = newCards.map((item, idx) => ({
      id: item.id,
      order_index: idx,
    }));

    setCards(newCards.map((item, idx) => ({ ...item, order_index: idx })));

    try {
      await api.reorderCapabilities(reorderPayload);
      showToast('Priority ordering synchronized.');
    } catch (err) {
      console.error('Reorder failed:', err);
      fetchCards(); // rollback
    }
  };

  const handleConfirmDelete = async () => {
    if (!cardToDelete) return;
    setDeleteSubmitting(true);
    try {
      await api.deleteCapability(cardToDelete.id);
      setCards((prev) => prev.filter((c) => c.id !== cardToDelete.id));
      setDeleteConfirmOpen(false);
      setCardToDelete(null);
      showToast(`Capability "${cardToDelete.title}" purged from database.`);
      if (editingId === cardToDelete.id) {
        handleStartCreate();
      }
    } catch (err) {
      console.error('Delete failed:', err);
      showToast('Failed to delete capability card.');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-cyan-950/95 border border-cyan-400 text-cyan-200 font-mono text-xs flex items-center gap-3 shadow-neon-cyan animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-cyan-400 shadow-neon-cyan">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-mono font-bold tracking-wider text-slate-100">
              HERO CAPABILITIES & SERVICES
            </h1>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Manage live value proposition cards displayed across the public portfolio hero showcase.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchCards}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 font-mono text-xs transition-colors cursor-pointer"
          title="Refresh Capabilities Telemetry"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>SYNC TELEMETRY</span>
        </button>
      </div>

      {/* Main Grid: Form + Configured Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Add/Edit Card Form */}
        <div ref={formRef} className="lg:col-span-5 space-y-6 scroll-mt-6">
          <div
            className={`p-6 rounded-2xl bg-[#080d1a]/90 border transition-all duration-300 shadow-2xl relative ${
              isEditing
                ? 'border-cyan-400/80 ring-1 ring-cyan-400/50 shadow-[0_0_30px_rgba(0,240,255,0.22)]'
                : 'border-cyan-500/30'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  {isEditing ? 'MODIFY CAPABILITY CARD' : 'NEW CAPABILITY CARD'}
                </span>
              </div>
              {isEditing && (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-950/80 border border-cyan-400 text-cyan-300 shadow-neon-cyan animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  EDITING CARD #{editingId}
                </span>
              )}
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 font-mono text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Capability Presets Quick-Selector */}
            <div className="space-y-2 mb-4">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Quick Value Proposition Presets
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CARD_PRESETS.map((p) => {
                  const isSelected = formData.title === p.title;
                  return (
                    <button
                      type="button"
                      key={p.title}
                      onClick={() => handlePresetSelect(p)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/80 border border-cyan-400 text-cyan-300 shadow-neon-cyan'
                          : 'bg-[#050812] border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40'
                      }`}
                    >
                      <CapabilityIcon iconKey={p.icon_key} className="w-3 h-3" />
                      <span>{p.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Card Title */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                  Card Header Title (Uppercase)
                </label>
                <input
                  ref={titleInputRef}
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., AI AGENTIC PIPELINES"
                  className="w-full px-3 py-2 rounded-lg cyber-input font-mono text-xs text-white uppercase tracking-wider"
                />
              </div>

              {/* Description / Tech Summary */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                  Description / Tech Stack Summary
                </label>
                <textarea
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Gemini Vision OCR, Whisper & Multi-LLM Orchestration"
                  className="w-full px-3 py-2 rounded-lg cyber-input font-mono text-xs text-white leading-relaxed resize-none"
                />
              </div>

              {/* Icon Key & Accent Color */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                    Icon Glyph Key
                  </label>
                  <select
                    name="icon_key"
                    value={formData.icon_key}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg cyber-input font-mono text-xs text-white"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                    Accent Color
                  </label>
                  <select
                    name="accent_color"
                    value={formData.accent_color}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg cyber-input font-mono text-xs text-white"
                  >
                    {ACCENT_OPTIONS.map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Priority Sequence */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                  Priority Sequence (0 = Top / Left)
                </label>
                <input
                  type="number"
                  name="order_index"
                  value={formData.order_index}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg cyber-input font-mono text-xs text-white"
                />
              </div>

              {/* Active Toggle Switch */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#050812] border border-cyan-500/20">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-200 block">
                    Public Grid Visibility
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Live display in public hero section
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500 shadow-neon-cyan"></div>
                </label>
              </div>

              {/* Live Card Preview Box */}
              <div className="space-y-1 pt-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Live Card Appearance Preview
                </label>
                {(() => {
                  const previewStyles = getCapabilityAccentStyles(formData.accent_color);
                  return (
                    <div
                      className={`p-4 rounded-xl border transition-all ${previewStyles.bg} ${previewStyles.border} ${previewStyles.shadow}`}
                    >
                      <div className={`flex items-center gap-1.5 text-xs font-bold font-mono ${previewStyles.text}`}>
                        <CapabilityIcon iconKey={formData.icon_key} className="w-3.5 h-3.5" />
                        <span>{formData.title || 'CAPABILITY TITLE'}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-1">
                        {formData.description || 'Description will appear here...'}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer ${
                    isEditing
                      ? 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 text-black hover:from-emerald-300 hover:to-blue-400 shadow-neon-emerald'
                      : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-black hover:from-cyan-300 hover:to-indigo-500 shadow-neon-cyan'
                  }`}
                >
                  {formSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isEditing ? 'SAVING CARD...' : 'REGISTERING...'}</span>
                    </>
                  ) : isEditing ? (
                    <>
                      <Save className="w-4 h-4" />
                      <span>UPDATE CAPABILITY</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>REGISTER CAPABILITY</span>
                    </>
                  )}
                </button>

                {isEditing && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-mono text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:text-white cursor-pointer transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>CANCEL EDIT</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: Configured Cards List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              CONFIGURED VALUE PROPOSITIONS ({cards.length})
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              HERO GRID SEQUENCE
            </span>
          </div>

          {loading && (
            <div className="py-16 text-center space-y-3 font-mono">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
              <p className="text-xs text-cyan-400">STREAMING CAPABILITY NODES...</p>
            </div>
          )}

          {!loading && error && (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-300 font-mono text-xs text-center">
              {error}
            </div>
          )}

          {!loading && !error && cards.length === 0 && (
            <div className="p-12 rounded-2xl bg-[#080d1a]/50 border border-cyan-500/20 text-center font-mono text-xs text-slate-500">
              No capability cards configured. Add your first service proposition card using the form.
            </div>
          )}

          {!loading && !error && cards.length > 0 && (
            <div className="space-y-3">
              {cards.map((card, idx) => {
                const isCurrentlyEditing = isEditing && editingId === card.id;
                const cardStyles = getCapabilityAccentStyles(card.accent_color);

                return (
                  <div
                    key={card.id}
                    className={`p-4 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isCurrentlyEditing
                        ? 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-400/60 shadow-[0_0_20px_rgba(0,240,255,0.25)]'
                        : card.is_active
                        ? `${cardStyles.bg} ${cardStyles.border} ${cardStyles.shadow}`
                        : 'bg-[#050811]/60 border-slate-800 opacity-60'
                    }`}
                  >
                    {/* Left: Icon, Header Title, Description */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {/* Icon Badge */}
                      <div
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-sm ${cardStyles.iconBg} ${cardStyles.border}`}
                      >
                        <CapabilityIcon iconKey={card.icon_key} className="w-5 h-5" />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-mono font-bold tracking-wider ${cardStyles.text}`}>
                            {card.title}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border uppercase ${cardStyles.badgeBg}`}>
                            {card.accent_color}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            #{card.order_index}
                          </span>
                          {isCurrentlyEditing && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-400 text-black">
                              EDITING NOW
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-mono text-slate-300 leading-relaxed">
                          {card.description}
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions, Reorder, Active Toggle */}
                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                      {/* Priority Shift Buttons */}
                      <div className="flex items-center rounded-lg bg-[#050812] border border-slate-800 p-0.5">
                        <button
                          type="button"
                          onClick={() => handleMovePriority(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-slate-400 hover:text-cyan-300 disabled:opacity-20 disabled:hover:text-slate-400 cursor-pointer"
                          title="Increase Priority (Move Up)"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMovePriority(idx, 'down')}
                          disabled={idx === cards.length - 1}
                          className="p-1 text-slate-400 hover:text-cyan-300 disabled:opacity-20 disabled:hover:text-slate-400 cursor-pointer"
                          title="Decrease Priority (Move Down)"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Active/Hidden Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(card.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                          card.is_active
                            ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 shadow-neon-emerald'
                            : 'bg-slate-900 border border-slate-700 text-slate-400'
                        }`}
                        title="Click to toggle public visibility"
                      >
                        {card.is_active ? (
                          <>
                            <Eye className="w-3 h-3 text-emerald-400" />
                            <span>ACTIVE</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-slate-500" />
                            <span>HIDDEN</span>
                          </>
                        )}
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(card);
                        }}
                        className={`p-2 rounded-lg border transition-all cursor-pointer ${
                          isCurrentlyEditing
                            ? 'bg-cyan-500 text-black border-cyan-400 shadow-neon-cyan'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/50 hover:bg-cyan-950/40'
                        }`}
                        title={`Edit "${card.title}"`}
                      >
                        <Edit2 className="w-3.5 h-3.5 pointer-events-none" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCardToDelete(card);
                          setDeleteConfirmOpen(true);
                        }}
                        className="p-2 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-400 hover:bg-rose-900/40 hover:text-rose-200 transition-colors cursor-pointer"
                        title="Delete Capability Card"
                      >
                        <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="PURGE CAPABILITY CARD"
        message={`Are you sure you want to permanently delete "${cardToDelete?.title}" from the database?`}
        confirmText="PURGE CARD"
        loading={deleteSubmitting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setCardToDelete(null);
        }}
      />
    </div>
  );
}
