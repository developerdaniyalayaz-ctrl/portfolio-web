import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle2 } from 'lucide-react';
import { StackCategoryIcon, getStackCategoryAccentStyles } from '../Icons';
import api from '../../services/api';

export default function TechStackSection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadStack() {
      try {
        const data = await api.getPublicTechStack();
        if (isMounted) {
          if (Array.isArray(data)) {
            setCategories(data);
          } else {
            setCategories([]);
          }
        }
      } catch (err) {
        console.warn('Tech stack dynamic fetch deferred:', err);
        if (isMounted) setCategories([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadStack();
    return () => {
      isMounted = false;
    };
  }, []);

  // Strict 100% database-driven truth: if no active categories exist, render nothing
  if (!loading && (!Array.isArray(categories) || categories.length === 0)) {
    return null;
  }

  return (
    <section id="stack" className="relative py-20 bg-[#050811]/60 border-t border-cyan-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
            <Cpu className="w-3.5 h-3.5 animate-pulse" />
            <span>CORE ARSENAL & CAPABILITIES</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-mono font-bold text-white tracking-tight">
            ENGINEERING STACK & PROTOCOLS
          </h2>

          <p className="text-xs sm:text-sm font-mono text-slate-400 max-w-2xl mx-auto">
            Battle-tested frameworks, database engines, and AI orchestration tooling leveraged to deploy robust enterprise systems.
          </p>
        </div>

        {/* Dynamic Pillar Grids */}
        {categories.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono">
            {categories.map((cat) => {
              const styles = getStackCategoryAccentStyles(cat.accent_color);
              const items = Array.isArray(cat.items) ? cat.items : [];

              return (
                <div
                  key={cat.id || cat.title}
                  className={`group cyber-card p-6 rounded-2xl border ${styles.borderColor} ${styles.glow} transition-all duration-300 flex flex-col justify-between`}
                >
                  <div className="space-y-4">
                    {/* Category Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-100 tracking-wider">
                          {cat.title}
                        </h3>
                        {cat.subtitle && (
                          <p className="text-[11px] text-slate-400 mt-1">
                            {cat.subtitle}
                          </p>
                        )}
                      </div>

                      <div className={`p-2.5 rounded-xl ${styles.accentBg}`}>
                        <StackCategoryIcon iconKey={cat.icon_key} className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Skills Grid */}
                    {items.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 pt-2">
                        {items.map((skill) => (
                          <div
                            key={skill.id || skill.name}
                            className="p-2.5 rounded-lg bg-[#050811]/90 border border-slate-800/80 hover:border-cyan-500/30 transition-all flex items-center justify-between group/item"
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className={`w-3.5 h-3.5 ${styles.checkColor} shrink-0`} />
                              <span className={`text-xs font-semibold text-slate-200 ${styles.hoverText} transition-colors`}>
                                {skill.name}
                              </span>
                            </div>
                            {skill.detail && (
                              <span className="text-[10px] text-slate-500 hidden sm:inline ml-2 text-right">
                                {skill.detail}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Status Marker */}
                  <div className="mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${styles.dotColor}`}></span>
                      PRODUCTION VERIFIED
                    </span>
                    <span className={`${styles.text} font-semibold`}>
                      {items.length} MODULES
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
