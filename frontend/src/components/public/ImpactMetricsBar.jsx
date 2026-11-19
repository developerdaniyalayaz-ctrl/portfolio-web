import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Zap } from 'lucide-react';
import api from '../../services/api';

// Accent color helpers for telemetry numbers and glows
export function getMetricColorClasses(accent) {
  switch (accent?.toLowerCase()) {
    case 'emerald':
    case 'green':
      return {
        text: 'text-emerald-400',
        glow: 'drop-shadow-[0_0_12px_rgba(16,185,129,0.35)]',
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-500/5',
        dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
        badge: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30',
      };
    case 'sky':
    case 'blue':
      return {
        text: 'text-sky-400',
        glow: 'drop-shadow-[0_0_12px_rgba(56,189,248,0.35)]',
        border: 'border-sky-500/30',
        bg: 'bg-sky-500/5',
        dot: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]',
        badge: 'bg-sky-950/40 text-sky-300 border-sky-500/30',
      };
    case 'violet':
    case 'purple':
    case 'indigo':
      return {
        text: 'text-violet-400',
        glow: 'drop-shadow-[0_0_12px_rgba(168,85,247,0.35)]',
        border: 'border-violet-500/30',
        bg: 'bg-violet-500/5',
        dot: 'bg-violet-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]',
        badge: 'bg-violet-950/40 text-violet-300 border-violet-500/30',
      };
    case 'cyan':
    default:
      return {
        text: 'text-cyan-400',
        glow: 'drop-shadow-[0_0_12px_rgba(6,182,212,0.35)]',
        border: 'border-cyan-500/30',
        bg: 'bg-cyan-500/5',
        dot: 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]',
        badge: 'bg-cyan-950/40 text-cyan-300 border-cyan-500/30',
      };
  }
}

export default function ImpactMetricsBar() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchMetrics = async () => {
      try {
        const data = await api.getPublicMetrics();
        if (isMounted) {
          setMetrics(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch (err) {
        console.warn('[ImpactMetrics] Telemetry fetch deferral:', err?.message || err);
        if (isMounted) {
          setMetrics([]);
          setLoading(false);
        }
      }
    };

    fetchMetrics();
    return () => {
      isMounted = false;
    };
  }, []);

  // Zero-Phantom Rule: If no active metrics exist, render nothing (no hardcoded fallback numbers)
  if (loading || !metrics || metrics.length === 0) {
    return null;
  }

  // Calculate dynamic column sizing based on metrics count (up to 4 cols)
  const gridColsClass =
    metrics.length === 1
      ? 'grid-cols-1'
      : metrics.length === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : metrics.length === 3
      ? 'grid-cols-1 sm:grid-cols-3'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6 sm:my-8">
      {/* High-Tech Telemetry Strip Container */}
      <div className="relative rounded-2xl bg-[#060a16]/90 border border-cyan-500/25 backdrop-blur-md shadow-[0_0_35px_rgba(6,182,212,0.08)] overflow-hidden group">
        {/* Subtle Top Cyan Gradient Horizon */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent"></div>

        {/* Header Telemetry Micro-Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2 border-b border-cyan-500/15 bg-[#040711]/70 font-mono text-[10px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold tracking-widest text-cyan-300 uppercase">
              PRODUCTION METRICS & IMPACT TELEMETRY
            </span>
            <span className="hidden sm:inline text-slate-500">//</span>
            <span className="hidden sm:inline text-slate-400">SYSTEM BENCHMARKS</span>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span className="hidden md:flex items-center gap-1 text-[9px] uppercase tracking-wider text-slate-400">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              VERIFIED REAL-TIME
            </span>
            <span className="px-1.5 py-0.5 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 text-[9px]">
              {metrics.length} TELEMETRY NODES
            </span>
          </div>
        </div>

        {/* Telemetry Cells Grid */}
        <div className={`grid ${gridColsClass} divide-y sm:divide-y-0 sm:divide-x divide-slate-800/80`}>
          {metrics.map((metric, idx) => {
            const styles = getMetricColorClasses(metric.accent_color);

            return (
              <div
                key={metric.id || idx}
                className="relative p-5 sm:p-6 transition-all duration-300 hover:bg-slate-900/40 group/cell flex flex-col justify-between"
              >
                {/* Ambient glow accent in cell corner on hover */}
                <div
                  className={`absolute top-0 right-0 w-24 h-24 ${styles.bg} rounded-full blur-2xl opacity-0 group-hover/cell:opacity-100 transition-opacity pointer-events-none`}
                ></div>

                <div>
                  {/* Top cell row with indicator & index */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`}></span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                        NODE 0{idx + 1}
                      </span>
                    </div>

                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-slate-400 border border-slate-800">
                      LIVE
                    </span>
                  </div>

                  {/* Large Monospace KPI Value */}
                  <div
                    className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold font-mono tracking-tight ${styles.text} ${styles.glow} transition-transform duration-300 group-hover/cell:scale-[1.02]`}
                  >
                    {metric.metric_value}
                  </div>

                  {/* Primary Metric Label */}
                  <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-100 mt-2 font-mono leading-snug">
                    {metric.metric_label}
                  </div>
                </div>

                {/* Sub-Context / Project Domain */}
                {metric.sub_context ? (
                  <div className="text-xs font-mono text-slate-400 mt-2 pt-2 border-t border-slate-800/60 line-clamp-2 leading-relaxed">
                    {metric.sub_context}
                  </div>
                ) : (
                  <div className="mt-2 pt-2 border-t border-transparent text-[11px] font-mono text-slate-600">
                    &nbsp;
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
