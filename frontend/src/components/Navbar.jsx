import React, { useState, useEffect } from 'react';
import { Shield, Terminal, LogOut, Cpu, Radio, KeyRound, Globe, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onLogoutClick, onOpenSecurity, onNavigateHome }) {
  const { user } = useAuth();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#080d1a]/90 backdrop-blur-md border-b border-cyan-500/20 px-4 md:px-6 flex items-center justify-between">
      {/* Left: Branding */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-950/40 border border-cyan-500/40 shadow-neon-cyan">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping opacity-75"></span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold tracking-wider text-base md:text-lg bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
              CYBER//PORTFOLIO
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded">
              ADMIN v1.2
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-semibold">CORE SECURED</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400/80 hidden sm:inline">WAL ATOMIC SNAPSHOTS</span>
          </p>
        </div>
      </div>

      {/* Right: Metrics & User Bar */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Switch to Public Site (Opens in New Tab) */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          title="Open Public Portfolio View in New Tab"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-500/40 hover:bg-emerald-900/50 hover:border-emerald-400 transition-all cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">VIEW PUBLIC SITE</span>
        </a>

        {/* Live Cyber Clock */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900/60 border border-slate-700/60 font-mono text-xs text-cyan-300">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>{timeStr || '00:00:00'} UTC</span>
        </div>

        {/* Security / Backup Quick Action Button */}
        <button
          type="button"
          onClick={onOpenSecurity}
          title="Superadmin Security & Backup Controls"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs text-cyan-300 bg-cyan-950/40 border border-cyan-500/40 hover:bg-cyan-900/50 hover:border-cyan-400 shadow-neon-cyan transition-all"
        >
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">SECURITY & BACKUP</span>
        </button>

        {/* User Identity Chip (Clickable to open security modal) */}
        <button
          type="button"
          onClick={onOpenSecurity}
          title="Operator Profile & Credential Management"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 hover:border-cyan-400 hover:shadow-neon-cyan transition-all text-left"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-mono font-bold text-xs text-black shadow-neon-cyan shrink-0">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="font-mono">
            <div className="text-xs font-semibold text-slate-200 truncate max-w-[100px]">
              {user?.username || 'Superadmin'}
            </div>
            <div className="text-[10px] text-cyan-400 uppercase tracking-wider">
              {user?.role || 'Superadmin'}
            </div>
          </div>
        </button>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onLogoutClick}
          title="Terminate Cyber Session"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs text-rose-400 bg-rose-950/20 border border-rose-500/30 hover:bg-rose-900/40 hover:border-rose-400 hover:text-rose-200 hover:shadow-neon-crimson transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">DISCONNECT</span>
        </button>
      </div>
    </header>
  );
}
