import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  ExternalLink,
  Code2,
  Sparkles,
  Layers,
  ArrowRight,
  Filter,
  Terminal,
  Cpu,
  Play
} from 'lucide-react';
import { GithubIcon, YoutubeIcon } from '../Icons';
import api from '../../services/api';
import CaseStudyModal from './CaseStudyModal';
import ProjectCard from './ProjectCard';

const CATEGORY_TABS = [
  { id: 'ALL', label: 'ALL SYSTEMS' },
  { id: 'AI/ML', label: 'AI / ML' },
  { id: 'AUTOMATION', label: 'AUTOMATION' },
  { id: 'MOBILE', label: 'MOBILE' },
  { id: 'WEB APP', label: 'WEB APP' }
];

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

export default function ProjectsShowcase() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [selectedCaseStudy, setSelectedCaseStudy] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadProjects() {
      try {
        setLoading(true);
        const data = await api.getPublishedProjects();
        if (isMounted) {
          setProjects(data || []);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load published projects:', err);
        if (isMounted) {
          setError('Failed to query public project telemetry from node cluster.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadProjects();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter projects according to category tab
  const filteredProjects = projects.filter((project) => {
    if (activeCategory === 'ALL') return true;
    const cat = (project.category || '').toUpperCase().replace(/\s+/g, '');
    const target = activeCategory.toUpperCase().replace(/\s+/g, '');
    return cat.includes(target) || target.includes(cat);
  });

  return (
    <section id="projects" className="relative py-24 px-4 sm:px-6 lg:px-8 border-b border-cyan-500/20 bg-[#040711]">
      {/* Background Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-cyan-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>// DEPLOYED INVENTORIES & PROTOTYPES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-mono font-bold text-white tracking-tight">
              Featured <span className="text-cyan-400">Engineering Systems</span>
            </h2>
            <p className="text-sm font-mono text-slate-400 max-w-2xl leading-relaxed">
              End-to-end production architectures spanning AI copilots, machine vision quality inspection suites, and native cross-platform legal engines.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-[#080d1e] border border-cyan-500/20">
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold shadow-neon-cyan'
                      : 'text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/30'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-mono text-cyan-400 tracking-wider animate-pulse">
              STREAMING CLUSTER PROJECTS...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-6 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300 font-mono text-xs text-center space-y-2">
            <p>{error}</p>
            <p className="text-slate-400">Please verify backend persistence status at localhost:8000.</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProjects.length === 0 && (
          <div className="p-12 rounded-2xl bg-[#080d1e]/50 border border-cyan-500/20 text-center space-y-3 font-mono">
            <Terminal className="w-8 h-8 text-cyan-400 mx-auto opacity-60" />
            <p className="text-sm text-slate-300 font-semibold">NO NODES MATCH THE APPLIED CRITERIA</p>
            <p className="text-xs text-slate-500">
              Clear your category filters or check back shortly for new project deployments.
            </p>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && !error && filteredProjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                onOpenCaseStudy={setSelectedCaseStudy}
              />
            ))}
          </div>
        )}
      </div>

      {/* Case Study Full Reader Modal */}
      <CaseStudyModal
        project={selectedCaseStudy}
        isOpen={Boolean(selectedCaseStudy)}
        onClose={() => setSelectedCaseStudy(null)}
      />
    </section>
  );
}
