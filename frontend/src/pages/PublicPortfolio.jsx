import React from 'react';
import PublicNavbar from '../components/public/PublicNavbar';
import HeroSection from '../components/public/HeroSection';
import ImpactMetricsBar from '../components/public/ImpactMetricsBar';
import TechStackSection from '../components/public/TechStackSection';
import ProjectsShowcase from '../components/public/ProjectsShowcase';
import TestimonialsSection from '../components/public/TestimonialsSection';
import EngagementSection from '../components/public/EngagementSection';
import ContactSection from '../components/public/ContactSection';
import PublicFooter from '../components/public/PublicFooter';
import ErrorBoundary from '../components/public/ErrorBoundary';
import useVisitorTracker from '../hooks/useVisitorTracker';

export default function PublicPortfolio() {
  // Silent, zero-third-party telemetry streaming for public visitor traffic
  useVisitorTracker('/');

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Fixed Cyber Glow Background Noise / Ambient Gradients */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,240,255,0.06),rgba(255,255,255,0))] pointer-events-none z-0" />

      {/* Floating Top Navbar */}
      <ErrorBoundary>
        <PublicNavbar />
      </ErrorBoundary>

      {/* Page Sections */}
      <main className="relative z-10 space-y-0">
        <ErrorBoundary>
          <HeroSection />
        </ErrorBoundary>
        <ErrorBoundary>
          <ImpactMetricsBar />
        </ErrorBoundary>
        <ErrorBoundary>
          <TechStackSection />
        </ErrorBoundary>
        <ErrorBoundary>
          <ProjectsShowcase />
        </ErrorBoundary>
        <ErrorBoundary>
          <TestimonialsSection />
        </ErrorBoundary>
        <ErrorBoundary>
          <EngagementSection />
        </ErrorBoundary>
        <ErrorBoundary>
          <ContactSection />
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <ErrorBoundary>
        <PublicFooter />
      </ErrorBoundary>
    </div>
  );
}
