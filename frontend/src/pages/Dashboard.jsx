import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  CheckCircle2,
  FileCode,
  Mail,
  Plus,
  ArrowUpRight,
  RefreshCw,
  ExternalLink,
  Tag,
  Clock,
  Sparkles,
  Layers,
  Send,
  Download,
  Shield
} from 'lucide-react';
import { GithubIcon } from '../components/Icons';
import StatsCard from '../components/StatsCard';
import api from '../services/api';

export default function Dashboard({
  onNavigateProjects,
  onNavigateInquiries,
  onOpenCreateProject,
  onOpenEditProject,
  onOpenInquiry,
  onOpenSecurity,
}) {
  const [stats, setStats] = useState({
    total_projects: 0,
    published_projects: 0,
    draft_projects: 0,
    total_inquiries: 0,
    unread_inquiries: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingBackup, setDownloadingBackup] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const loadDashboardData = async () => {
    try {
      const [statsData, projectsData, inquiriesData] = await Promise.all([
        api.getStats(),
        api.getProjects(),
        api.getInquiries(),
      ]);
      setStats(statsData);
      setRecentProjects(projectsData.slice(0, 4));
      setRecentInquiries(inquiriesData.slice(0, 4));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleQuickDownloadBackup = async () => {
    setDownloadingBackup(true);
    try {
      const data = await api.createBackupSnapshot();
      const filename = data.filename || 'portfolio_snapshot.db.gz';
      const downloadUrl = data.download_url || `/api/admin/backups/${filename}/download`;

      // Show crisp success toast
      showToast(`Snapshot created: ${filename}`);

      // Trigger file download cleanly without in-flight fetch interception
      api.triggerFileDownload(downloadUrl, filename);
    } catch (err) {
      showToast(`Backup failed: ${err.message}`);
    } finally {
      setDownloadingBackup(false);
    }
  };

  const handleQuickToggle = async (e, projectId) => {
    e.stopPropagation();
    try {
      await api.toggleProjectStatus(projectId);
      loadDashboardData();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-cyan-500/20">
        <div>
          <h1 className="text-2xl font-mono font-bold tracking-wide text-slate-100 flex items-center gap-2">
            TELEMETRY & CONTENT OVERVIEW
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Real-time control matrix for portfolio projects, live deployments, and client leads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleQuickDownloadBackup}
            disabled={downloadingBackup}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-mono text-xs text-cyan-300 bg-cyan-950/40 border border-cyan-500/40 hover:bg-cyan-900/50 hover:border-cyan-400 shadow-neon-cyan transition-all"
            title="Download Live Atomic SQLite Database Snapshot (.db.gz)"
          >
            {downloadingBackup ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            ) : (
              <Download className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span className="hidden sm:inline">SNAPSHOT DB</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg font-mono text-xs text-slate-300 bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 hover:text-cyan-300 transition-all duration-150"
            title="Refresh All Records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>SYNC</span>
          </button>

          <button
            onClick={onOpenCreateProject}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-semibold bg-gradient-to-r from-cyan-400 to-blue-600 text-black hover:from-cyan-300 hover:to-blue-500 shadow-neon-cyan transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>NEW PROJECT</span>
          </button>
        </div>
      </div>

      {/* Top 4 Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Projects"
          value={stats.total_projects}
          subtitle="All repository records"
          icon={FolderGit2}
          variant="cyan"
          onClick={onNavigateProjects}
        />
        <StatsCard
          title="Published (Live)"
          value={stats.published_projects}
          subtitle="Visible to public visitors"
          icon={CheckCircle2}
          variant="emerald"
          onClick={onNavigateProjects}
        />
        <StatsCard
          title="Draft / Inactive"
          value={stats.draft_projects}
          subtitle="Internal or WIP"
          icon={FileCode}
          variant="blue"
          onClick={onNavigateProjects}
        />
        <StatsCard
          title="Client Inquiries"
          value={stats.total_inquiries}
          subtitle={`${stats.unread_inquiries} unread message(s)`}
          icon={Mail}
          variant={stats.unread_inquiries > 0 ? 'crimson' : 'cyan'}
          onClick={onNavigateInquiries}
        />
      </div>

      {/* Main Grid: Recent Projects & Inquiries Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-mono font-bold tracking-wider text-slate-200 uppercase">
                Featured Projects
              </h2>
            </div>
            <button
              onClick={onNavigateProjects}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <span>VIEW ALL ({stats.total_projects})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentProjects.length === 0 ? (
              <div className="cyber-card p-8 text-center rounded-xl font-mono text-xs text-slate-500">
                NO PROJECTS REGISTERED YET. INITIALIZE YOUR FIRST ENTRY.
              </div>
            ) : (
              recentProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => onOpenEditProject(project)}
                  className="cyber-card p-4 rounded-xl border border-cyan-500/20 hover:border-cyan-500/50 cursor-pointer group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 max-w-xl">
                      {project.image_url ? (
                        <img
                          src={api.getImageUrl(project.image_url)}
                          alt=""
                          className="w-12 h-12 object-cover rounded-lg border border-cyan-500/30 shrink-0 mt-0.5"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : null}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                            {project.title}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-500/30">
                            {project.category}
                          </span>
                        </div>

                        <p className="text-xs font-mono text-slate-400 line-clamp-1">
                          {project.description?.replace(/#{1,6}\s?/g, '').replace(/```[\s\S]*?```/g, '[Code]') || 'No case study recorded.'}
                        </p>

                        {/* Tech stack tags */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {project.tech_stack
                            ?.split(',')
                            .slice(0, 4)
                            .map((t, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700/60"
                              >
                                {t.trim()}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions and Status */}
                    <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0">
                      <button
                        onClick={(e) => handleQuickToggle(e, project.id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition-all ${
                          project.is_published
                            ? 'bg-emerald-950/30 border border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-800 border border-slate-700 text-slate-400'
                        }`}
                      >
                        {project.is_published ? '● LIVE' : '○ DRAFT'}
                      </button>

                      <div className="flex items-center gap-1.5 text-slate-400">
                        {project.live_demo_url && (
                          <a
                            href={project.live_demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded hover:bg-slate-800 hover:text-cyan-400"
                            title="Live Demo"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {project.github_url && (
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded hover:bg-slate-800 hover:text-cyan-400"
                            title="GitHub Source"
                          >
                            <GithubIcon className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Inquiries (1 Col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-mono font-bold tracking-wider text-slate-200 uppercase">
                Client Messages
              </h2>
            </div>
            <button
              onClick={onNavigateInquiries}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <span>INBOX ({stats.total_inquiries})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentInquiries.length === 0 ? (
              <div className="cyber-card p-6 text-center rounded-xl font-mono text-xs text-slate-500">
                NO INCOMING CLIENT INQUIRIES REGISTERED.
              </div>
            ) : (
              recentInquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  onClick={() => onOpenInquiry(inquiry)}
                  className={`cyber-card p-3.5 rounded-xl border cursor-pointer transition-all ${
                    inquiry.is_read
                      ? 'border-slate-800/80 bg-[#080d1a]/50'
                      : 'border-cyan-500/40 bg-[#0a0f24]/90 shadow-neon-cyan'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {inquiry.name}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        inquiry.is_read
                          ? 'bg-slate-800 text-slate-500'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {inquiry.is_read ? 'PROCESSED' : 'NEW'}
                    </span>
                  </div>

                  <p className="text-[11px] font-mono text-cyan-300/80 mb-1">
                    {inquiry.subject || 'Portfolio Inquiry'}
                  </p>

                  <p className="text-xs font-mono text-slate-400 line-clamp-2 leading-relaxed">
                    {inquiry.message}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>{inquiry.email}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(inquiry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

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
