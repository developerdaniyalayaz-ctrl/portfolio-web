import React, { useState, useEffect } from 'react';
import { Menu, X, Send } from 'lucide-react';
import InteractiveLogo from './InteractiveLogo';

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'ABOUT', href: '#about' },
    { label: 'TECH STACK', href: '#stack' },
    { label: 'PROJECTS', href: '#projects' },
    { label: 'CONTACT', href: '#contact' },
  ];

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-mono ${
        scrolled
          ? 'bg-[#050811]/90 backdrop-blur-md border-b border-cyan-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.8)]'
          : 'bg-transparent border-b border-cyan-500/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Interactive Cyber Brand Logo */}
        <InteractiveLogo />

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="text-xs tracking-widest text-slate-400 hover:text-cyan-300 transition-colors duration-200 relative py-1 group"
            >
              <span>{link.label}</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></span>
            </a>
          ))}
        </nav>

        {/* Right Action: Primary Public CTA & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <a
            href="#contact"
            onClick={(e) => handleLinkClick(e, '#contact')}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold tracking-wider bg-gradient-to-r from-cyan-400 to-blue-600 text-black hover:from-cyan-300 hover:to-blue-500 shadow-neon-cyan transition-all duration-200 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>INITIATE INQUIRY</span>
          </a>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-[#080d1a] border border-cyan-500/30 text-cyan-400 hover:text-cyan-300"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#080d1a]/95 backdrop-blur-xl border-b border-cyan-500/20 px-6 py-6 space-y-4 animate-fade-in">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-sm tracking-wider text-slate-300 hover:text-cyan-300 py-2 border-b border-slate-800/80"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-2">
            <a
              href="#contact"
              onClick={(e) => handleLinkClick(e, '#contact')}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-semibold shadow-neon-cyan cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>INITIATE INQUIRY</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
