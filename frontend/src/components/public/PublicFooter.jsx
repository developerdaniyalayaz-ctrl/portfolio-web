import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Cpu, ArrowUp, Send, MessageSquare } from 'lucide-react';
import { SocialPlatformIcon } from '../Icons';
import InteractiveLogo from './InteractiveLogo';
import api from '../../services/api';

export default function PublicFooter() {
  const [socialLinks, setSocialLinks] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function loadSocialLinks() {
      try {
        const data = await api.getPublicSocialLinks();
        if (isMounted && Array.isArray(data)) {
          const valid = data.filter((item) => item.url && item.url.trim() !== '');
          setSocialLinks(valid);
        }
      } catch (err) {
        console.warn('Footer social links load deferred:', err);
      }
    }
    loadSocialLinks();
    return () => {
      isMounted = false;
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToContact = (e) => {
    e.preventDefault();
    const target = document.querySelector('#contact');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative bg-[#02040a] border-t border-cyan-500/20 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden font-mono text-xs">
      {/* Background Accent Grid / Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-cyan-500/10">
          {/* Brand Identity */}
          <InteractiveLogo iconSize="w-9 h-9" />

          {/* System Status Indicators */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-[11px]">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>NODE V2.4 ONLINE</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px]">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>0-LEAK TELEMETRY</span>
            </div>
          </div>
        </div>

        {/* Links and Client Engagement Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-2">
          {/* Col 1: System Telemetry info */}
          <div className="space-y-3">
            <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" /> ARCHITECTURE
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Decoupled cyber-neon web ecosystem powered by FastAPI, SQLite in WAL mode, and React with privacy-first visitor telemetry.
            </p>
          </div>

          {/* Col 2: Navigation Shortcuts */}
          <div className="space-y-3">
            <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
              SECTIONS
            </span>
            <ul className="space-y-2 text-slate-400 text-[11px]">
              <li>
                <a href="#about" className="hover:text-cyan-300 transition-colors">
                  &gt; About & Bio
                </a>
              </li>
              <li>
                <a href="#skills" className="hover:text-cyan-300 transition-colors">
                  &gt; System Capabilities
                </a>
              </li>
              <li>
                <a href="#projects" className="hover:text-cyan-300 transition-colors">
                  &gt; Featured Inventories
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-cyan-300 transition-colors">
                  &gt; Direct Telemetry Intake
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Dynamic Social & Professional Links */}
          <div className="space-y-3">
            <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
              PROFILES & REPOSITORIES
            </span>
            <ul className="space-y-2 text-slate-400 text-[11px]">
              {socialLinks.map((item) => (
                <li key={item.id || item.label}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-cyan-300 transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="text-cyan-400 group-hover:scale-110 transition-transform">
                      <SocialPlatformIcon iconKey={item.icon_key} className="w-3.5 h-3.5" />
                    </span>
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Direct Client Intake / Engagement */}
          <div className="space-y-3">
            <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" /> ENGAGEMENT
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Available for bespoke AI pipeline engineering, cross-platform mobile development, and full-stack systems.
            </p>
            <a
              href="#contact"
              onClick={handleScrollToContact}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/50 hover:border-cyan-400 transition-all text-xs cursor-pointer"
            >
              <Send className="w-3 h-3 text-cyan-400" />
              <span>TRANSMIT SPECIFICATION</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Scroll to Top */}
        <div className="pt-8 border-t border-cyan-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} Daniyal Ayaz. All rights reserved. Zero external tracking pixels.
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            <span>RETURN TO SUMMIT</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
