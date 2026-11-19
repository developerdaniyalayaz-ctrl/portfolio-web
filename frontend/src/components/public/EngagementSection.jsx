import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Layers,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import api from '../../services/api';

export function getTierColorClasses(accent, isFeatured) {
  switch (accent?.toLowerCase()) {
    case 'emerald':
    case 'green':
      return {
        cardBorder: isFeatured
          ? 'border-emerald-400/70 shadow-[0_0_35px_rgba(16,185,129,0.15)] bg-[#070e1e]'
          : 'border-emerald-500/30 hover:border-emerald-400/60 bg-[#060a16]/90',
        badge: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
        timeline: 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30',
        check: 'text-emerald-400',
        btn: isFeatured
          ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-bold hover:from-emerald-300 hover:to-cyan-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
          : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/20 hover:border-emerald-400',
        accentBar: 'from-emerald-400 to-cyan-400',
      };
    case 'violet':
    case 'purple':
      return {
        cardBorder: isFeatured
          ? 'border-violet-400/70 shadow-[0_0_35px_rgba(168,85,247,0.15)] bg-[#080a1c]'
          : 'border-violet-500/30 hover:border-violet-400/60 bg-[#060a16]/90',
        badge: 'bg-violet-950/60 text-violet-300 border-violet-500/40',
        timeline: 'bg-violet-950/50 text-violet-300 border-violet-500/30',
        check: 'text-violet-400',
        btn: isFeatured
          ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-bold hover:from-violet-400 hover:to-indigo-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
          : 'bg-violet-500/10 text-violet-300 border border-violet-500/40 hover:bg-violet-500/20 hover:border-violet-400',
        accentBar: 'from-violet-400 to-indigo-400',
      };
    case 'cyan':
    default:
      return {
        cardBorder: isFeatured
          ? 'border-cyan-400/70 shadow-[0_0_35px_rgba(6,182,212,0.15)] bg-[#070d1e]'
          : 'border-cyan-500/30 hover:border-cyan-400/60 bg-[#060a16]/90',
        badge: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40',
        timeline: 'bg-cyan-950/50 text-cyan-300 border-cyan-500/30',
        check: 'text-cyan-400',
        btn: isFeatured
          ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 text-black font-bold hover:from-cyan-300 hover:to-indigo-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
          : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/20 hover:border-cyan-400',
        accentBar: 'from-cyan-400 to-blue-500',
      };
  }
}

export default function EngagementSection() {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchTiers = async () => {
      try {
        const data = await api.getPublicEngagements();
        if (isMounted) {
          setTiers(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch (err) {
        console.warn('[EngagementSection] Data fetch deferral:', err?.message || err);
        if (isMounted) {
          setTiers([]);
          setLoading(false);
        }
      }
    };

    fetchTiers();
    return () => {
      isMounted = false;
    };
  }, []);

  // Zero-Phantom Rule: If no active engagement models exist, render nothing
  if (loading || !tiers || tiers.length === 0) {
    return null;
  }

  const handleSelectScope = (tier) => {
    const subject = tier.inquiry_subject || `Scope Inquiry: ${tier.title} (${tier.timeline})`;

    // Dispatch global event for ContactSection
    window.dispatchEvent(
      new CustomEvent('prefill-inquiry', {
        detail: {
          subject,
          tierTitle: tier.title,
          timeline: tier.timeline,
        },
      })
    );

    // Smooth scroll to contact intake section
    const contactElem = document.getElementById('contact');
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="engagements" className="relative z-20 py-16 sm:py-20 border-t border-cyan-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase font-semibold">
                // EXECUTION PROTOCOLS & DELIVERY TIERS
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-mono font-bold text-white tracking-tight">
              HOW WE WORK // ENGAGEMENT MODELS
            </h2>
            <p className="text-xs sm:text-sm font-mono text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Transparent, sprint-based engineering scopes designed for high-velocity startup MVPs, production web/mobile deployments, and high-concurrency enterprise data automation.
            </p>
          </div>

          <div className="flex items-center gap-2 text-slate-400 font-mono text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>DIRECT SPRINT EXECUTION</span>
            </span>
          </div>
        </div>

        {/* 3-Column Tier Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {tiers.map((tier, idx) => {
            const styles = getTierColorClasses(tier.accent_color, tier.is_featured);

            // Ensure deliverables is an array
            const deliverablesList = Array.isArray(tier.deliverables)
              ? tier.deliverables
              : typeof tier.deliverables === 'string'
              ? (() => {
                  try {
                    const parsed = JSON.parse(tier.deliverables);
                    return Array.isArray(parsed) ? parsed : [tier.deliverables];
                  } catch {
                    return tier.deliverables.split('\n').filter(Boolean);
                  }
                })()
              : [];

            return (
              <div
                key={tier.id || idx}
                className={`relative rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] overflow-hidden border ${styles.cardBorder}`}
              >
                {/* Glowing top line for featured tier */}
                {tier.is_featured && (
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${styles.accentBar}`}></div>
                )}

                <div>
                  {/* Top Bar: Phase Badge + Recommended Pill + Timeline */}
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${styles.badge}`}
                      >
                        {tier.tier_badge}
                      </span>

                      {tier.is_featured && (
                        <span className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-neon-emerald">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>RECOMMENDED</span>
                        </span>
                      )}
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${styles.timeline}`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>{tier.timeline}</span>
                    </span>
                  </div>

                  {/* Title & Summary */}
                  <h3 className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight leading-snug">
                    {tier.title}
                  </h3>

                  <p className="text-xs sm:text-sm font-sans text-slate-300 mt-2.5 leading-relaxed">
                    {tier.summary}
                  </p>

                  {/* Deliverables Checklist */}
                  <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                      CORE DELIVERABLES & ARTIFACTS
                    </span>

                    <ul className="space-y-2.5">
                      {deliverablesList.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2.5 text-xs font-mono text-slate-300 leading-snug">
                          <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${styles.check}`} />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom CTA Action Button */}
                <div className="mt-8 pt-5 border-t border-slate-800/80">
                  <button
                    onClick={() => handleSelectScope(tier)}
                    className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${styles.btn}`}
                    title={`Auto-fill inquiry form for ${tier.title}`}
                  >
                    <span>DISCUSS THIS SCOPE</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-mono text-slate-500 text-center block mt-2">
                    Auto-fills scope into direct inquiry terminal ↓
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
