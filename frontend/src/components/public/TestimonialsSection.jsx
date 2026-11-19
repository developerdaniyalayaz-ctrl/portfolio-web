import React, { useState, useEffect } from 'react';
import { Star, Quote, CheckCircle2, ShieldCheck, FolderGit2 } from 'lucide-react';
import api from '../../services/api';

export function getBadgeColorClasses(badgeColor) {
  switch (badgeColor?.toLowerCase()) {
    case 'emerald':
    case 'green':
      return {
        pill: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
        dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
      };
    case 'cyan':
      return {
        pill: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.15)]',
        dot: 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]',
      };
    case 'sky':
    case 'blue':
      return {
        pill: 'bg-sky-950/60 text-sky-300 border-sky-500/40 shadow-[0_0_10px_rgba(56,189,248,0.15)]',
        dot: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]',
      };
    case 'violet':
    case 'purple':
      return {
        pill: 'bg-violet-950/60 text-violet-300 border-violet-500/40 shadow-[0_0_10px_rgba(168,85,247,0.15)]',
        dot: 'bg-violet-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]',
      };
    default:
      return {
        pill: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
        dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
      };
  }
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchReviews = async () => {
      try {
        const data = await api.getPublicTestimonials();
        if (isMounted) {
          setTestimonials(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch (err) {
        console.warn('[Testimonials] Public reviews fetch deferral:', err?.message || err);
        if (isMounted) {
          setTestimonials([]);
          setLoading(false);
        }
      }
    };

    fetchReviews();
    return () => {
      isMounted = false;
    };
  }, []);

  // Zero-Phantom Rule: If no active reviews exist, render nothing (no hardcoded fallback cards)
  if (loading || !testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section id="testimonials" className="relative z-20 py-16 sm:py-20 border-t border-cyan-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase font-semibold">
                // VERIFIED CLIENT TELEMETRY
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-mono font-bold text-white tracking-tight">
              CLIENT ENDORSEMENTS & REVIEWS
            </h2>
            <p className="text-xs sm:text-sm font-mono text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Direct feedback and verified evaluations from production deployments, enterprise workflow automation, and freelance engineering contracts.
            </p>
          </div>

          <div className="flex items-center gap-2 text-slate-400 font-mono text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% VERIFIED ENGAGEMENTS</span>
            </span>
          </div>
        </div>

        {/* Testimonials 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((review, index) => {
            const ratingScore = Math.max(1, Math.min(5, review.rating || 5));
            const colorStyles = getBadgeColorClasses(review.badge_color);

            return (
              <div
                key={review.id || index}
                className="group relative rounded-xl bg-slate-950/75 border border-slate-800/90 hover:border-cyan-500/40 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-950/30 overflow-hidden"
              >
                {/* Glowing top line on hover */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div>
                  {/* Top Row: Star Rating + Platform Badge */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                    {/* Stars */}
                    <div className="flex items-center gap-1" title={`${ratingScore} / 5 Stars`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= ratingScore
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-700 fill-slate-800'
                          }`}
                        />
                      ))}
                      <span className="text-[11px] font-mono font-bold text-amber-300 ml-1">
                        {ratingScore}.0
                      </span>
                    </div>

                    {/* Platform Badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border uppercase tracking-wider whitespace-nowrap ${colorStyles.pill}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${colorStyles.dot}`}></span>
                      <span>{review.platform_badge || 'Enterprise Client'}</span>
                    </span>
                  </div>

                  {/* Testimonial Quote Body */}
                  <div className="relative my-4">
                    <Quote className="w-5 h-5 text-cyan-500/20 mb-2 rotate-180" />
                    <p className="text-slate-300 text-sm font-sans leading-relaxed italic">
                      "{review.review_text}"
                    </p>
                  </div>
                </div>

                {/* Footer: Client Info & Project Tag */}
                <div className="pt-4 border-t border-slate-800/80 space-y-2">
                  <div>
                    <h4 className="text-sm font-mono font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {review.client_name}
                    </h4>
                    {review.client_role && (
                      <p className="text-xs font-mono text-slate-400 mt-0.5">
                        {review.client_role}
                      </p>
                    )}
                  </div>

                  {/* Project Reference Tag */}
                  {review.project_ref && (
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-[11px] font-mono font-semibold text-cyan-300">
                      <FolderGit2 className="w-3 h-3 text-cyan-400" />
                      <span>{review.project_ref}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
