import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  X,
  ExternalLink,
  Tag,
  Calendar,
  Cpu,
  Sparkles,
  Play,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Layers,
  ShoppingBag,
  Briefcase,
  DollarSign
} from 'lucide-react';
import { GithubIcon, YoutubeIcon } from '../Icons';
import api from '../../services/api';

export default function CaseStudyModal({ project, isOpen, onClose }) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);

  // Reset zoom states whenever modal or project changes
  useEffect(() => {
    setZoomLevel(1);
    setIsLightboxOpen(false);
    setLightboxZoom(1);
  }, [project, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isLightboxOpen) {
          setIsLightboxOpen(false);
          setLightboxZoom(1);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose, isLightboxOpen]);

  if (!isOpen || !project) return null;

  // Normalize tech stack whether string or array
  const techStackList = Array.isArray(project.tech_stack)
    ? project.tech_stack
    : typeof project.tech_stack === 'string'
    ? project.tech_stack.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  // Commercial Action: Custom Integration Handler
  const handleCustomHireClick = () => {
    const subject =
      project.hire_custom_subject?.trim() || `Custom Integration: ${project.title}`;

    window.dispatchEvent(
      new CustomEvent('prefill-inquiry', {
        detail: {
          subject,
          projectTitle: project.title,
        },
      })
    );

    onClose();
    setTimeout(() => {
      const contactElem = document.getElementById('contact');
      if (contactElem) {
        contactElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  // Commercial Action: Buy Codebase fallback inquiry when no direct URL
  const handleFallbackBuyInquiry = () => {
    const priceTag = project.purchase_price?.trim() ? ` (${project.purchase_price.trim()})` : '';
    const subject = `Purchase Codebase Inquiry: ${project.title}${priceTag}`;

    window.dispatchEvent(
      new CustomEvent('prefill-inquiry', {
        detail: {
          subject,
          projectTitle: project.title,
        },
      })
    );

    onClose();
    setTimeout(() => {
      const contactElem = document.getElementById('contact');
      if (contactElem) {
        contactElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md transition-all duration-300">
      {/* Backdrop overlay */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      {/* Main Modal Card */}
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-[#070b16] border border-cyan-500/40 shadow-2xl shadow-cyan-950/60 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Glow Accent Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500"></div>

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-cyan-500/20 bg-[#080d1e]/90 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 tracking-wider uppercase">
                {project.category || 'CASE STUDY'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                SYSTEM SPECIFICATION
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight leading-snug">
              {project.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/50 hover:bg-cyan-950/30 transition-all"
            title="Close Case Study (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-6 flex-1 text-slate-300 font-mono">
          {/* Optional Project Hero Image */}
          {project.image_url && (
            <div className="relative rounded-xl overflow-hidden border border-cyan-500/30 bg-[#050811] shadow-lg max-h-80">
              <img
                src={api.getImageUrl(project.image_url)}
                alt={project.title}
                className="w-full h-full object-cover object-center max-h-80"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070b16] via-transparent to-transparent opacity-60"></div>
            </div>
          )}

          {/* Action Links & Tech Stack Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0a1024]/70 border border-cyan-500/20">
            {/* Tech stack badges */}
            <div className="flex flex-wrap items-center gap-1.5 flex-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mr-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-cyan-400" /> STACK:
              </span>
              {techStackList.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950/40 text-cyan-300 border border-cyan-500/30"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* External repository, live preview & YouTube demo buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-slate-900 border border-slate-700 text-slate-200 hover:text-cyan-300 hover:border-cyan-400 transition-all cursor-pointer"
                >
                  <GithubIcon className="w-4 h-4 text-cyan-400" />
                  <span>REPOSITORY</span>
                </a>
              )}

              {Boolean(project.youtube_url?.trim()) && (
                <a
                  href={project.youtube_url.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-sky-500/10 border border-sky-500/40 text-sky-300 hover:bg-sky-500/20 hover:border-sky-400 hover:text-white shadow-[0_0_15px_rgba(56,189,248,0.25)] transition-all cursor-pointer whitespace-nowrap"
                  title="Watch Project Video Demo (Opens in new tab)"
                >
                  <Play className="w-3.5 h-3.5 text-sky-400 fill-sky-400/40" />
                  <span>WATCH VIDEO</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {Boolean((project.live_url || project.live_demo_url)?.trim()) && (
                <a
                  href={(project.live_url || project.live_demo_url).trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-mono font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 text-black hover:from-emerald-300 hover:to-cyan-300 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all cursor-pointer"
                  title="Launch Live Application Preview (Opens in new tab)"
                >
                  <span>LAUNCH LIVE PREVIEW</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* High-Converting Commercial Pathways Banner: Buy Ready-Made Codebase & Custom Integration */}
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-[#070e24] via-[#091533] to-[#070e24] border border-cyan-500/35 shadow-[0_0_30px_rgba(6,182,212,0.12)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-500/20 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  COMMERCIAL ACQUISITION & INTEGRATION OPTIONS
                </span>
              </div>
              <span className="text-[11px] font-mono text-cyan-300">
                Production-Ready IP & Dedicated Engineering
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pathway 1: Buy Ready-Made System / Codebase */}
              <div className="p-3.5 rounded-lg bg-[#040817]/90 border border-amber-500/30 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                      READY-MADE CODEBASE LICENSE
                    </span>
                    {project.purchase_price?.trim() ? (
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-400/20 border border-amber-400/40 text-amber-300">
                        {project.purchase_price.trim()}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                        INQUIRE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 leading-relaxed">
                    Instant access to complete source repository, architecture blueprint, Docker config, and commercial deployment rights.
                  </p>
                </div>

                {project.purchase_url?.trim() ? (
                  <a
                    href={project.purchase_url.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg font-mono text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-300 hover:to-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all cursor-pointer"
                  >
                    <span>PURCHASE CODEBASE LICENSE</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={handleFallbackBuyInquiry}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg font-mono text-xs font-bold bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 hover:border-amber-400 transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>INQUIRE TO PURCHASE CODEBASE</span>
                  </button>
                )}
              </div>

              {/* Pathway 2: Custom Integration & Tailored Features */}
              {project.allow_custom_hire !== false && (
                <div className="p-3.5 rounded-lg bg-[#040817]/90 border border-cyan-500/30 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                        CUSTOM INTEGRATION & EXTENSION
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 uppercase">
                        HIRE LEAD DEV
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 leading-relaxed">
                      Need this system customized for your business stack, existing APIs, or custom workflows? Hire me for dedicated integration.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCustomHireClick}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg font-mono text-xs font-bold bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all cursor-pointer"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-cyan-200" />
                    <span>HIRE FOR CUSTOM INTEGRATION</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Zoomable System Architecture & Workflow Blueprint */}
          {Boolean(project.architecture_image_url?.trim()) && (
            <div className="space-y-3 p-4 sm:p-5 rounded-xl bg-[#060a16] border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.08)]">
              {/* Blueprint Header with Controls */}
              <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-cyan-500/20 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-cyan-300 uppercase tracking-wider">
                    SYSTEM ARCHITECTURE & WORKFLOW BLUEPRINT
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-[#050811] p-1 rounded-lg border border-slate-800">
                  <span className="px-2 py-0.5 text-[10px] text-cyan-400 font-bold min-w-[42px] text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(1, +(z - 0.25).toFixed(2)))}
                    disabled={zoomLevel <= 1}
                    className="p-1 rounded text-slate-400 hover:text-cyan-300 disabled:opacity-30 transition-colors"
                    title="Zoom Out (-)"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(2.5, +(z + 0.25).toFixed(2)))}
                    disabled={zoomLevel >= 2.5}
                    className="p-1 rounded text-slate-400 hover:text-cyan-300 disabled:opacity-30 transition-colors"
                    title="Zoom In (+)"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    disabled={zoomLevel === 1}
                    className="p-1 rounded text-slate-400 hover:text-cyan-300 disabled:opacity-30 transition-colors"
                    title="Reset (1:1)"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      setLightboxZoom(1.25);
                      setIsLightboxOpen(true);
                    }}
                    className="p-1 rounded text-cyan-400 hover:text-white hover:bg-cyan-950/60 transition-colors"
                    title="Fullscreen Lightbox"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Blueprint Image Viewport */}
              <div
                className="relative rounded-lg overflow-auto border border-cyan-500/20 bg-[#03060f] max-h-96 flex items-center justify-center cursor-zoom-in"
                onClick={() => setZoomLevel((z) => (z === 1 ? 1.75 : 1))}
                title="Click diagram to toggle zoom, or use header controls"
              >
                <img
                  src={api.getImageUrl(project.architecture_image_url.trim())}
                  alt="System Architecture Blueprint"
                  className="w-full h-auto object-contain transition-transform duration-300 origin-center"
                  style={{ transform: `scale(${zoomLevel})` }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                <span>* Click diagram to toggle zoom or click fullscreen icon for high-res inspection</span>
                <span>16:9 ARCHITECTURE MATRIX</span>
              </div>
            </div>
          )}

          {/* Rendered Markdown Case Study Specification */}
          <div className="case-study-content space-y-4 pt-2">
            {project.description ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 className="text-xl sm:text-2xl font-mono font-bold text-cyan-300 border-b border-cyan-500/30 pb-2 mt-6 mb-3 flex items-center gap-2" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-lg sm:text-xl font-mono font-bold text-cyan-400 border-l-2 border-cyan-400 pl-3 mt-6 mb-3" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-base font-mono font-semibold text-sky-300 mt-4 mb-2 flex items-center gap-1.5" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="text-sm font-mono text-slate-300 leading-relaxed mb-3.5" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc list-inside space-y-1.5 mb-4 pl-2 text-sm text-slate-300 marker:text-cyan-400" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal list-inside space-y-1.5 mb-4 pl-2 text-sm text-slate-300 marker:text-cyan-400" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="leading-relaxed" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-2 border-cyan-500 bg-cyan-950/20 px-4 py-2.5 rounded-r my-4 text-xs italic text-cyan-200" {...props} />
                  ),
                  pre: ({ node, ...props }) => (
                    <pre className="p-4 rounded-xl bg-[#03060f] border border-cyan-500/30 text-cyan-300 text-xs overflow-x-auto my-4 font-mono shadow-inner leading-relaxed" {...props} />
                  ),
                  code: ({ node, inline, ...props }) =>
                    inline ? (
                      <code className="px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono text-xs" {...props} />
                    ) : (
                      <code className="font-mono text-xs text-cyan-300" {...props} />
                    ),
                  a: ({ node, ...props }) => (
                    <a className="text-cyan-400 underline underline-offset-4 hover:text-cyan-300 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
                  ),
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-4 border border-cyan-500/30 rounded-lg">
                      <table className="w-full text-xs text-left border-collapse" {...props} />
                    </div>
                  ),
                  th: ({ node, ...props }) => (
                    <th className="p-2.5 bg-cyan-950/50 border-b border-cyan-500/30 font-mono text-cyan-300 font-semibold uppercase" {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="p-2.5 border-b border-cyan-500/20 font-mono text-slate-300" {...props} />
                  ),
                  hr: ({ node, ...props }) => (
                    <hr className="border-cyan-500/20 my-6" {...props} />
                  )
                }}
              >
                {project.description}
              </ReactMarkdown>
            ) : (
              <p className="text-slate-400 text-sm italic">
                No detailed technical specification currently filed for this node.
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-cyan-500/20 bg-[#080d1e]/90 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            NODE PERSISTENCE ID: #{project.id}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500 hover:text-black font-semibold transition-all duration-200"
          >
            DISMISS SPECIFICATION
          </button>
        </div>
      </div>

      {/* Fullscreen High-Resolution Lightbox Modal */}
      {isLightboxOpen && Boolean(project.architecture_image_url?.trim()) && (
        <div className="fixed inset-0 z-[70] bg-slate-950/95 backdrop-blur-xl flex flex-col p-4 sm:p-6 animate-in fade-in duration-200 select-none">
          {/* Lightbox Header Bar */}
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-cyan-500/30 text-xs font-mono">
            <div className="flex items-center gap-2 flex-wrap">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white uppercase tracking-wider">
                SYSTEM ARCHITECTURE // FULLSCREEN BLUEPRINT
              </span>
              <span className="text-slate-500">//</span>
              <span className="text-slate-400 truncate max-w-xs">{project.title}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#050811] px-2 py-1 rounded-lg border border-slate-800">
                <span className="text-[10px] text-cyan-400 font-bold min-w-[42px] text-center">
                  {Math.round(lightboxZoom * 100)}%
                </span>
                <button
                  onClick={() => setLightboxZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))}
                  disabled={lightboxZoom <= 1}
                  className="p-1 rounded text-slate-400 hover:text-cyan-300 disabled:opacity-30 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLightboxZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
                  disabled={lightboxZoom >= 3}
                  className="p-1 rounded text-slate-400 hover:text-cyan-300 disabled:opacity-30 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLightboxZoom(1)}
                  disabled={lightboxZoom === 1}
                  className="p-1 rounded text-slate-400 hover:text-cyan-300 disabled:opacity-30 transition-colors"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => {
                  setIsLightboxOpen(false);
                  setLightboxZoom(1);
                }}
                className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:border-cyan-400 transition-colors cursor-pointer"
                title="Close Fullscreen (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Scrollable/Pan Viewport */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            <img
              src={api.getImageUrl(project.architecture_image_url.trim())}
              alt="System Architecture High-Resolution Blueprint"
              className="max-w-none max-h-none object-contain transition-transform duration-200 cursor-grab active:cursor-grabbing"
              style={{ transform: `scale(${lightboxZoom})` }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
