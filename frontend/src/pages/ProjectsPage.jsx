import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Grid,
  List,
  ExternalLink,
  Edit2,
  Trash2,
  Tag,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  FolderGit2,
  Image as ImageIcon,
  CheckCircle2,
  Play,
  ShoppingBag
} from 'lucide-react';
import { GithubIcon, YoutubeIcon } from '../components/Icons';
import ConfirmDialog from '../components/ConfirmDialog';
import api from '../services/api';

const CATEGORIES = ['All', 'Web App', 'AI/ML', 'Automation', 'Mobile', 'DevOps & Cloud', 'Cybersecurity', 'Blockchain / Web3'];

export default function ProjectsPage({
  onOpenCreateModal,
  onOpenEditModal,
  onOpenDeleteConfirm,
}) {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'published', 'draft'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);

  // Localized Delete Dialog & Optimistic State
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (statusFilter === 'published') params.published = true;
      if (statusFilter === 'draft') params.published = false;

      const data = await api.getProjects(params);
      setProjects(data);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProjects();
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [search, selectedCategory, statusFilter]);

  // Sync across tabs / components if project record changes
  useEffect(() => {
    const handleProjectChanged = (e) => {
      if (e?.detail?.id) {
        setProjects((prev) => prev.filter((p) => p.id !== e.detail.id));
      } else {
        fetchProjects();
      }
    };
    window.addEventListener('cyber:project-changed', handleProjectChanged);
    return () => window.removeEventListener('cyber:project-changed', handleProjectChanged);
  }, []);

  // --- DELETE MODAL ORCHESTRATION ---
  const handleOpenDelete = (e, project) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (e && e.preventDefault) e.preventDefault();
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDelete = () => {
    if (deleteLoading) return;
    setIsDeleteModalOpen(false);
    setProjectToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete || (!projectToDelete.id && projectToDelete.id !== 0)) {
      console.error('Target project is undefined or missing ID.');
      return;
    }

    const targetId = projectToDelete.id;
    const targetTitle = projectToDelete.title || `Project #${targetId}`;
    setDeleteLoading(true);

    try {
      await api.deleteProject(targetId);

      // 1. Optimistic state cleanup
      setProjects((prev) => prev.filter((p) => p.id !== targetId));

      // 2. Clear target & close modal
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);

      // 3. Trigger Cyber Neon Toast
      setToastMessage(`Project "${targetTitle}" successfully purged.`);
      setTimeout(() => {
        setToastMessage(null);
      }, 4000);

      // 4. Notify app listeners (Dashboard metrics, etc.)
      window.dispatchEvent(new CustomEvent('cyber:project-changed', { detail: { id: targetId } }));
    } catch (err) {
      console.error('Failed to purge project:', err);
      alert(`Purge failed: ${err.message || 'Server error'}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async (projectId) => {
    try {
      const updated = await api.toggleProjectStatus(projectId);
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, is_published: updated.is_published } : p))
      );
    } catch (err) {
      console.error('Failed to toggle project status:', err);
    }
  };

  // --- OPTIMISTIC REORDERING CONTROLS ---
  const handleMoveProject = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const previousProjects = [...projects];
    const reordered = [...projects];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    // Optimistically update UI
    setProjects(reordered);
    setReordering(true);

    // Build payload with updated order_index
    const payload = reordered.map((item, idx) => ({
      id: item.id,
      order_index: idx,
    }));

    try {
      await api.reorderProjects(payload);
    } catch (err) {
      console.error('Failed to persist project reordering:', err);
      // Rollback on network failure
      setProjects(previousProjects);
      alert(`Reordering sync failed: ${err.message}`);
    } finally {
      setReordering(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title & Main Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-cyan-500/20">
        <div>
          <h1 className="text-2xl font-mono font-bold tracking-wide text-slate-100 flex items-center gap-2">
            PROJECT REPOSITORY
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              {projects.length} RECORDS
            </span>
            {reordering && (
              <span className="text-[10px] font-mono text-cyan-400 animate-pulse flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                SYNCING ORDER...
              </span>
            )}
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Manage portfolio case studies, technical specifications, custom priority sorting, and assets.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-semibold bg-gradient-to-r from-cyan-400 to-blue-600 text-black hover:from-cyan-300 hover:to-blue-500 shadow-neon-cyan transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>NEW PROJECT RECORD</span>
        </button>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="p-4 rounded-xl bg-[#080d1a]/80 border border-cyan-500/20 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Real-time search filter */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-cyan-400/80 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, tech stack, tags..."
            className="w-full pl-10 pr-4 py-2 rounded-lg cyber-input font-mono text-xs placeholder:text-slate-600"
          />
        </div>

        {/* Categories, Visibility, and View Mode Toggles */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-lg cyber-input font-mono text-xs"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-[#080d1a]">
                Domain: {cat}
              </option>
            ))}
          </select>

          {/* Visibility Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg cyber-input font-mono text-xs"
          >
            <option value="all" className="bg-[#080d1a]">
              Status: All
            </option>
            <option value="published" className="bg-[#080d1a]">
              Status: Published
            </option>
            <option value="draft" className="bg-[#080d1a]">
              Status: Drafts
            </option>
          </select>

          {/* Grid vs Table View Mode */}
          <div className="flex items-center p-1 rounded-lg bg-slate-900 border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${
                viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded ${
                viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Display: Grid or Table */}
      {loading ? (
        <div className="py-20 text-center font-mono text-xs text-cyan-400 animate-pulse flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>QUERYING CYBER REPOSITORY RECORDS...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="cyber-card p-12 text-center rounded-2xl border border-cyan-500/20 space-y-3">
          <FolderGit2 className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="font-mono text-sm text-slate-300">
            No projects found matching the active filter criteria.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
              setStatusFilter('all');
            }}
            className="text-xs font-mono text-cyan-400 underline hover:text-cyan-300"
          >
            Clear Search & Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="cyber-card rounded-xl border border-cyan-500/25 flex flex-col justify-between overflow-hidden group hover:border-cyan-400/60"
            >
              {/* Optional Cover Image Asset Thumbnail */}
              {project.image_url ? (
                <div className="relative h-40 w-full overflow-hidden border-b border-cyan-500/20 bg-[#050811]">
                  <img
                    src={api.getImageUrl(project.image_url)}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080d1a] via-transparent to-transparent opacity-80"></div>
                  
                  {/* Order Priority Tag Over Image */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono text-cyan-400 border border-cyan-500/40">
                    PRIORITY #{index + 1}
                  </div>
                </div>
              ) : (
                <div className="px-5 pt-4 flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-black/60 text-[10px] font-mono text-cyan-400 border border-cyan-500/30">
                    PRIORITY #{index + 1}
                  </span>
                </div>
              )}

              {/* Main Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-500/30">
                      {project.category}
                    </span>

                    <button
                      onClick={() => handleToggleStatus(project.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold transition-all ${
                        project.is_published
                          ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 shadow-neon-emerald'
                          : 'bg-amber-950/20 border border-amber-500/30 text-amber-300'
                      }`}
                      title="Click to toggle publish status"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          project.is_published ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                        }`}
                      ></span>
                      <span>{project.is_published ? 'PUBLISHED' : 'DRAFT'}</span>
                    </button>
                  </div>

                  <h3 className="font-mono font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {project.title}
                  </h3>

                  <p className="font-mono text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {project.description?.replace(/#{1,6}\s?/g, '').replace(/```[\s\S]*?```/g, '[Code snippet]') || 'No case study recorded.'}
                  </p>
                </div>

                {/* Tech Stack tags */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-wrap gap-1.5">
                    {project.tech_stack
                      ?.split(',')
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .slice(0, 5)
                      .map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#050811] text-slate-300 border border-slate-800"
                        >
                          <Tag className="w-2.5 h-2.5 text-cyan-400" />
                          {tag}
                        </span>
                      ))}
                  </div>

                  {/* Links, Priority Reorder & Action Buttons */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    {/* Left: Reorder Arrows */}
                    <div className="flex items-center gap-1 bg-[#050811] p-1 rounded-lg border border-slate-800">
                      <button
                        onClick={() => handleMoveProject(index, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Move Up (Increase Priority)"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveProject(index, 'down')}
                        disabled={index === projects.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Move Down (Decrease Priority)"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Middle: URLs, Live Demo & YouTube Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(project.live_url || project.live_demo_url) && (
                        <a
                          href={project.live_url || project.live_demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 hover:border-emerald-400 text-[10px] font-mono font-bold shadow-[0_0_10px_rgba(16,185,129,0.15)] transition-all"
                          title="Open Live Preview in new tab"
                        >
                          <span>LIVE DEMO</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                      {project.youtube_url && (
                        <a
                          href={project.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-sky-500/10 border border-sky-500/30 text-sky-300 hover:bg-sky-500/20 hover:border-sky-400 text-[10px] font-mono font-bold shadow-[0_0_8px_rgba(56,189,248,0.15)] transition-all whitespace-nowrap"
                          title="Watch Video Demo in new tab"
                        >
                          <Play className="w-2.5 h-2.5 text-sky-400 fill-sky-400/30" />
                          <span>WATCH VIDEO</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                      {(project.purchase_url || project.purchase_price) && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold"
                          title={`Monetized: ${project.purchase_price || 'Codebase License'}`}
                        >
                          <ShoppingBag className="w-2.5 h-2.5 text-amber-400" />
                          <span>{project.purchase_price || 'BUY CODEBASE'}</span>
                        </span>
                      )}
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
                          title="GitHub Repository"
                        >
                          <GithubIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    {/* Right: Edit & Purge */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenEditModal(project)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-950/30 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-400 text-xs font-mono transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>EDIT</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleOpenDelete(e, project)}
                        className="p-1.5 rounded bg-rose-950/20 border border-rose-500/30 text-rose-400 hover:bg-rose-900/40 hover:text-rose-200 transition-colors"
                        title="Purge Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="cyber-card rounded-xl border border-cyan-500/20 overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#050811]/90 border-b border-cyan-500/20 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Priority / Reorder</th>
                <th className="p-3.5">Asset</th>
                <th className="p-3.5">Project Title</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Tech Stack</th>
                <th className="p-3.5">Visibility</th>
                <th className="p-3.5">Links</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {projects.map((project, index) => (
                <tr key={project.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 font-bold">#{index + 1}</span>
                      <div className="inline-flex items-center gap-1 bg-[#050811] p-0.5 rounded border border-slate-800">
                        <button
                          onClick={() => handleMoveProject(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-slate-400 hover:text-cyan-300 disabled:opacity-20"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleMoveProject(index, 'down')}
                          disabled={index === projects.length - 1}
                          className="p-1 text-slate-400 hover:text-cyan-300 disabled:opacity-20"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    {project.image_url ? (
                      <img
                        src={api.getImageUrl(project.image_url)}
                        alt=""
                        className="w-10 h-8 object-cover rounded border border-cyan-500/30"
                      />
                    ) : (
                      <div className="w-10 h-8 rounded border border-slate-800 bg-[#050811] flex items-center justify-center text-slate-600">
                        <ImageIcon className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </td>
                  <td className="p-3.5 font-semibold text-slate-200 max-w-xs truncate">
                    {project.title}
                  </td>
                  <td className="p-3.5 text-cyan-400">{project.category}</td>
                  <td className="p-3.5 max-w-sm truncate text-slate-400">
                    {project.tech_stack}
                  </td>
                  <td className="p-3.5">
                    <button
                      onClick={() => handleToggleStatus(project.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                        project.is_published
                          ? 'bg-emerald-950/30 border border-emerald-500/40 text-emerald-300'
                          : 'bg-amber-950/20 border border-amber-500/30 text-amber-300'
                      }`}
                    >
                      {project.is_published ? '● LIVE' : '○ DRAFT'}
                    </button>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {(project.live_url || project.live_demo_url) && (
                        <a
                          href={project.live_url || project.live_demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 hover:border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)] transition-all"
                          title="Open Live Preview in new tab"
                        >
                          <span>LIVE DEMO</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                      {project.youtube_url && (
                        <a
                          href={project.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/10 border border-sky-500/30 text-sky-300 hover:bg-sky-500/20 hover:border-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.15)] transition-all whitespace-nowrap"
                          title="Watch Video Demo in new tab"
                        >
                          <Play className="w-2.5 h-2.5 text-sky-400 fill-sky-400/30" />
                          <span>WATCH VIDEO</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                      {(project.purchase_url || project.purchase_price) && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.15)]"
                          title={`Monetized: ${project.purchase_price || 'Codebase License'}`}
                        >
                          <ShoppingBag className="w-2.5 h-2.5 text-amber-400" />
                          <span>{project.purchase_price || 'BUY'}</span>
                        </span>
                      )}
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-slate-400 hover:text-cyan-300 p-1 rounded hover:bg-slate-800 transition-colors"
                          title="GitHub Repository"
                        >
                          <GithubIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => onOpenEditModal(project)}
                        className="px-2 py-1 rounded bg-cyan-950/30 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/40 text-xs font-mono"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleOpenDelete(e, project)}
                        className="p-1 rounded bg-rose-950/20 border border-rose-500/30 text-rose-400 hover:bg-rose-900/40"
                        title="Purge Project"
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
      )}

      {/* Confirm Project Purge Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        title="PURGE PROJECT RECORD"
        message={`Are you sure you want to completely erase "${projectToDelete?.title || 'this project'}" from the database? This cannot be undone.`}
        confirmText="PURGE PROJECT"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onClose={handleCloseDelete}
        onCancel={handleCloseDelete}
      />

      {/* Cyber Neon Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#080d1a] border border-cyan-500/50 shadow-neon-cyan animate-fade-in text-cyan-300 font-mono text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
