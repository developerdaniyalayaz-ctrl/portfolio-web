import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  X,
  Sparkles,
  Globe,
  Tag,
  CheckCircle,
  AlertCircle,
  Loader2,
  Upload,
  Image as ImageIcon,
  Code2,
  Eye,
  Columns2,
  Trash2,
  Bold,
  Italic,
  Code,
  List,
  Heading,
  Link as LinkIcon,
  Layers,
  DollarSign,
  ShoppingBag,
  Briefcase
} from 'lucide-react';
import { GithubIcon, YoutubeIcon } from './Icons';
import api from '../services/api';

const PRESET_CATEGORIES = [
  'Web App',
  'AI/ML',
  'Automation',
  'Mobile',
  'DevOps & Cloud',
  'Cybersecurity',
  'Blockchain / Web3'
];

export default function ProjectModal({ isOpen, onClose, onSave, project = null }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Web App');
  const [customCategory, setCustomCategory] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [tags, setTags] = useState([]);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [architectureImageUrl, setArchitectureImageUrl] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [purchaseUrl, setPurchaseUrl] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [allowCustomHire, setAllowCustomHire] = useState(true);
  const [hireCustomSubject, setHireCustomSubject] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingArchitecture, setUploadingArchitecture] = useState(false);
  const [error, setError] = useState('');

  // Markdown Editor Mode: 'write' | 'preview' | 'split'
  const [editorMode, setEditorMode] = useState('split');

  const fileInputRef = useRef(null);
  const archFileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (project) {
      setTitle(project.title || '');
      if (PRESET_CATEGORIES.includes(project.category)) {
        setCategory(project.category);
        setCustomCategory('');
      } else {
        setCategory('Other');
        setCustomCategory(project.category || '');
      }

      if (project.tech_stack) {
        const parsed = project.tech_stack
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
        setTags(parsed);
      } else {
        setTags([]);
      }

      setDescription(project.description || '');
      setImageUrl(project.image_url || '');
      setArchitectureImageUrl(project.architecture_image_url || '');
      setLiveDemoUrl(project.live_url || project.live_demo_url || '');
      setGithubUrl(project.github_url || '');
      setYoutubeUrl(project.youtube_url || '');
      setPurchaseUrl(project.purchase_url || '');
      setPurchasePrice(project.purchase_price || '');
      setAllowCustomHire(project.allow_custom_hire ?? true);
      setHireCustomSubject(project.hire_custom_subject || '');
      setIsPublished(project.is_published ?? true);
    } else {
      setTitle('');
      setCategory('Web App');
      setCustomCategory('');
      setTags(['React', 'FastAPI', 'TailwindCSS']);
      setDescription('### Case Study Overview\nDetail system architecture, performance benchmarks, and deployment metrics here...\n\n```python\n# Neural inference latency benchmark\ndef evaluate_pipeline(data):\n    return model.predict(data)\n```\n');
      setImageUrl('');
      setArchitectureImageUrl('');
      setLiveDemoUrl('');
      setGithubUrl('');
      setYoutubeUrl('');
      setPurchaseUrl('');
      setPurchasePrice('');
      setAllowCustomHire(true);
      setHireCustomSubject('');
      setIsPublished(true);
    }
    setError('');
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = techStackInput.trim().replace(/^,+|,+$/g, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTechStackInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // --- LOCAL FILE UPLOAD HANDLER ---
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError('');
    try {
      const res = await api.uploadImage(file);
      setImageUrl(res.url);
    } catch (err) {
      setError(err.message || 'Image upload failed. Ensure file is JPG, PNG, or WebP.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // --- ARCHITECTURE BLUEPRINT IMAGE UPLOAD HANDLER ---
  const handleArchFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingArchitecture(true);
    setError('');
    try {
      const res = await api.uploadImage(file);
      setArchitectureImageUrl(res.url);
    } catch (err) {
      setError(err.message || 'Architecture blueprint upload failed. Ensure file is JPG, PNG, or WebP.');
    } finally {
      setUploadingArchitecture(false);
      if (archFileInputRef.current) archFileInputRef.current.value = '';
    }
  };

  // --- MARKDOWN SHORTCUT INSERTERS ---
  const insertMarkdown = (before, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = description;
    const selected = text.substring(start, end);
    const replacement = `${before}${selected || 'snippet'}${after}`;
    const nextText = text.substring(0, start) + replacement + text.substring(end);
    setDescription(nextText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + (selected ? selected.length : 7));
    }, 10);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Project title is required.');
      return;
    }

    const finalCategory = category === 'Other' ? customCategory.trim() : category;
    if (!finalCategory) {
      setError('Please specify a domain/category.');
      return;
    }

    if (tags.length === 0 && !techStackInput.trim()) {
      setError('Please provide at least one technology stack tag.');
      return;
    }

    let allTags = [...tags];
    if (techStackInput.trim() && !allTags.includes(techStackInput.trim())) {
      allTags.push(techStackInput.trim());
    }

    const payload = {
      title: title.trim(),
      category: finalCategory,
      tech_stack: allTags.join(', '),
      description: description.trim(),
      image_url: imageUrl.trim(),
      architecture_image_url: architectureImageUrl.trim() || '',
      live_url: liveDemoUrl.trim() || '',
      live_demo_url: liveDemoUrl.trim() || null,
      github_url: githubUrl.trim() || null,
      youtube_url: youtubeUrl.trim() || '',
      purchase_url: purchaseUrl.trim() || '',
      purchase_price: purchasePrice.trim() || '',
      allow_custom_hire: Boolean(allowCustomHire),
      hire_custom_subject: hireCustomSubject.trim() || '',
      is_published: isPublished,
    };

    setLoading(true);
    try {
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save project records.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#080d1a] border border-cyan-500/40 rounded-2xl shadow-[0_0_40px_rgba(0,240,255,0.25)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Neon Header Accent */}
        <div className="h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 shrink-0"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-cyan-500/20 bg-[#0a0f24]/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-neon-cyan">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono font-bold text-base sm:text-lg text-slate-100 flex items-center gap-2">
                {project ? 'EDIT PROJECT RECORD' : 'INITIALIZE NEW PROJECT'}
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  {project ? `#${project.id}` : 'NEW ENTRY'}
                </span>
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Media pipeline, technical case study, and deployment metrics.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-center gap-2 shadow-neon-crimson">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Aegis AI: Autonomous Threat Intelligence Agent"
              className="w-full px-3.5 py-2.5 rounded-lg cyber-input font-mono text-sm placeholder:text-slate-600"
            />
          </div>

          {/* Category & Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Domain / Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg cyber-input font-mono text-sm"
              >
                {PRESET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#080d1a]">
                    {cat}
                  </option>
                ))}
                <option value="Other" className="bg-[#080d1a]">
                  + Custom Domain
                </option>
              </select>

              {category === 'Other' && (
                <input
                  type="text"
                  placeholder="Enter custom category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="mt-2 w-full px-3.5 py-2 rounded-lg cyber-input font-mono text-sm"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Deployment Visibility
              </label>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border font-mono text-xs font-semibold transition-all duration-200 ${
                  isPublished
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300 shadow-neon-emerald'
                    : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isPublished ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  ></span>
                  {isPublished ? 'PUBLISHED (LIVE)' : 'DRAFT (PRIVATE)'}
                </span>
                <span className="text-[10px] text-slate-400 underline">TOGGLE</span>
              </button>
            </div>
          </div>

          {/* Tech Stack Tags Manager */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Tech Stack Tags * (Press Enter or comma to add)
            </label>
            <div className="p-2.5 rounded-lg bg-[#080d1a] border border-cyan-500/25 focus-within:border-cyan-400 focus-within:shadow-neon-cyan transition-all">
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                  >
                    <Tag className="w-3 h-3 text-cyan-400" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-400 transition-colors ml-0.5"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type tag (e.g. React, Docker, Python) and hit Enter..."
                className="w-full bg-transparent text-xs font-mono text-slate-200 focus:outline-none placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* PROJECT MEDIA COVER PIPELINE */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                Project Cover Asset / Screenshot
              </span>
              <span className="text-[10px] text-slate-400">JPG, PNG, WebP</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
              {/* Image Input and Upload Button */}
              <div className="md:col-span-2 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Enter image asset URL or upload from local drive..."
                    className="flex-1 px-3.5 py-2 rounded-lg cyber-input font-mono text-xs placeholder:text-slate-600"
                  />

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-mono text-xs font-semibold bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/50 hover:border-cyan-400 shadow-neon-cyan transition-all disabled:opacity-50 shrink-0"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>UPLOADING...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>UPLOAD FILE</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] font-mono text-slate-400">
                  Uploaded files are hashed with UUID collision resistance and served via <code className="text-cyan-400">/uploads</code>.
                </p>
              </div>

              {/* Instant Preview Box */}
              <div className="relative rounded-lg overflow-hidden border border-cyan-500/30 bg-[#050811] h-24 flex items-center justify-center group shadow-neon-cyan">
                {imageUrl ? (
                  <>
                    <img
                      src={api.getImageUrl(imageUrl)}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="p-1 rounded bg-rose-950/80 text-rose-300 border border-rose-500/50 hover:bg-rose-900 text-[10px] font-mono flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>CLEAR</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-600 font-mono text-[10px] gap-1">
                    <ImageIcon className="w-5 h-5 text-slate-600" />
                    <span>NO COVER ASSET</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* System Architecture & Workflow Blueprint (16:9 Diagram) Section */}
          <div className="p-3.5 rounded-xl bg-[#050811] border border-cyan-500/20 space-y-3">
            <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>System Architecture & Workflow Blueprint (16:9 Diagram)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">JPG, PNG, WebP</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
              <div className="md:col-span-2 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={architectureImageUrl}
                    onChange={(e) => setArchitectureImageUrl(e.target.value)}
                    placeholder="Enter architecture blueprint URL or upload 16:9 diagram..."
                    className="flex-1 px-3.5 py-2 rounded-lg cyber-input font-mono text-xs placeholder:text-slate-600 focus:border-cyan-400"
                  />

                  <input
                    type="file"
                    ref={archFileInputRef}
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleArchFileUpload}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => archFileInputRef.current?.click()}
                    disabled={uploadingArchitecture}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-mono text-xs font-semibold bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/50 hover:border-cyan-400 shadow-neon-cyan transition-all disabled:opacity-50 shrink-0"
                  >
                    {uploadingArchitecture ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>UPLOADING...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>UPLOAD 16:9 BLUEPRINT</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] font-mono text-slate-400">
                  Optional. Upload your 16:9 workflow or architecture diagram (e.g., Agent Pipeline, DB Schema). Renders as a zoomable interactive blueprint inside the public Case Study modal.
                </p>
              </div>

              {/* 16:9 Blueprint Preview Box */}
              <div className="relative rounded-lg overflow-hidden border border-cyan-500/30 bg-[#050811] h-24 flex items-center justify-center group shadow-neon-cyan">
                {architectureImageUrl ? (
                  <>
                    <img
                      src={api.getImageUrl(architectureImageUrl)}
                      alt="Architecture Blueprint Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setArchitectureImageUrl('')}
                        className="p-1 rounded bg-rose-950/80 text-rose-300 border border-rose-500/50 hover:bg-rose-900 text-[10px] font-mono flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>CLEAR BLUEPRINT</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-600 font-mono text-[10px] gap-1">
                    <Layers className="w-5 h-5 text-slate-600" />
                    <span>NO BLUEPRINT UPLOADED</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* URLs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Live Demo / Preview URL (Deployed Web App)
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
                <input
                  type="url"
                  value={liveDemoUrl}
                  onChange={(e) => setLiveDemoUrl(e.target.value)}
                  placeholder="https://your-live-app.onrender.com or https://demo.example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg cyber-input font-mono text-xs placeholder:text-slate-600 focus:border-emerald-400"
                />
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                * Optional. Renders glowing 'LIVE DEMO ↗' button.
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                GitHub Repository URL
              </label>
              <div className="relative">
                <GithubIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/user/repo"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg cyber-input font-mono text-xs placeholder:text-slate-600"
                />
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                * Optional source code repository link.
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <YoutubeIcon className="w-3.5 h-3.5 text-rose-500" />
                <span>YouTube 1-Minute Demo Clip URL</span>
              </label>
              <div className="relative">
                <YoutubeIcon className="w-4 h-4 text-rose-500 absolute left-3 top-3" />
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg cyber-input font-mono text-xs placeholder:text-slate-600 focus:border-rose-400"
                />
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                * Optional. When provided, renders a 'WATCH VIDEO ↗' button on the public portfolio card and case study modal.
              </span>
            </div>
          </div>

          {/* COMMERCIAL MONETIZATION & INQUIRY ROUTING SECTION */}
          <div className="p-4 rounded-xl bg-[#060b18] border border-cyan-500/25 space-y-4 shadow-neon-cyan">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-cyan-400" />
                Commercial Monetization & Purchase Pathways
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Direct Buy & Custom Hire Routing
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pathway 1: Buy Ready-Made Product / Codebase URL */}
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                  <span>Direct Purchase / Checkout URL</span>
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="url"
                    value={purchaseUrl}
                    onChange={(e) => setPurchaseUrl(e.target.value)}
                    placeholder="https://buy.stripe.com/... or Gumroad / LemonSqueezy"
                    className="w-full pl-9 pr-3.5 py-2 rounded-lg cyber-input font-mono text-xs placeholder:text-slate-600 focus:border-amber-400"
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                  * If empty, fallback "Purchase Codebase" inquiry routing will be shown.
                </span>
              </div>

              {/* Pathway 1: Purchase Price */}
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Product / Codebase Price Tag</span>
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="e.g. $49, $199, or Varies"
                    className="w-full pl-9 pr-3.5 py-2 rounded-lg cyber-input font-mono text-xs placeholder:text-slate-600 focus:border-emerald-400"
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                  * Shown alongside the Buy button (e.g. "$49" or "$199").
                </span>
              </div>

              {/* Pathway 2: Allow Custom Hire Toggle */}
              <div className="sm:col-span-2 pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <label className="text-xs font-mono font-semibold text-slate-200 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowCustomHire}
                      onChange={(e) => setAllowCustomHire(e.target.checked)}
                      className="w-4 h-4 rounded bg-[#03060f] border-cyan-500/40 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Enable "Hire for Custom Integration / Custom Features" Button</span>
                  </label>
                  <p className="text-[10px] font-mono text-slate-400 pl-6">
                    Allows prospective clients to jump to the contact form with a pre-filled subject tailored to this project.
                  </p>
                </div>
              </div>

              {/* Pathway 2: Custom Hire Inquiry Subject */}
              {allowCustomHire && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Custom Hire Inquiry Subject (Auto-fill in Contact Form)</span>
                  </label>
                  <input
                    type="text"
                    value={hireCustomSubject}
                    onChange={(e) => setHireCustomSubject(e.target.value)}
                    placeholder={`Custom Integration: ${title || 'This Project'}`}
                    className="w-full px-3.5 py-2 rounded-lg cyber-input font-mono text-xs placeholder:text-slate-600 focus:border-cyan-400"
                  />
                  <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                    * If left blank, automatically defaults to "Custom Integration: {title || 'Project Name'}".
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* SPLIT-SCREEN / TABBED MARKDOWN CASE STUDY EDITOR */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-500/20 pb-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
                  Case Study / Technical Specification (Markdown)
                </label>
                <span className="text-[10px] font-mono text-slate-400">
                  {description.length} chars
                </span>
              </div>

              {/* View Mode & Inserter Toolbar */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Markdown Quick Inserters */}
                <div className="hidden sm:flex items-center gap-1 pr-2 border-r border-slate-800">
                  <button
                    type="button"
                    onClick={() => insertMarkdown('**', '**')}
                    className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
                    title="Bold"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('*', '*')}
                    className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
                    title="Italic"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('### ')}
                    className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
                    title="Heading"
                  >
                    <Heading className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('```\n', '\n```')}
                    className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
                    title="Code Block"
                  >
                    <Code className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('- ')}
                    className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
                    title="Bullet List"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('[', '](https://url)')}
                    className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
                    title="Link"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Mode Selectors */}
                <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={() => setEditorMode('write')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded ${
                      editorMode === 'write'
                        ? 'bg-cyan-500/20 text-cyan-400 font-semibold shadow-neon-cyan'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Code2 className="w-3 h-3" />
                    <span>WRITE</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditorMode('preview')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded ${
                      editorMode === 'preview'
                        ? 'bg-cyan-500/20 text-cyan-400 font-semibold shadow-neon-cyan'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>PREVIEW</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditorMode('split')}
                    className={`hidden md:flex items-center gap-1 px-2.5 py-1 rounded ${
                      editorMode === 'split'
                        ? 'bg-cyan-500/20 text-cyan-400 font-semibold shadow-neon-cyan'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Columns2 className="w-3 h-3" />
                    <span>SPLIT</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Editor Workspace Container */}
            <div className={`grid gap-3 ${editorMode === 'split' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Textarea (Write) */}
              {(editorMode === 'write' || editorMode === 'split') && (
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    rows={8}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detail the problem statement, system architecture, engineering challenges, and benchmark metrics using standard Markdown..."
                    className="w-full h-64 p-3 rounded-lg cyber-input font-mono text-xs leading-relaxed resize-none placeholder:text-slate-600 focus:ring-1 focus:ring-cyan-500"
                  />
                  <span className="absolute bottom-2 right-2 text-[10px] font-mono text-slate-600 pointer-events-none">
                    MARKDOWN
                  </span>
                </div>
              )}

              {/* Rendered Live Preview */}
              {(editorMode === 'preview' || editorMode === 'split') && (
                <div className="h-64 p-3.5 rounded-lg bg-[#050811] border border-cyan-500/20 overflow-y-auto cyber-card">
                  {description.trim() ? (
                    <div className="space-y-2 text-slate-200 font-sans text-xs">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ node, ...props }) => (
                            <h1 className="text-cyan-400 font-mono text-base font-bold border-b border-cyan-500/30 pb-1 mt-2 mb-2" {...props} />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2 className="text-cyan-300 font-mono text-sm font-semibold mt-2.5 mb-1.5" {...props} />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3 className="text-sky-300 font-mono text-xs font-semibold mt-2 mb-1" {...props} />
                          ),
                          p: ({ node, ...props }) => (
                            <p className="text-slate-300 text-xs font-mono leading-relaxed mb-2" {...props} />
                          ),
                          code: ({ node, inline, className, children, ...props }) => {
                            if (inline) {
                              return (
                                <code className="bg-cyan-950/60 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30 font-mono text-[11px]" {...props}>
                                  {children}
                                </code>
                              );
                            }
                            return (
                              <pre className="p-2.5 rounded-lg bg-[#080d1a] border border-cyan-500/30 font-mono text-xs text-cyan-300 overflow-x-auto shadow-neon-cyan my-2">
                                <code {...props}>{children}</code>
                              </pre>
                            );
                          },
                          table: ({ node, ...props }) => (
                            <div className="overflow-x-auto my-2">
                              <table className="w-full text-left font-mono text-xs border border-cyan-500/30 divide-y divide-slate-800" {...props} />
                            </div>
                          ),
                          th: ({ node, ...props }) => (
                            <th className="bg-slate-900/90 text-cyan-400 p-2 font-semibold border-b border-cyan-500/20" {...props} />
                          ),
                          td: ({ node, ...props }) => (
                            <td className="p-2 text-slate-300 border-t border-slate-800/80" {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul className="list-disc list-inside text-xs font-mono text-slate-300 space-y-1 my-1.5 pl-1" {...props} />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol className="list-decimal list-inside text-xs font-mono text-slate-300 space-y-1 my-1.5 pl-1" {...props} />
                          ),
                          blockquote: ({ node, ...props }) => (
                            <blockquote className="border-l-2 border-cyan-400 pl-3 italic text-slate-400 my-2" {...props} />
                          ),
                          a: ({ node, ...props }) => (
                            <a target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-cyan-300" {...props} />
                          ),
                        }}
                      >
                        {description}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-600 font-mono text-xs italic">
                      Live markdown preview will render here...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-cyan-500/20 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg font-mono text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              CANCEL
            </button>

            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="flex items-center gap-2 px-5 py-2 rounded-lg font-mono text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:from-cyan-400 hover:to-blue-500 shadow-neon-cyan transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  SAVING TO CORE...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {project ? 'COMMIT UPDATES' : 'PUBLISH RECORD'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
