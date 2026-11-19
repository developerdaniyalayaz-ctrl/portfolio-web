import React, { useState, useRef, useEffect } from 'react';

const TARGET_FIRST = 'DANIYAL';
const TARGET_LAST = 'AYAZ';
const SCRAMBLE_GLYPHS = '01<>{}/\\_#$';

/**
 * Interactive Cyber-Neon Brand Logo Component for Daniyal Ayaz.
 * Features:
 *  - 3D-esque SVG 'D' emblem with terminal `>_`, bracket `{`, and telemetry nodes
 *  - Interactive hover cyber-scramble decode animation on `DANIYAL // AYAZ`
 *  - Interactive terminal status badge: `● >_ FULL-STACK ARCHITECT_`
 */
export default function InteractiveLogo({
  className = '',
  iconSize = 'w-10 h-10',
  showText = true,
  onClick = null,
  roleText = 'FULL-STACK ARCHITECT'
}) {
  const [firstPart, setFirstPart] = useState(TARGET_FIRST);
  const [lastPart, setLastPart] = useState(TARGET_LAST);
  const intervalRef = useRef(null);

  // Clear running animation intervals on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Cyber-scramble decode effect lasting ~400ms
  const handleMouseEnter = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const totalFrames = 13; // ~30ms * 13 frames = ~390-400ms
    let frame = 0;

    intervalRef.current = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;

      // Progressively resolve first part ('DANIYAL')
      const resolvedCountFirst = Math.floor(progress * TARGET_FIRST.length);
      const scrambledFirst = TARGET_FIRST.split('')
        .map((char, i) => {
          if (i < resolvedCountFirst) return TARGET_FIRST[i];
          return SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
        })
        .join('');

      // Progressively resolve last part ('AYAZ')
      const resolvedCountLast = Math.floor(progress * TARGET_LAST.length);
      const scrambledLast = TARGET_LAST.split('')
        .map((char, i) => {
          if (i < resolvedCountLast) return TARGET_LAST[i];
          return SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
        })
        .join('');

      setFirstPart(scrambledFirst);
      setLastPart(scrambledLast);

      if (frame >= totalFrames) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setFirstPart(TARGET_FIRST);
        setLastPart(TARGET_LAST);
      }
    }, 30);
  };

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
      return;
    }
    // Default smooth scroll to top/hero
    e.preventDefault();
    const hero = document.querySelector('#hero') || document.querySelector('main');
    if (hero) {
      hero.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <a
      href="#hero"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={`group inline-flex items-center gap-3 cursor-pointer select-none font-mono transition-all duration-300 ${className}`}
      title="Daniyal Ayaz // Full-Stack Architect"
    >
      {/* 3D-Esque Cyber 'D' Emblem Container */}
      <div
        className={`relative ${iconSize} shrink-0 rounded-xl bg-[#060b18]/90 border border-cyan-500/40 group-hover:border-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.15)] group-hover:shadow-[0_0_25px_rgba(0,240,255,0.45)] transition-all duration-300 flex items-center justify-center overflow-hidden`}
      >
        {/* Soft Sweep Light Beam Reflection across Emblem on Hover */}
        <div className="absolute inset-0 -translate-x-[120%] group-hover:translate-x-[120%] transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent pointer-events-none z-10" />

        {/* Ambient Corner Accents */}
        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity" />

        {/* Scalable SVG Emblem */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full p-1.5 text-cyan-400 transition-transform duration-300 group-hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Primary Frame Gradient */}
            <linearGradient id="cyber-frame-grad-unique" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="50%" stopColor="#0080ff" />
              <stop offset="100%" stopColor="#7928ca" />
            </linearGradient>

            {/* Depth Chamfer Gradient */}
            <linearGradient id="cyber-depth-grad-unique" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#03203c" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.2" />
            </linearGradient>

            {/* SVG Neon Drop-Shadow Filter */}
            <filter id="neon-glow-unique" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Node Vertex Glow Filter */}
            <filter id="node-glow-unique" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 3D Depth Underlay / Isometric Chamfer Shadow */}
          <path
            d="M 24,18 L 56,18 C 76,18 88,32 88,54 C 88,76 76,88 56,88 L 24,88 Z"
            fill="url(#cyber-depth-grad-unique)"
            className="opacity-70 group-hover:opacity-100 transition-opacity"
          />

          {/* Outer Cyber "D" Hull */}
          <path
            d="M 20,14 L 54,14 C 75,14 86,28 86,50 C 86,72 75,86 54,86 L 20,86 Z"
            stroke="url(#cyber-frame-grad-unique)"
            strokeWidth="3.5"
            strokeLinejoin="round"
            filter="url(#neon-glow-unique)"
            className="transition-all duration-300"
          />

          {/* Inner Negative "D" Window */}
          <path
            d="M 34,26 L 50,26 C 64,26 72,35 72,50 C 72,65 64,74 50,74 L 34,74 Z"
            stroke="#00f0ff"
            strokeWidth="1.8"
            strokeOpacity="0.45"
            strokeDasharray="4 2"
            fill="#030814"
            className="group-hover:stroke-opacity-80 transition-all duration-300"
          />

          {/* Left Vertical Spine Visual Marker: Code Bracket '{' */}
          <path
            d="M 28 34 C 23 34 22 37 22 42 C 22 47 20 48 16 50 C 20 52 22 53 22 58 C 22 63 23 66 28 66"
            stroke="#00f0ff"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
            filter="url(#neon-glow-unique)"
            className="transition-transform group-hover:-translate-x-0.5 duration-300"
          />

          {/* Center Visual Marker: Terminal Prompt '>_' */}
          <g className="transition-transform group-hover:scale-105 origin-center">
            {/* Terminal Chevron '>' */}
            <path
              d="M 40 43 L 47 50 L 40 57"
              stroke="#00f0ff"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Blinking Terminal Cursor '_' */}
            <line
              x1="51"
              y1="57"
              x2="59"
              y2="57"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="animate-pulse"
            />
          </g>

          {/* Right Arc: Networked Telemetry Nodes & Interconnections */}
          <g className="transition-transform group-hover:scale-105 origin-[80px_50px]">
            {/* Network Bus Vector Connections */}
            <path
              d="M 76 28 L 86 50 L 76 72 M 86 50 L 68 50"
              stroke="#00f0ff"
              strokeWidth="1.2"
              strokeDasharray="2 2"
              strokeOpacity="0.6"
              className="group-hover:stroke-opacity-100 transition-opacity"
            />

            {/* Node 1 (Top Arc) */}
            <circle
              cx="76"
              cy="28"
              r="3"
              fill="#00f0ff"
              filter="url(#node-glow-unique)"
              className="transition-transform duration-300 group-hover:scale-125 origin-[76px_28px]"
            />

            {/* Node 2 (Center Vertex - Primary) */}
            <circle
              cx="86"
              cy="50"
              r="3.5"
              fill="#38bdf8"
              filter="url(#neon-glow-unique)"
              className="transition-transform duration-300 group-hover:scale-125 origin-[86px_50px]"
            />

            {/* Node 3 (Bottom Arc) */}
            <circle
              cx="76"
              cy="72"
              r="3"
              fill="#00f0ff"
              filter="url(#node-glow-unique)"
              className="transition-transform duration-300 group-hover:scale-125 origin-[76px_72px]"
            />

            {/* Node 4 (Interior Gateway) */}
            <circle
              cx="68"
              cy="50"
              r="2.2"
              fill="#818cf8"
              className="transition-transform duration-300 group-hover:scale-125 origin-[68px_50px]"
            />
          </g>
        </svg>
      </div>

      {/* Text Branding & Terminal Status Badge */}
      {showText && (
        <div className="flex flex-col text-left">
          {/* Brand Name Headline with Cyber-Scramble Animation */}
          <div className="text-sm md:text-base font-bold tracking-wider text-slate-100 group-hover:text-white transition-colors duration-200 flex items-center gap-1.5 leading-none">
            <span className="tracking-widest font-mono">
              {firstPart}
            </span>
            <span className="text-[#00f0ff] font-bold group-hover:text-cyan-300 transition-colors drop-shadow-[0_0_10px_rgba(0,240,255,0.85)]">
              //
            </span>
            <span className="text-cyan-300 group-hover:text-cyan-200 transition-colors tracking-widest font-mono">
              {lastPart}
            </span>
          </div>

          {/* Subtitle & Interactive Terminal Status Badge */}
          <div className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] flex items-center gap-1.5 mt-1.5 transition-colors duration-200">
            {/* Live Core Telemetry Status Dot (Breathing Emerald Glow) */}
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.85)]"></span>
            </span>

            {/* Terminal Prompt '>_' */}
            <span className="text-slate-500 group-hover:text-[#00f0ff] font-bold transition-colors duration-200">
              &gt;_
            </span>

            {/* Terminal Designation */}
            <span className="text-slate-400 group-hover:text-cyan-300 font-semibold tracking-[0.2em] uppercase transition-colors duration-200 truncate">
              {roleText}
            </span>

            {/* Suffix Terminal Cursor (Blinks in Cyan on Hover) */}
            <span className="text-[#00f0ff] font-bold opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-200 -ml-1">
              _
            </span>
          </div>
        </div>
      )}
    </a>
  );
}
