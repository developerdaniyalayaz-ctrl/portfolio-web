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
  Server,
  Layout,
  Database,
  Terminal,
  Code2,
  ShieldCheck,
  Bot,
  Zap,
  Globe
} from 'lucide-react';
import { StackCategoryIcon, getStackCategoryAccentStyles } from '../components/Icons';
import ConfirmDialog from '../components/ConfirmDialog';
import api from '../services/api';

const CATEGORY_ICON_OPTIONS = [
  { key: 'cpu', label: 'CPU / Neural Core' },
  { key: 'bot', label: 'Bot / Agentic AI' },
  { key: 'server', label: 'Server / Backend API' },
  { key: 'layout', label: 'Layout / Frontend UI' },
  { key: 'database', label: 'Database / Relational' },
  { key: 'code', label: 'Code / Algorithms' },
  { key: 'terminal', label: 'Terminal / CLI Automation' },
  { key: 'shield', label: 'Shield / Security' },
  { key: 'zap', label: 'Zap / High Throughput' },
  { key: 'globe', label: 'Globe / Web Infrastructure' },
];

const ACCENT_COLOR_OPTIONS = [
  { key: 'cyan', label: 'Electric Cyan (#00f0ff)', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  { key: 'blue', label: 'Cobalt Blue (#38bdf8)', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  { key: 'emerald', label: 'Neon Emerald (#10b981)', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { key: 'violet', label: 'Cyber Violet (#a855f7)', badge: 'bg-violet-500/20 text-violet-300 border-violet-500/40' },
];

export default function TechStackPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingItem, setSavingItem] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Category Form State
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [catTitle, setCatTitle] = useState('');
  const [catSubtitle, setCatSubtitle] = useState('');
  const [catIconKey, setCatIconKey] = useState('cpu');
  const [catAccentColor, setCatAccentColor] = useState('cyan');
  const [catOrderIndex, setCatOrderIndex] = useState(0);
  const [catIsActive, setCatIsActive] = useState(true);

  // Skill Item Form State
  const [editingItemId, setEditingItemId] = useState(null);
  const [itemName, setItemName] = useState('');
  const [itemDetail, setItemDetail] = useState('');
  const [itemOrderIndex, setItemOrderIndex] = useState(0);
  const [itemIsActive, setItemIsActive] = useState(true);

  // Delete Confirm Dialogs
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState(null);
  const [deleteItemTarget, setDeleteItemTarget] = useState(null);

  const categoryFormRef = useRef(null);
  const categoryTitleInputRef = useRef(null);
  const itemFormRef = useRef(null);
  const itemNameInputRef = useRef(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getAllTechStack();
      if (Array.isArray(data)) {
        setCategories(data);
        if (data.length > 0) {
          // Keep current selected category or pick first
          setSelectedCategoryId((prev) => {
            const exists = data.some((c) => c.id === prev);
            return exists ? prev : data[0].id;
          });
        } else {
          setSelectedCategoryId(null);
        }
      }
    } catch (err) {
      console.error('Failed to load tech stack:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to load tech stack data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) || null;

  // --- Category Handlers ---
  const handleEditCategoryClick = (cat) => {
    setEditingCategoryId(cat.id);
    setCatTitle(cat.title);
    setCatSubtitle(cat.subtitle || '');
    setCatIconKey(cat.icon_key || 'cpu');
    setCatAccentColor(cat.accent_color || 'cyan');
    setCatOrderIndex(cat.order_index ?? 0);
    setCatIsActive(cat.is_active ?? true);

    setTimeout(() => {
      categoryFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      categoryTitleInputRef.current?.focus();
    }, 50);
  };

  const handleCancelCategoryEdit = () => {
    setEditingCategoryId(null);
    setCatTitle('');
    setCatSubtitle('');
    setCatIconKey('cpu');
    setCatAccentColor('cyan');
    setCatOrderIndex(0);
    setCatIsActive(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!catTitle.trim()) {
      setFeedback({ type: 'error', message: 'Category title is required.' });
      return;
    }

    try {
      setSavingCategory(true);
      const payload = {
        title: catTitle.trim(),
        subtitle: catSubtitle.trim(),
        icon_key: catIconKey,
        accent_color: catAccentColor,
        order_index: Number(catOrderIndex) || 0,
        is_active: catIsActive,
      };

      if (editingCategoryId) {
        await api.updateStackCategory(editingCategoryId, payload);
        setFeedback({ type: 'success', message: `Category "${payload.title}" updated successfully.` });
      } else {
        const created = await api.createStackCategory(payload);
        setSelectedCategoryId(created.id);
        setFeedback({ type: 'success', message: `New Category "${payload.title}" added to stack.` });
      }
      handleCancelCategoryEdit();
      await loadData();
    } catch (err) {
      console.error('Failed to save category:', err);
      setFeedback({ type: 'error', message: err.message || 'Operation failed.' });
    } finally {
      setSavingCategory(false);
    }
  };

  const handleToggleCategoryActive = async (cat) => {
    try {
      await api.toggleStackCategoryStatus(cat.id);
      await loadData();
      setFeedback({
        type: 'success',
        message: `Category "${cat.title}" is now ${cat.is_active ? 'HIDDEN' : 'ACTIVE'}.`,
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to toggle status.' });
    }
  };

  const handleMoveCategoryPriority = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const reordered = [...categories];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const payload = reordered.map((cat, idx) => ({
      id: cat.id,
      order_index: idx,
    }));

    try {
      setCategories(reordered);
      await api.reorderStackCategories(payload);
      setFeedback({ type: 'success', message: 'Category priority sequence updated.' });
    } catch (err) {
      console.error('Reorder failed:', err);
      setFeedback({ type: 'error', message: 'Could not sync category order.' });
      loadData();
    }
  };

  const handleConfirmDeleteCategory = async () => {
    if (!deleteCategoryTarget) return;
    try {
      await api.deleteStackCategory(deleteCategoryTarget.id);
      setFeedback({
        type: 'success',
        message: `Category "${deleteCategoryTarget.title}" and its skills have been permanently purged.`,
      });
      setDeleteCategoryTarget(null);
      await loadData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete category.' });
    }
  };

  // --- Skill Item Handlers ---
  const handleEditItemClick = (item) => {
    setEditingItemId(item.id);
    setItemName(item.name);
    setItemDetail(item.detail || '');
    setItemOrderIndex(item.order_index ?? 0);
    setItemIsActive(item.is_active ?? true);

    setTimeout(() => {
      itemFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      itemNameInputRef.current?.focus();
    }, 50);
  };

  const handleCancelItemEdit = () => {
    setEditingItemId(null);
    setItemName('');
    setItemDetail('');
    setItemOrderIndex(0);
    setItemIsActive(true);
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategoryId) {
      setFeedback({ type: 'error', message: 'Please select a parent category first.' });
      return;
    }
    if (!itemName.trim()) {
      setFeedback({ type: 'error', message: 'Skill module name is required.' });
      return;
    }

    try {
      setSavingItem(true);
      const payload = {
        category_id: selectedCategoryId,
        name: itemName.trim(),
        detail: itemDetail.trim(),
        order_index: Number(itemOrderIndex) || 0,
        is_active: itemIsActive,
      };

      if (editingItemId) {
        await api.updateStackItem(editingItemId, payload);
        setFeedback({ type: 'success', message: `Skill "${payload.name}" updated successfully.` });
      } else {
        await api.createStackItem(payload);
        setFeedback({ type: 'success', message: `Skill module "${payload.name}" added.` });
      }
      handleCancelItemEdit();
      await loadData();
    } catch (err) {
      console.error('Failed to save skill module:', err);
      setFeedback({ type: 'error', message: err.message || 'Operation failed.' });
    } finally {
      setSavingItem(false);
    }
  };

  const handleToggleItemActive = async (item) => {
    try {
      await api.toggleStackItemStatus(item.id);
      await loadData();
      setFeedback({
        type: 'success',
        message: `Skill "${item.name}" is now ${item.is_active ? 'HIDDEN' : 'ACTIVE'}.`,
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to toggle status.' });
    }
  };

  const handleMoveItemPriority = async (items, index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const reordered = [...items];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const payload = reordered.map((it, idx) => ({
      id: it.id,
      order_index: idx,
    }));

    try {
      // Optimistic update
      setCategories((prev) =>
        prev.map((c) => (c.id === selectedCategoryId ? { ...c, items: reordered } : c))
      );
      await api.reorderStackItems(payload);
      setFeedback({ type: 'success', message: 'Skill module sequence updated.' });
    } catch (err) {
      console.error('Reorder skills failed:', err);
      setFeedback({ type: 'error', message: 'Could not sync skill order.' });
      loadData();
    }
  };

  const handleConfirmDeleteItem = async () => {
    if (!deleteItemTarget) return;
    try {
      await api.deleteStackItem(deleteItemTarget.id);
      setFeedback({
        type: 'success',
        message: `Skill module "${deleteItemTarget.name}" deleted.`,
      });
      setDeleteItemTarget(null);
      await loadData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete skill module.' });
    }
  };

  return (
    <div className="space-y-8 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold tracking-wider uppercase">
            <Layers className="w-4 h-4 animate-pulse" />
            <span>ENGINEERING STACK & CAPABILITIES ENGINE</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1">
            TECH STACK & PROTOCOLS
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Manage your high-level architecture pillars and individual skill modules shown on the public showcase.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#090f20] border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 hover:text-white text-xs transition-all w-fit cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>REFRESH STACK</span>
        </button>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
            feedback.type === 'error'
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* SECTION 1: STACK CATEGORIES (PILLARS) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            <h2 className="text-sm md:text-base font-bold text-white tracking-wider uppercase">
              1. STACK CATEGORIES / PILLARS
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
              {categories.length} PILLARS
            </span>
          </div>
        </div>

        {/* Category Form */}
        <div
          ref={categoryFormRef}
          className="p-5 rounded-2xl bg-[#090f20]/90 border border-cyan-500/30 shadow-[0_0_25px_rgba(0,240,255,0.08)] space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
              {editingCategoryId ? (
                <>
                  <Edit2 className="w-4 h-4 text-cyan-400" />
                  <span>EDIT CATEGORY #{editingCategoryId}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-cyan-400" />
                  <span>REGISTER NEW STACK PILLAR</span>
                </>
              )}
            </div>
            {editingCategoryId && (
              <button
                onClick={handleCancelCategoryEdit}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>CANCEL</span>
              </button>
            )}
          </div>

          <form onSubmit={handleCategorySubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  PILLAR TITLE *
                </label>
                <input
                  ref={categoryTitleInputRef}
                  type="text"
                  value={catTitle}
                  onChange={(e) => setCatTitle(e.target.value)}
                  placeholder="e.g. AI & INTELLIGENT AUTOMATION"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#050811] border border-cyan-500/30 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  SUBTITLE / KEY PROTOCOLS
                </label>
                <input
                  type="text"
                  value={catSubtitle}
                  onChange={(e) => setCatSubtitle(e.target.value)}
                  placeholder="e.g. Large Language Models, Vision OCR & Agentic Orchestration"
                  className="w-full px-3 py-2 rounded-lg bg-[#050811] border border-cyan-500/30 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  ICON IDENTIFIER
                </label>
                <select
                  value={catIconKey}
                  onChange={(e) => setCatIconKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#050811] border border-cyan-500/30 text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                >
                  {CATEGORY_ICON_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  ACCENT THEME
                </label>
                <select
                  value={catAccentColor}
                  onChange={(e) => setCatAccentColor(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#050811] border border-cyan-500/30 text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                >
                  {ACCENT_COLOR_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4 pt-4 sm:pt-6">
                <label className="inline-flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={catIsActive}
                    onChange={(e) => setCatIsActive(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#050811] border-cyan-500/40 text-cyan-400 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>ACTIVE / VISIBLE</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              {editingCategoryId && (
                <button
                  type="button"
                  onClick={handleCancelCategoryEdit}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  CANCEL
                </button>
              )}
              <button
                type="submit"
                disabled={savingCategory}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 hover:bg-cyan-500/30 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all font-bold cursor-pointer disabled:opacity-50"
              >
                {savingCategory ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : editingCategoryId ? (
                  <Save className="w-3.5 h-3.5" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>{editingCategoryId ? 'UPDATE PILLAR' : 'DEPLOY PILLAR'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Categories List Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat, idx) => {
            const isSelected = cat.id === selectedCategoryId;
            const styles = getStackCategoryAccentStyles(cat.accent_color);
            const items = cat.items || [];

            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#090f20] border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.25)] ring-1 ring-cyan-400'
                    : 'bg-[#090f20]/60 border-slate-800 hover:border-slate-700'
                } ${!cat.is_active ? 'opacity-60' : ''}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${styles.accentBg}`}>
                        <StackCategoryIcon iconKey={cat.icon_key} className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                          PILLAR #{cat.order_index ?? idx + 1}
                        </span>
                        <h3 className="text-xs font-bold text-slate-100 tracking-wider">
                          {cat.title}
                        </h3>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleCategoryActive(cat);
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                        cat.is_active
                          ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                          : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                      }`}
                    >
                      {cat.is_active ? 'ACTIVE' : 'HIDDEN'}
                    </button>
                  </div>

                  {cat.subtitle && (
                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                      {cat.subtitle}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-cyan-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{items.length} Modules</span>
                  </span>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveCategoryPriority(idx, -1)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Move Left / Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === categories.length - 1}
                      onClick={() => handleMoveCategoryPriority(idx, 1)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Move Right / Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditCategoryClick(cat)}
                      className="p-1 rounded hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteCategoryTarget(cat)}
                      className="p-1 rounded hover:bg-slate-800 text-rose-400 hover:text-rose-300 cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: SKILL MODULES MANAGER */}
      {selectedCategory && (
        <div className="space-y-6 pt-4 border-t border-cyan-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <h2 className="text-sm md:text-base font-bold text-white tracking-wider uppercase">
                2. SKILL MODULES: {selectedCategory.title}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                {(selectedCategory.items || []).length} SKILLS CONFIGURED
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Managing skills inside active pillar
            </span>
          </div>

          {/* Skill Item Form */}
          <div
            ref={itemFormRef}
            className="p-5 rounded-2xl bg-[#090f20]/90 border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.08)] space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
                {editingItemId ? (
                  <>
                    <Edit2 className="w-4 h-4 text-emerald-400" />
                    <span>EDIT SKILL MODULE #{editingItemId}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <span>ADD SKILL MODULE TO {selectedCategory.title}</span>
                  </>
                )}
              </div>
              {editingItemId && (
                <button
                  onClick={handleCancelItemEdit}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>CANCEL</span>
                </button>
              )}
            </div>

            <form onSubmit={handleItemSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    SKILL / FRAMEWORK NAME *
                  </label>
                  <input
                    ref={itemNameInputRef}
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. Python 3.11+, FastAPI, React 18 (Vite)"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#050811] border border-emerald-500/30 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    TECHNICAL DETAIL / SPECIFICATION
                  </label>
                  <input
                    type="text"
                    value={itemDetail}
                    onChange={(e) => setItemDetail(e.target.value)}
                    placeholder="e.g. Primary core language, Asynchronous, high-throughput"
                    className="w-full px-3 py-2 rounded-lg bg-[#050811] border border-emerald-500/30 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={itemIsActive}
                    onChange={(e) => setItemIsActive(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#050811] border-emerald-500/40 text-emerald-400 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>ACTIVE / VISIBLE ON SHOWCASE</span>
                </label>

                <div className="flex items-center gap-3">
                  {editingItemId && (
                    <button
                      type="button"
                      onClick={handleCancelItemEdit}
                      className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                    >
                      CANCEL
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={savingItem}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 hover:bg-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all font-bold cursor-pointer disabled:opacity-50"
                  >
                    {savingItem ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : editingItemId ? (
                      <Save className="w-3.5 h-3.5" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>{editingItemId ? 'UPDATE SKILL' : 'ATTACH SKILL MODULE'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Skill Modules Table / List */}
          <div className="rounded-xl border border-slate-800 bg-[#090f20]/60 overflow-hidden">
            <div className="p-3 bg-[#050811] border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span>CONFIGURED MODULES ({selectedCategory.items?.length || 0})</span>
              <span>ACTIONS</span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {(selectedCategory.items || []).length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 font-mono">
                  No skill modules configured for this category yet. Use the form above to add your first skill.
                </div>
              ) : (
                selectedCategory.items.map((it, idx) => (
                  <div
                    key={it.id}
                    className={`p-3.5 flex items-center justify-between gap-4 transition-colors hover:bg-cyan-950/10 ${
                      !it.is_active ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-600 font-mono w-5">
                        #{idx + 1}
                      </span>
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 ${
                          it.is_active ? 'text-emerald-400' : 'text-slate-600'
                        }`}
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-200">
                          {it.name}
                        </span>
                        {it.detail && (
                          <span className="text-[11px] text-slate-400 ml-2">
                            — {it.detail}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleItemActive(it)}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-all cursor-pointer mr-2 ${
                          it.is_active
                            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                            : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                        }`}
                      >
                        {it.is_active ? 'ACTIVE' : 'HIDDEN'}
                      </button>

                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveItemPriority(selectedCategory.items, idx, -1)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === selectedCategory.items.length - 1}
                        onClick={() => handleMoveItemPriority(selectedCategory.items, idx, 1)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditItemClick(it)}
                        className="p-1 rounded hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 cursor-pointer"
                        title="Edit Skill"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteItemTarget(it)}
                        className="p-1 rounded hover:bg-slate-800 text-rose-400 hover:text-rose-300 cursor-pointer"
                        title="Delete Skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteCategoryTarget}
        title="PURGE STACK PILLAR"
        message={`Are you sure you want to permanently delete "${deleteCategoryTarget?.title}"? All ${(deleteCategoryTarget?.items || []).length} associated skill modules will also be permanently purged from the database.`}
        confirmText="PURGE PILLAR"
        cancelText="CANCEL"
        onConfirm={handleConfirmDeleteCategory}
        onCancel={() => setDeleteCategoryTarget(null)}
      />

      {/* Delete Skill Item Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteItemTarget}
        title="DELETE SKILL MODULE"
        message={`Are you sure you want to delete skill module "${deleteItemTarget?.name}" from ${selectedCategory?.title}?`}
        confirmText="DELETE MODULE"
        cancelText="CANCEL"
        onConfirm={handleConfirmDeleteItem}
        onCancel={() => setDeleteItemTarget(null)}
      />
    </div>
  );
}
