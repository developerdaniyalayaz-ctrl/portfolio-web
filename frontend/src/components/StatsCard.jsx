import React from 'react';

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'cyan', // 'cyan', 'emerald', 'crimson', 'blue'
  onClick,
}) {
  const variantStyles = {
    cyan: {
      border: 'border-cyan-500/30 hover:border-cyan-400',
      glow: 'hover:shadow-neon-cyan',
      text: 'text-cyan-400',
      bgIcon: 'bg-cyan-500/15 text-cyan-400',
      badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    },
    emerald: {
      border: 'border-emerald-500/30 hover:border-emerald-400',
      glow: 'hover:shadow-neon-emerald',
      text: 'text-emerald-400',
      bgIcon: 'bg-emerald-500/15 text-emerald-400',
      badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    },
    crimson: {
      border: 'border-rose-500/30 hover:border-rose-400',
      glow: 'hover:shadow-neon-crimson',
      text: 'text-rose-400',
      bgIcon: 'bg-rose-500/15 text-rose-400',
      badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    },
    blue: {
      border: 'border-blue-500/30 hover:border-blue-400',
      glow: 'hover:shadow-neon-blue',
      text: 'text-blue-400',
      bgIcon: 'bg-blue-500/15 text-blue-400',
      badge: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    },
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`cyber-card p-5 rounded-xl border ${variantStyles.border} ${variantStyles.glow} relative overflow-hidden group cursor-pointer`}
    >
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
        <div className="absolute top-0 right-0 border-t-2 border-r-2 border-current w-3 h-3 opacity-60"></div>
      </div>

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-mono font-bold tracking-tight ${variantStyles.text}`}>
              {value}
            </span>
          </div>
          {subtitle && (
            <p className="text-[11px] font-mono text-slate-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`p-3 rounded-xl ${variantStyles.bgIcon} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {/* Cyber pulse underline */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>STATUS: LIVE</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
          REALTIME
        </span>
      </div>
    </div>
  );
}
