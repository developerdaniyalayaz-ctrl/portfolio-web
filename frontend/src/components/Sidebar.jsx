import React from 'react';
import { LayoutDashboard, FolderGit2, Mail, ExternalLink, ShieldCheck, Database, KeyRound, Activity, Share2, Layers, Cpu, Radio, TrendingUp, MessageSquareQuote, Briefcase, Globe } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, unreadInquiriesCount = 0, onOpenSecurity }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Command Center',
      sublabel: 'Overview & Quick Access',
      icon: LayoutDashboard,
    },
    {
      id: 'telemetry',
      label: 'Audience Intel',
      sublabel: 'Live Visitor Telemetry',
      icon: Activity,
    },
    {
      id: 'projects',
      label: 'Projects Repository',
      sublabel: 'Full CRUD & Status',
      icon: FolderGit2,
    },
    {
      id: 'capabilities',
      label: 'Capabilities & Services',
      sublabel: 'Hero Value Propositions',
      icon: Layers,
    },
    {
      id: 'metrics',
      label: 'Impact Metrics',
      sublabel: 'Hero Telemetry Strip',
      icon: TrendingUp,
    },
    {
      id: 'testimonials',
      label: 'Client Testimonials',
      sublabel: 'Verified Reviews & Proof',
      icon: MessageSquareQuote,
    },
    {
      id: 'engagements',
      label: 'Engagement Models',
      sublabel: 'Scope Tiers & How We Work',
      icon: Briefcase,
    },
    {
      id: 'tech-stack',
      label: 'Engineering Stack',
      sublabel: 'Pillars & Skill Modules',
      icon: Cpu,
    },
    {
      id: 'socials',
      label: 'Social & Freelance',
      sublabel: 'Profiles & External Links',
      icon: Share2,
    },
    {
      id: 'contact-matrix',
      label: 'Contact Matrix',
      sublabel: 'Availability & Coordinates',
      icon: Radio,
    },
    {
      id: 'inquiries',
      label: 'Client Inquiries',
      sublabel: 'Messages & Leads',
      icon: Mail,
      badge: unreadInquiriesCount,
    },
  ];

  return (
    <aside className="w-64 bg-[#080d1a]/80 backdrop-blur-md border-r border-cyan-500/20 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Top Nav links */}
      <div className="p-4 space-y-2">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 px-3 py-1 font-semibold">
          SYSTEM MODULES
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200 font-mono ${
                  isActive
                    ? 'bg-cyan-500/15 border border-cyan-500/50 text-cyan-300 shadow-neon-cyan'
                    : 'text-slate-300 hover:bg-slate-800/40 hover:text-cyan-400 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-md ${
                      isActive ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[10px] text-slate-400">{item.sublabel}</div>
                  </div>
                </div>

                {item.badge > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Node Status Widget */}
      <div className="p-4 space-y-3 border-t border-cyan-500/20">
        <div
          onClick={onOpenSecurity}
          className="p-3 rounded-lg bg-[#050811]/90 border border-cyan-500/20 space-y-2 hover:border-cyan-500/50 cursor-pointer transition-colors"
          title="Click to manage security & backups"
        >
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" /> DB Engine
            </span>
            <span className="text-emerald-400 font-bold">SQLite WAL</span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Auth Core
            </span>
            <span className="text-cyan-400 font-bold">JWT / Bcrypt</span>
          </div>

          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 h-full w-[95%] animate-pulse"></div>
          </div>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-md font-mono text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-500/40 hover:bg-emerald-900/50 hover:border-emerald-400 transition-all duration-150"
          title="Open Public Portfolio in New Tab"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span>VIEW PUBLIC SITE</span>
        </a>

        <button
          type="button"
          onClick={onOpenSecurity}
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-md bg-cyan-950/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/30 hover:border-cyan-400 text-xs font-mono transition-all duration-150"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>SECURITY & BACKUPS</span>
        </button>

        <a
          href="/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-md bg-cyan-950/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/30 hover:border-cyan-400 text-xs font-mono transition-all duration-150"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>FASTAPI DOCS (SWAGGER)</span>
        </a>
      </div>
    </aside>
  );
}
