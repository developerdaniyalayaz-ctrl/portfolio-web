import React, { useState, useEffect, useRef } from 'react';
import {
  Share2,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
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
  X
} from 'lucide-react';
import { SocialPlatformIcon } from '../components/Icons';
import ConfirmDialog from '../components/ConfirmDialog';
import api from '../services/api';

const PLATFORM_PRESETS = [
  { platform: 'GitHub', label: 'GitHub', icon_key: 'github', defaultUrl: 'https://github.com/' },
  { platform: 'LinkedIn', label: 'LinkedIn', icon_key: 'linkedin', defaultUrl: 'https://linkedin.com/in/' },
  { platform: 'Upwork', label: 'Upwork', icon_key: 'upwork', defaultUrl: 'https://www.upwork.com/' },
  { platform: 'Fiverr', label: 'Fiverr', icon_key: 'fiverr', defaultUrl: 'https://www.fiverr.com/' },
  { platform: 'WhatsApp', label: 'WhatsApp', icon_key: 'whatsapp', defaultUrl: 'https://wa.me/' },
  { platform: 'YouTube', label: 'YouTube', icon_key: 'youtube', defaultUrl: 'https://youtube.com/@' },
  { platform: 'X / Twitter', label: 'X (Twitter)', icon_key: 'twitter', defaultUrl: 'https://x.com/' },
  { platform: 'Custom Website', label: 'Website', icon_key: 'globe', defaultUrl: 'https://' },
];

export default function SocialLinksPage() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Form & Edit State
  const formRef = useRef(null);
  const labelInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    platform: 'GitHub',
    label: 'GitHub',
    url: 'https://github.com/',
    icon_key: 'github',
    order_index: 0,
    is_active: true,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Delete Confirm Modal State
  const [linkToDelete, setLinkToDelete] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const data = await api.getAllSocialLinks();
      setLinks(data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load social links:', err);
      setError('Failed to query dynamic social links from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePresetSelect = (preset) => {
    setFormData((prev) => ({
      ...prev,
      platform: preset.platform,
      label: preset.label,
      icon_key: preset.icon_key,
      url: prev.url && prev.url !== 'https://' ? prev.url : preset.defaultUrl,
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
      platform: 'GitHub',
      label: 'GitHub',
      url: 'https://github.com/',
      icon_key: 'github',
      order_index: links.length,
      is_active: true,
    });
    setFormError(null);
  };

  const handleEditClick = (link) => {
    setIsEditing(true);
    setEditingId(link.id);
    setFormData({
      platform: link.platform || 'GitHub',
      label: link.label || '',
      url: link.url || '',
      icon_key: link.icon_key || 'globe',
      order_index: link.order_index ?? 0,
      is_active: link.is_active ?? true,
    });
    setFormError(null);
    showToast(`Loaded node "${link.label}" for edit.`);

    // Smoothly scroll up to the form container and focus the label input
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (labelInputRef.current) {
        labelInputRef.current.focus();
        labelInputRef.current.select();
      }
    }, 50);
  };

  const handleCancelEdit = () => {
    handleStartCreate();
    showToast('Editing mode dismissed.');
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.label.trim() || !formData.url.trim()) {
      setFormError('Please provide a display label and destination URL.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        platform: formData.platform.trim(),
        label: formData.label.trim(),
        url: formData.url.trim(),
        icon_key: (formData.icon_key || 'globe').trim().toLowerCase(),
        order_index: Number(formData.order_index) || 0,
        is_active: Boolean(formData.is_active),
      };

      if (isEditing && editingId) {
        const updated = await api.updateSocialLink(editingId, payload);
        // Optimistically update list state
        setLinks((prev) => prev.map((l) => (l.id === editingId ? updated : l)));
        showToast(`Node "${updated.label || payload.label}" updated successfully.`);
      } else {
        const created = await api.createSocialLink(payload);
        setLinks((prev) => [...prev, created]);
        showToast(`New social node "${created.label || payload.label}" registered.`);
      }

      await fetchLinks();
      handleStartCreate();
    } catch (err) {
      console.error('Failed to save social link:', err);
      const errDetail = err.message || 'Operation failed. Check server connectivity.';
      setFormError(errDetail);
      showToast(`Error: ${errDetail}`);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (linkId) => {
    try {
      const updated = await api.toggleSocialLinkStatus(linkId);
      setLinks((prev) => prev.map((l) => (l.id === linkId ? updated : l)));
      showToast(`Node visibility set to ${updated.is_active ? 'ACTIVE' : 'HIDDEN'}.`);
    } catch (err) {
      console.error('Toggle status failed:', err);
      showToast('Status toggle failed.');
    }
  };

  const handleMovePriority = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const newLinks = [...links];
    const [moved] = newLinks.splice(index, 1);
    newLinks.splice(targetIndex, 0, moved);

    // Reassign order_index sequentially
    const reorderPayload = newLinks.map((item, idx) => ({
      id: item.id,
      order_index: idx,
    }));

    setLinks(newLinks.map((item, idx) => ({ ...item, order_index: idx })));

    try {
      await api.reorderSocialLinks(reorderPayload);
      showToast('Priority ordering synchronized.');
    } catch (err) {
      console.error('Reorder failed:', err);
      fetchLinks(); // rollback
    }
  };

  const handleConfirmDelete = async () => {
    if (!linkToDelete) return;
    setDeleteSubmitting(true);
    try {
      await api.deleteSocialLink(linkToDelete.id);
      setLinks((prev) => prev.filter((l) => l.id !== linkToDelete.id));
      setDeleteConfirmOpen(false);
      setLinkToDelete(null);
      showToast(`Link "${linkToDelete.label}" purged from database.`);
      if (editingId === linkToDelete.id) {
        handleStartCreate();
      }
    } catch (err) {
      console.error('Delete failed:', err);
      showToast('Failed to delete social link.');
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
              <Share2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-mono font-bold tracking-wider text-slate-100">
              SOCIAL & FREELANCE PROFILES
            </h1>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Manage live public portfolio links for GitHub, LinkedIn, Upwork, Fiverr, and custom networks.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchLinks}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 font-mono text-xs transition-colors cursor-pointer"
          title="Refresh Link Telemetry"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>SYNC TELEMETRY</span>
        </button>
      </div>

      {/* Main Grid: Form + Management List */}
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
                  {isEditing ? 'MODIFY PROFILE RECORD' : 'NEW PLATFORM LINK'}
                </span>
              </div>
              {isEditing && (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-950/80 border border-cyan-400 text-cyan-300 shadow-neon-cyan animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  EDITING NODE #{editingId}
                </span>
              )}
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 font-mono text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Platform Presets Quick-Selector */}
            <div className="space-y-2 mb-4">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Platform Preset Auto-Fill
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PLATFORM_PRESETS.map((p) => {
                  const isSelected = formData.platform === p.platform;
                  return (
                    <button
                      type="button"
                      key={p.platform}
                      onClick={() => handlePresetSelect(p)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/80 border border-cyan-400 text-cyan-300 shadow-neon-cyan'
                          : 'bg-[#050812] border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40'
                      }`}
                    >
                      <SocialPlatformIcon iconKey={p.icon_key} className="w-3 h-3" />
                      <span>{p.platform}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Platform Name */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                  Platform Name
                </label>
                <input
                  type="text"
                  name="platform"
                  value={formData.platform}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., GitHub, Upwork, Fiverr"
                  className="w-full px-3 py-2 rounded-lg cyber-input font-mono text-xs text-white"
                />
              </div>

              {/* Display Button Label */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                  Display Label on Public Pill
                </label>
                <input
                  ref={labelInputRef}
                  type="text"
                  name="label"
                  value={formData.label}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., GitHub, Upwork Profile, Fiverr Pro"
                  className="w-full px-3 py-2 rounded-lg cyber-input font-mono text-xs text-white"
                />
              </div>

              {/* Destination URL */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                  Destination URL
                </label>
                <input
                  type="text"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  required
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg cyber-input font-mono text-xs text-white placeholder:text-slate-600"
                />
                <span className="text-[10px] font-mono text-slate-500 block">
                  * Opens in new tab with target="_blank" rel="noopener noreferrer"
                </span>
              </div>

              {/* Icon Key & Order Index */}
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
                    <option value="github">github</option>
                    <option value="linkedin">linkedin</option>
                    <option value="upwork">upwork</option>
                    <option value="fiverr">fiverr</option>
                    <option value="whatsapp">whatsapp</option>
                    <option value="youtube">youtube</option>
                    <option value="twitter">x / twitter</option>
                    <option value="globe">globe / web</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                    Priority Sequence
                  </label>
                  <input
                    type="number"
                    name="order_index"
                    value={formData.order_index}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg cyber-input font-mono text-xs text-white"
                  />
                </div>
              </div>

              {/* Active Toggle Switch */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#050812] border border-cyan-500/20">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-200 block">
                    Public Visibility
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Live display on public portfolio hero & footer
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
                      <span>{isEditing ? 'SAVING NODE...' : 'COMMITTING...'}</span>
                    </>
                  ) : isEditing ? (
                    <>
                      <Save className="w-4 h-4" />
                      <span>UPDATE NODE</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>REGISTER PROFILE</span>
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

        {/* Right Col: Interactive Links Matrix */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              CONFIGURED SOCIAL & FREELANCE NODES ({links.length})
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              CUSTOM PRIORITY ORDER
            </span>
          </div>

          {loading && (
            <div className="py-16 text-center space-y-3 font-mono">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
              <p className="text-xs text-cyan-400">STREAMING SOCIAL NODES...</p>
            </div>
          )}

          {!loading && error && (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-300 font-mono text-xs text-center">
              {error}
            </div>
          )}

          {!loading && !error && links.length === 0 && (
            <div className="p-12 rounded-2xl bg-[#080d1a]/50 border border-cyan-500/20 text-center font-mono text-xs text-slate-500">
              No social or freelance profiles configured. Add your first platform link using the form.
            </div>
          )}

          {!loading && !error && links.length > 0 && (
            <div className="space-y-3">
              {links.map((link, idx) => {
                const isCurrentlyEditing = isEditing && editingId === link.id;

                return (
                  <div
                    key={link.id}
                    className={`p-4 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isCurrentlyEditing
                        ? 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-400/60 shadow-[0_0_20px_rgba(0,240,255,0.25)]'
                        : link.is_active
                        ? 'bg-[#080d1a]/80 border-cyan-500/25 hover:border-cyan-400/60 shadow-lg'
                        : 'bg-[#050811]/60 border-slate-800 opacity-60'
                    }`}
                  >
                    {/* Left: Icon, Platform, Label, URL */}
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      {/* Platform Icon Badge */}
                      <div className="w-10 h-10 rounded-xl bg-[#050812] border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-neon-cyan">
                        <SocialPlatformIcon iconKey={link.icon_key} className="w-5 h-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-mono font-bold text-white">
                            {link.label}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 uppercase">
                            {link.platform}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            #{link.order_index}
                          </span>
                          {isCurrentlyEditing && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-400 text-black">
                              EDITING NOW
                            </span>
                          )}
                        </div>

                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono text-slate-400 hover:text-cyan-300 truncate block mt-0.5 max-w-sm transition-colors"
                          title={link.url}
                        >
                          {link.url}
                        </a>
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
                          disabled={idx === links.length - 1}
                          className="p-1 text-slate-400 hover:text-cyan-300 disabled:opacity-20 disabled:hover:text-slate-400 cursor-pointer"
                          title="Decrease Priority (Move Down)"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Active/Hidden Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(link.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                          link.is_active
                            ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 shadow-neon-emerald'
                            : 'bg-slate-900 border border-slate-700 text-slate-400'
                        }`}
                        title="Click to toggle public visibility"
                      >
                        {link.is_active ? (
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
                          handleEditClick(link);
                        }}
                        className={`p-2 rounded-lg border transition-all cursor-pointer ${
                          isCurrentlyEditing
                            ? 'bg-cyan-500 text-black border-cyan-400 shadow-neon-cyan'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/50 hover:bg-cyan-950/40'
                        }`}
                        title={`Edit "${link.label}"`}
                      >
                        <Edit2 className="w-3.5 h-3.5 pointer-events-none" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLinkToDelete(link);
                          setDeleteConfirmOpen(true);
                        }}
                        className="p-2 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-400 hover:bg-rose-900/40 hover:text-rose-200 transition-colors cursor-pointer"
                        title="Delete Profile"
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
        title="PURGE SOCIAL PROFILE LINK"
        message={`Are you sure you want to permanently delete "${linkToDelete?.label}" (${linkToDelete?.url}) from SQLite persistence?`}
        confirmText="PURGE LINK"
        loading={deleteSubmitting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setLinkToDelete(null);
        }}
      />
    </div>
  );
}
