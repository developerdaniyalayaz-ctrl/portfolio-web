import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Terminal,
  Layers,
  Sparkles,
  Download,
  ExternalLink
} from 'lucide-react';
import { SocialPlatformIcon, CapabilityIcon, getCapabilityAccentStyles } from '../Icons';
import api from '../../services/api';

export default function HeroSection() {
  const [socialLinks, setSocialLinks] = useState([]);
  const [capabilities, setCapabilities] = useState([]);
  const [loadingCapabilities, setLoadingCapabilities] = useState(true);
  const [linksLoaded, setLinksLoaded] = useState(false);

  const scrollTo = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [linksData, capsData] = await Promise.allSettled([
          api.getPublicSocialLinks(),
          api.getPublicCapabilities()
        ]);

        if (isMounted) {
          if (linksData.status === 'fulfilled' && Array.isArray(linksData.value)) {
            const validLinks = linksData.value.filter((item) => item && item.url && item.url.trim() !== '');
            setSocialLinks(validLinks);
            setLinksLoaded(true);
          }
          if (capsData.status === 'fulfilled' && Array.isArray(capsData.value)) {
            setCapabilities(capsData.value);
          } else {
            setCapabilities([]);
          }
        }
      } catch (err) {
        console.warn('Hero section dynamic data fetch deferred:', err);
        if (isMounted) setCapabilities([]);
      } finally {
        if (isMounted) {
          setLoadingCapabilities(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const safeSocialLinks = Array.isArray(socialLinks) ? socialLinks : [];

  return (
    <section id="about" className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background Ambient Glows & Cyber Grids */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-cyber-grid bg-[size:35px_35px] opacity-30 pointer-events-none"></div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        {/* Availability Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#080d1a]/90 border border-emerald-500/40 text-emerald-300 text-xs font-mono shadow-neon-emerald">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="tracking-wider uppercase font-semibold">
            AVAILABLE FOR FREELANCE & ENTERPRISE CONTRACTS
          </span>
        </div>

        {/* Hero Headline */}
        <div className="space-y-4">
          <div className="font-mono text-cyan-400 text-sm tracking-widest uppercase flex items-center justify-center gap-2">
            <Terminal className="w-4 h-4 animate-pulse" />
            <span>SYSTEM ARCHITECT & AI ENGINEER</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-mono font-extrabold tracking-tight text-white leading-tight">
            Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">Daniyal Ayaz</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl font-mono text-slate-300 max-w-3xl mx-auto font-medium">
            <span className="text-cyan-300 font-semibold">Full-Stack Developer</span>
            <span className="text-slate-500 mx-2">•</span>
            <span className="text-blue-300 font-semibold">AI & Python Automation Engineer</span>
            <span className="text-slate-500 mx-2">•</span>
            <span className="text-indigo-300 font-semibold">Data Analyst</span>
          </p>

          <p className="text-xs sm:text-sm md:text-base font-mono text-slate-400 max-w-2xl mx-auto leading-relaxed pt-2">
            Architecting production-grade web applications, multi-agent AI pipelines, automated OCR/audit extraction suites, and high-performance cross-platform mobile architectures with deterministic reliability.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 font-mono text-xs">
          <button
            onClick={() => scrollTo('#projects')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 text-black hover:from-cyan-300 hover:to-blue-500 shadow-neon-cyan transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>EXPLORE DEPLOYMENTS</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => scrollTo('#contact')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-[#090f20]/90 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/40 hover:border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.15)] transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Terminal className="w-4 h-4" />
            <span>INITIATE CONTACT</span>
          </button>
        </div>

        {/* Dynamic Social & Freelance Platform Pills */}
        {safeSocialLinks.length > 0 && (
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            {safeSocialLinks.map((item) => (
              <a
                key={item.id || item.label}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-[#090f20]/90 border border-cyan-500/25 text-slate-300 hover:text-cyan-200 text-xs font-mono hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,240,255,0.28)] transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
                title={`${item.platform || item.label} (Opens in new tab)`}
              >
                <span className="text-cyan-400 group-hover:scale-110 transition-transform">
                  <SocialPlatformIcon iconKey={item.icon_key} className="w-4 h-4" />
                </span>
                <span className="font-semibold tracking-wide">{item.label}</span>
                <ExternalLink className="w-3 h-3 text-cyan-500/70 group-hover:text-cyan-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>
            ))}
          </div>
        )}

        {/* System Highlights Matrix (100% Dynamic Database-Driven: Renders ONLY if active cards exist) */}
        {!loadingCapabilities && Array.isArray(capabilities) && capabilities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-8 max-w-5xl mx-auto font-mono text-left">
            {capabilities.map((card) => {
              const styles = getCapabilityAccentStyles(card.accent_color);
              return (
                <div
                  key={card.id || card.title}
                  className={`p-4 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 ${styles.bg} ${styles.border} ${styles.shadow}`}
                >
                  <div className={`flex items-center gap-1.5 text-xs font-bold font-mono ${styles.text}`}>
                    <CapabilityIcon iconKey={card.icon_key} className="w-3.5 h-3.5" />
                    <span className="tracking-wider">{card.title}</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1.5 leading-relaxed">
                    {card.description}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
