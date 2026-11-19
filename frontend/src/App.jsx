import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectsPage from './pages/ProjectsPage';
import InquiriesPage from './pages/InquiriesPage';
import TelemetryPage from './pages/TelemetryPage';
import SocialLinksPage from './pages/SocialLinksPage';
import CapabilitiesPage from './pages/CapabilitiesPage';
import MetricsPage from './pages/MetricsPage';
import TestimonialsPage from './pages/TestimonialsPage';
import EngagementsPage from './pages/EngagementsPage';
import TechStackPage from './pages/TechStackPage';
import ContactMatrixPage from './pages/ContactMatrixPage';
import PublicPortfolio from './pages/PublicPortfolio';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProjectModal from './components/ProjectModal';
import ConfirmDialog from './components/ConfirmDialog';
import InquiryDetailModal from './components/InquiryDetailModal';
import SecuritySettingsModal from './components/SecuritySettingsModal';
import useVisitorTracker from './hooks/useVisitorTracker';
import api from './services/api';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { isAuthenticated, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'telemetry', 'projects', 'inquiries'

  // Path-based client routing
  const [currentPath, setCurrentPath] = useState(() => {
    return typeof window !== 'undefined' ? window.location.pathname || '/' : '/';
  });

  const navigate = (path) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(typeof window !== 'undefined' ? window.location.pathname || '/' : '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync activeTab with URL path when navigating directly to an admin module
  useEffect(() => {
    if (currentPath === '/admin/metrics') setActiveTab('metrics');
    else if (currentPath === '/admin/testimonials') setActiveTab('testimonials');
    else if (currentPath === '/admin/engagements') setActiveTab('engagements');
    else if (currentPath === '/admin/capabilities') setActiveTab('capabilities');
    else if (currentPath === '/admin/projects') setActiveTab('projects');
    else if (currentPath === '/admin/tech-stack') setActiveTab('tech-stack');
    else if (currentPath === '/admin/socials') setActiveTab('socials');
    else if (currentPath === '/admin/contact-matrix') setActiveTab('contact-matrix');
    else if (currentPath === '/admin/inquiries') setActiveTab('inquiries');
    else if (currentPath === '/admin/telemetry') setActiveTab('telemetry');
  }, [currentPath]);

  // When user logs in successfully while on /login, redirect to /admin
  useEffect(() => {
    if (isAuthenticated && currentPath === '/login') {
      navigate('/admin');
    }
  }, [isAuthenticated, currentPath]);

  // Anonymized telemetry tracker hook (strictly excludes /admin, /login, and auth routes)
  useVisitorTracker(currentPath);

  // Modals state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  const [inquiryToDelete, setInquiryToDelete] = useState(null);
  const [isDeleteInquiryOpen, setIsDeleteInquiryOpen] = useState(false);

  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [unreadInquiriesCount, setUnreadInquiriesCount] = useState(0);

  // Poll / fetch unread count periodically
  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    try {
      const stats = await api.getStats();
      setUnreadInquiriesCount(stats.unread_inquiries || 0);
    } catch (e) {
      // ignore in background
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);

      const handleChanged = () => fetchUnreadCount();
      window.addEventListener('cyber:project-changed', handleChanged);
      window.addEventListener('cyber:inquiry-changed', handleChanged);

      return () => {
        clearInterval(interval);
        window.removeEventListener('cyber:project-changed', handleChanged);
        window.removeEventListener('cyber:inquiry-changed', handleChanged);
      };
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050811] flex flex-col items-center justify-center font-mono text-cyan-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-xs tracking-widest uppercase">INITIALIZING CYBER PROTOCOL...</span>
      </div>
    );
  }

  // ROUTE 1: Login Portal (/login)
  if (currentPath === '/login') {
    if (isAuthenticated) {
      // Auto transition to admin studio
      return (
        <div className="min-h-screen bg-[#050811] flex flex-col items-center justify-center font-mono text-cyan-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-xs tracking-widest uppercase">OPERATOR AUTHENTICATED. REDIRECTING...</span>
        </div>
      );
    }
    return <Login onNavigate={navigate} />;
  }

  // ROUTE 2: Protected Admin Studio (/admin or /admin/*)
  if (currentPath.startsWith('/admin')) {
    if (!isAuthenticated) {
      return <Login onNavigate={navigate} />;
    }

    // --- PROJECT ACTIONS ---
    const handleOpenCreateProject = () => {
      setEditingProject(null);
      setIsProjectModalOpen(true);
    };

    const handleOpenEditProject = (project) => {
      setEditingProject(project);
      setIsProjectModalOpen(true);
    };

    const handleSaveProject = async (projectData) => {
      if (editingProject) {
        await api.updateProject(editingProject.id, projectData);
      } else {
        await api.createProject(projectData);
      }
      fetchUnreadCount();
    };

    // --- INQUIRY ACTIONS ---
    const handleOpenInquiryDetail = (inquiry) => {
      setSelectedInquiry(inquiry);
      setIsInquiryModalOpen(true);
    };

    const handleToggleInquiryRead = async (inquiryId) => {
      try {
        const updated = await api.toggleInquiryRead(inquiryId);
        if (selectedInquiry && selectedInquiry.id === inquiryId) {
          setSelectedInquiry(updated);
        }
        fetchUnreadCount();
      } catch (err) {
        alert(`Toggle failed: ${err.message}`);
      }
    };

    const handleOpenDeleteInquiry = (inquiry) => {
      setInquiryToDelete(inquiry);
      setIsDeleteInquiryOpen(true);
    };

    const handleConfirmDeleteInquiry = async () => {
      if (!inquiryToDelete) return;
      try {
        await api.deleteInquiry(inquiryToDelete.id);
        setIsDeleteInquiryOpen(false);
        if (isInquiryModalOpen && selectedInquiry?.id === inquiryToDelete.id) {
          setIsInquiryModalOpen(false);
        }
        setInquiryToDelete(null);
        fetchUnreadCount();
        window.dispatchEvent(new CustomEvent('cyber:inquiry-changed'));
      } catch (err) {
        alert(`Purge failed: ${err.message}`);
      }
    };

    return (
      <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans">
        {/* Top Cyber Navigation Bar with link to public site */}
        <Navbar
          onLogoutClick={() => setIsLogoutConfirmOpen(true)}
          onOpenSecurity={() => setIsSecurityModalOpen(true)}
        />

        {/* Main Body with Sidebar and Content Area */}
        <div className="flex-1 flex">
          {/* Sidebar Navigation */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            unreadInquiriesCount={unreadInquiriesCount}
            onOpenSecurity={() => setIsSecurityModalOpen(true)}
          />

          {/* Content View Container */}
          <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
            {activeTab === 'dashboard' && (
              <Dashboard
                onNavigateProjects={() => setActiveTab('projects')}
                onNavigateInquiries={() => setActiveTab('inquiries')}
                onOpenCreateProject={handleOpenCreateProject}
                onOpenEditProject={handleOpenEditProject}
                onOpenInquiry={handleOpenInquiryDetail}
                onOpenSecurity={() => setIsSecurityModalOpen(true)}
              />
            )}

            {activeTab === 'telemetry' && (
              <TelemetryPage />
            )}

            {activeTab === 'projects' && (
              <ProjectsPage
                onOpenCreateModal={handleOpenCreateProject}
                onOpenEditModal={handleOpenEditProject}
              />
            )}

            {activeTab === 'socials' && (
              <SocialLinksPage />
            )}

            {activeTab === 'capabilities' && (
              <CapabilitiesPage />
            )}

            {activeTab === 'metrics' && (
              <MetricsPage />
            )}

            {activeTab === 'testimonials' && (
              <TestimonialsPage />
            )}

            {activeTab === 'engagements' && (
              <EngagementsPage />
            )}

            {activeTab === 'tech-stack' && (
              <TechStackPage />
            )}

            {activeTab === 'contact-matrix' && (
              <ContactMatrixPage onNavigateSocials={() => setActiveTab('socials')} />
            )}

            {activeTab === 'inquiries' && (
              <InquiriesPage
                onOpenInquiryDetail={handleOpenInquiryDetail}
                onOpenDeleteConfirm={handleOpenDeleteInquiry}
              />
            )}
          </main>
        </div>

        {/* Project Create / Edit Modal */}
        <ProjectModal
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
          onSave={handleSaveProject}
          project={editingProject}
        />

        {/* Superadmin Security & Backup Hardening Modal */}
        <SecuritySettingsModal
          isOpen={isSecurityModalOpen}
          onClose={() => setIsSecurityModalOpen(false)}
        />

        {/* Inquiry Detail Reader Modal */}
        <InquiryDetailModal
          isOpen={isInquiryModalOpen}
          onClose={() => setIsInquiryModalOpen(false)}
          inquiry={selectedInquiry}
          onToggleRead={handleToggleInquiryRead}
          onDelete={(id) => {
            handleOpenDeleteInquiry(selectedInquiry);
          }}
          onOpenReply={(inquiry) => {
            window.dispatchEvent(new CustomEvent('cyber:open-reply-modal', { detail: inquiry }));
          }}
        />

        {/* Confirm Inquiry Delete Dialog */}
        <ConfirmDialog
          isOpen={isDeleteInquiryOpen}
          title="PURGE CLIENT INQUIRY"
          message={`Are you sure you want to permanently delete the inquiry message from "${inquiryToDelete?.name}" (${inquiryToDelete?.email})?`}
          confirmText="PURGE INQUIRY"
          onConfirm={handleConfirmDeleteInquiry}
          onCancel={() => {
            setIsDeleteInquiryOpen(false);
            setInquiryToDelete(null);
          }}
        />

        {/* Confirm Logout Dialog */}
        <ConfirmDialog
          isOpen={isLogoutConfirmOpen}
          title="TERMINATE OPERATOR SESSION"
          message="You are about to sever your encrypted superadmin connection. You will need to re-authenticate with your security key."
          confirmText="TERMINATE SESSION"
          cancelText="REMAIN CONNECTED"
          onConfirm={() => {
            setIsLogoutConfirmOpen(false);
            logout();
            navigate('/');
          }}
          onCancel={() => setIsLogoutConfirmOpen(false)}
        />
      </div>
    );
  }

  // DEFAULT ROUTE: Public Showcase Portfolio Website (/)
  return <PublicPortfolio />;
}
