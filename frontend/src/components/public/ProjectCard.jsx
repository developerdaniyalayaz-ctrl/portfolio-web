import React from 'react';
import {
  ExternalLink,
  Play,
  ArrowRight,
  Cpu,
  ShoppingBag,
  Briefcase
} from 'lucide-react';
import { GithubIcon } from '../Icons';
import api from '../../services/api';

// Helper to strip markdown symbols for a clean summary snippet
function stripMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/#+\s+/g, '') // remove headings
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // bold
    .replace(/(\*|_)(.*?)\1/g, '$2') // italic
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/>\s+/g, '') // blockquotes
    .replace(/[-*+]\s+/g, '') // bullet lists
    .replace(/\n+/g, ' ') // newlines
    .trim();
}

export default function ProjectCard({ project, index, onOpenCaseStudy }) {
  if (!project) return null;

  const techList = Array.isArray(project.tech_stack)
    ? project.tech_stack
    : typeof project.tech_stack === 'string'
    ? project.tech_stack.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  const snippet = stripMarkdown(project.description);

  // Commercial Action: Custom Integration Handler
  const handleCustomHireClick = (e) => {
    e.stopPropagation();
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

    const contactElem = document.getElementById('contact');
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Commercial Action: Buy Codebase fallback inquiry when no direct URL
  const handleFallbackBuyInquiry = (e) => {
    e.stopPropagation();
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

    const contactElem = document.getElementById('contact');
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const hasDirectPurchase = Boolean(project.purchase_url?.trim());
  const hasPurchasePrice = Boolean(project.purchase_price?.trim());
  const allowCustomHire = project.allow_custom_hire !== false;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-[#080d1e]/80 border border-cyan-500/25 hover:border-cyan-400/60 transition-all duration-300 overflow-hidden hover:shadow-2xl hover:shadow-cyan-950/40">
      {/* Glowing Top Edge Accent on hover */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Project Media Thumbnail */}
      <div className="relative h-48 w-full overflow-hidden bg-[#03060f] border-b border-cyan-500/20">
        {project.image_url ? (
          <img
            src={api.getImageUrl(project.image_url)}
            alt={project.title}
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#070b1a] to-[#04060f] text-cyan-400/40">
            <Cpu className="w-12 h-12 mb-2 stroke-[1.2]" />
            <span className="text-[11px] font-mono tracking-widest text-slate-500">
              CYBER GRAPHIC NOT STAGED
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#080d1e] via-[#080d1e]/30 to-transparent"></div>

        {/* Category Badge & Priority */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-black/80 backdrop-blur-md text-cyan-300 border border-cyan-500/40 uppercase">
            {project.category}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/70 backdrop-blur-md text-slate-400 border border-slate-700">
            #{String((index ?? 0) + 1).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <h3 className="text-lg font-mono font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-tight">
            {project.title}
          </h3>

          <p className="text-xs font-mono text-slate-400 line-clamp-3 leading-relaxed">
            {snippet || 'Detailed technical case study available inside the system modal reader.'}
          </p>
        </div>

        {/* Tech Stack Pills */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-wrap gap-1.5">
            {techList.slice(0, 4).map((tech, tIdx) => (
              <span
                key={tIdx}
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/40 text-cyan-300 border border-cyan-500/30"
              >
                {tech}
              </span>
            ))}
            {techList.length > 4 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-700">
                +{techList.length - 4}
              </span>
            )}
          </div>

          {/* Card Action Footer */}
          <div className="space-y-3 pt-3 border-t border-cyan-500/15">
            {/* Row 1: Live Demo & Watch Video Pills */}
            {(Boolean((project.live_url || project.live_demo_url)?.trim()) ||
              Boolean(project.youtube_url?.trim())) && (
              <div className="flex flex-wrap items-center gap-2">
                {Boolean((project.live_url || project.live_demo_url)?.trim()) && (
                  <a
                    href={(project.live_url || project.live_demo_url).trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold tracking-wider whitespace-nowrap bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-400 hover:text-white shadow-[0_0_12px_rgba(16,185,129,0.15)] transition-all cursor-pointer"
                    title="Launch Live Application Demo (Opens in new tab)"
                  >
                    <span>LIVE DEMO</span>
                    <ExternalLink className="w-3 h-3 text-emerald-400" />
                  </a>
                )}
                {Boolean(project.youtube_url?.trim()) && (
                  <a
                    href={project.youtube_url.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold tracking-wider whitespace-nowrap bg-sky-500/10 text-sky-300 border border-sky-500/30 hover:bg-sky-500/20 hover:border-sky-400 hover:text-white shadow-[0_0_12px_rgba(56,189,248,0.15)] transition-all cursor-pointer"
                    title="Watch 1-Minute Video Demo (Opens in new tab)"
                  >
                    <Play className="w-3 h-3 text-sky-400 fill-sky-400/30" />
                    <span>WATCH VIDEO</span>
                    <ExternalLink className="w-3 h-3 text-sky-400" />
                  </a>
                )}
              </div>
            )}

            {/* Row 2: Commercial Monetization Pathways (Buy Product / Custom Hire) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {/* Pathway 1: Buy Codebase / Ready Product */}
              {hasDirectPurchase ? (
                <a
                  href={project.purchase_url.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-400 hover:text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.18)] transition-all cursor-pointer group/buy"
                  title="Purchase Ready-Made Product & Source Codebase (Opens checkout)"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">GET CODEBASE</span>
                  </span>
                  {hasPurchasePrice && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-mono shrink-0">
                      {project.purchase_price.trim()}
                    </span>
                  )}
                  <ExternalLink className="w-3 h-3 text-amber-400/70 group-hover/buy:text-amber-300 shrink-0" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleFallbackBuyInquiry}
                  className="flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-400 hover:text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.18)] transition-all cursor-pointer"
                  title="Inquire to purchase codebase license for this project"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">BUY CODEBASE</span>
                  </span>
                  {hasPurchasePrice && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-mono shrink-0">
                      {project.purchase_price.trim()}
                    </span>
                  )}
                </button>
              )}

              {/* Pathway 2: Custom Integration / Hire For Custom Work */}
              {allowCustomHire && (
                <button
                  type="button"
                  onClick={handleCustomHireClick}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-900/60 hover:border-cyan-400 hover:text-white shadow-[0_0_15px_rgba(6,182,212,0.18)] transition-all cursor-pointer"
                  title="Hire for Custom Integration, Feature Extensions, or Tailored Deployment"
                >
                  <Briefcase className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">CUSTOM INTEGRATION</span>
                </button>
              )}
            </div>

            {/* Row 3: Case Study Reader + GitHub Repo */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => onOpenCaseStudy(project)}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-cyan-400 hover:text-cyan-200 group-hover:translate-x-0.5 transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>CASE STUDY</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>

              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 transition-all cursor-pointer shrink-0"
                  title="Source Repository"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
