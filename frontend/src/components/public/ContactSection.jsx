import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageSquare,
  ShieldCheck,
  Terminal,
  ArrowUpRight
} from 'lucide-react';
import { SocialPlatformIcon, WhatsAppIcon } from '../Icons';
import api from '../../services/api';

const DEFAULT_CONTACT_CONFIG = {
  matrix_title: 'NODE CONTACT MATRIX',
  availability_badge: 'OPEN FOR CONTRACTS',
  is_available: true,
  email: 'daniyalayazahmed@gmail.com',
  location: 'Karachi, Pakistan (Global Remote)',
  timezone: 'PKT (UTC+5) // Async Availability',
  security_title: 'ZERO-LEAK DIRECT PERSISTENCE',
  security_description: 'Inquiries are securely piped directly to the private database without third-party mail brokers or tracking scripts.',
  show_security_card: true,
  whatsapp_number: '',
  whatsapp_url: '',
  show_whatsapp: true,
};

const SUBJECT_OPTIONS = [
  'AI / LLM Workflow Automation',
  'Full-Stack Web Architecture (React + FastAPI)',
  'Cross-Platform Mobile Application (Flutter)',
  'Data Engineering & OCR Pipeline',
  'Consulting & Technical Advisory',
  'Other Custom Project Specification'
];

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: SUBJECT_OPTIONS[0],
    message: ''
  });

  const [contactConfig, setContactConfig] = useState(DEFAULT_CONTACT_CONFIG);
  const [socialLinks, setSocialLinks] = useState([]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const messageInputRef = useRef(null);

  useEffect(() => {
    const handlePrefill = (e) => {
      if (e?.detail?.subject) {
        setFormData((prev) => ({
          ...prev,
          subject: e.detail.subject,
        }));
        setSuccess(false);
        setTimeout(() => {
          messageInputRef.current?.focus();
        }, 350);
      }
    };

    window.addEventListener('prefill-inquiry', handlePrefill);
    return () => window.removeEventListener('prefill-inquiry', handlePrefill);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadContactData() {
      try {
        const [matrixRes, socialsRes] = await Promise.allSettled([
          api.getPublicContactMatrix(),
          api.getPublicSocialLinks()
        ]);

        if (isMounted) {
          if (
            matrixRes.status === 'fulfilled' &&
            matrixRes.value &&
            typeof matrixRes.value === 'object' &&
            !matrixRes.value.detail
          ) {
            setContactConfig((prev) => ({ ...prev, ...matrixRes.value }));
          }
          if (socialsRes.status === 'fulfilled' && Array.isArray(socialsRes.value)) {
            const validSocials = socialsRes.value.filter(
              (item) => item && typeof item === 'object' && item.url && typeof item.url === 'string' && item.url.trim() !== ''
            );
            setSocialLinks(validSocials);
          }
        }
      } catch (err) {
        console.warn('Contact section dynamic data fetch deferred:', err);
      }
    }
    loadContactData();
    return () => {
      isMounted = false;
    };
  }, []);

  const safeConfig = {
    matrix_title: contactConfig?.matrix_title || DEFAULT_CONTACT_CONFIG.matrix_title,
    availability_badge: contactConfig?.availability_badge || DEFAULT_CONTACT_CONFIG.availability_badge,
    is_available: Boolean(contactConfig?.is_available),
    email: contactConfig?.email || DEFAULT_CONTACT_CONFIG.email,
    location: contactConfig?.location || DEFAULT_CONTACT_CONFIG.location,
    timezone: contactConfig?.timezone || DEFAULT_CONTACT_CONFIG.timezone,
    security_title: contactConfig?.security_title || DEFAULT_CONTACT_CONFIG.security_title,
    security_description: contactConfig?.security_description || DEFAULT_CONTACT_CONFIG.security_description,
    show_security_card: contactConfig?.show_security_card !== false,
    whatsapp_number: contactConfig?.whatsapp_number || '',
    whatsapp_url: contactConfig?.whatsapp_url || '',
    show_whatsapp: contactConfig?.show_whatsapp !== false,
  };

  const safeSocialLinks = Array.isArray(socialLinks)
    ? socialLinks.filter((item) => item && typeof item === 'object' && item.url)
    : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please provide your name, valid email, and project message.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.submitInquiry({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject,
        message: formData.message.trim()
      });

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: SUBJECT_OPTIONS[0],
        message: ''
      });
    } catch (err) {
      console.error('Inquiry transmission failed:', err);
      setError(
        typeof err?.message === 'string'
          ? err.message
          : 'Inquiry packet failed to transmit. Please try again or reach out directly.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="relative py-24 px-4 sm:px-6 lg:px-8 border-b border-cyan-500/20 bg-[#03060e]">
      {/* Background radial glow */}
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[350px] bg-blue-600/5 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>// SECURE INTAKE & COMMUNICATIONS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-mono font-bold text-white tracking-tight">
            Initiate <span className="text-cyan-400">Project Telemetry</span>
          </h2>
          <p className="text-sm font-mono text-slate-400 leading-relaxed">
            Have a system architecture in mind, or need to automate complex operational workflows? Send an encrypted inquiry packet directly to my dashboard inbox.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Coordinates & Status */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-[#080d1e]/80 border border-cyan-500/25 space-y-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-cyan-500/15">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4" /> {safeConfig.matrix_title}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                    safeConfig.is_available
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                      : 'bg-amber-950/40 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                  }`}
                >
                  {safeConfig.availability_badge}
                </span>
              </div>

              {/* Contact Information Points */}
              <div className="space-y-4 text-xs font-mono">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#050812] border border-cyan-500/15">
                  <Mail className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">DIRECT DISPATCH</span>
                    <a
                      href={`mailto:${safeConfig.email}`}
                      className="text-white hover:text-cyan-300 font-semibold transition-colors"
                    >
                      {safeConfig.email}
                    </a>
                  </div>
                </div>

                {/* Glowing Emerald Direct WhatsApp Card */}
                {safeConfig.show_whatsapp && safeConfig.whatsapp_url && (
                  <a
                    href={safeConfig.whatsapp_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start justify-between p-3 rounded-xl bg-emerald-950/25 border border-emerald-500/35 hover:border-emerald-400 hover:bg-emerald-950/45 text-emerald-300 transition-all group/wa cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.12)] hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                    title="Open direct WhatsApp conversation (Opens in new tab)"
                  >
                    <div className="flex items-start gap-3">
                      <WhatsAppIcon className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5 group-hover/wa:scale-110 transition-transform" />
                      <div>
                        <span className="text-emerald-400/90 block text-[10px] uppercase font-bold tracking-wider">
                          DIRECT WHATSAPP
                        </span>
                        <span className="text-emerald-100 font-semibold group-hover/wa:text-white transition-colors">
                          {safeConfig.whatsapp_number || 'Instant Encrypted Chat'}
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 group-hover/wa:translate-x-0.5 group-hover/wa:-translate-y-0.5 transition-transform" />
                  </a>
                )}

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#050812] border border-cyan-500/15">
                  <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">BASE OF OPERATIONS</span>
                    <span className="text-slate-200">
                      {safeConfig.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#050812] border border-cyan-500/15">
                  <Clock className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">OPERATIONAL TIMEZONE</span>
                    <span className="text-slate-200">
                      {safeConfig.timezone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Direct Channels & Marketplaces */}
              {safeSocialLinks.length > 0 && (
                <div className="pt-2 border-t border-cyan-500/15 space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    NETWORK CHANNELS & PROFILES
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {safeSocialLinks.map((link, idx) => (
                      <a
                        key={link.id || link.label || idx}
                        href={link.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-lg bg-[#050812] border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all font-mono text-xs group/social"
                        title={`${link.platform || link.label || 'Channel'} (Opens in new tab)`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-cyan-400 group-hover/social:scale-110 transition-transform">
                            <SocialPlatformIcon iconKey={link.icon_key || 'globe'} className="w-4 h-4" />
                          </span>
                          <span className="truncate">{typeof link.label === 'string' ? link.label : (link.platform || 'Link')}</span>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover/social:text-cyan-400 group-hover/social:translate-x-0.5 group-hover/social:-translate-y-0.5 transition-all" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Privacy & SLA Assurance Callout (Dynamic Toggle) */}
            {safeConfig.show_security_card && (
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/25 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs font-mono text-slate-300 space-y-1 leading-relaxed">
                  <span className="text-cyan-300 font-semibold block uppercase">
                    {safeConfig.security_title}
                  </span>
                  <span>
                    {safeConfig.security_description}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#080d1e]/90 border border-cyan-500/30 shadow-2xl relative">
              {/* Glowing decorative corner */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-400/10 via-transparent to-transparent pointer-events-none rounded-tr-2xl" />

              {success ? (
                <div className="py-12 px-4 text-center space-y-5 animate-in fade-in duration-300">
                  <div className="w-16 h-16 mx-auto rounded-full bg-cyan-950/80 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 shadow-neon-cyan">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-mono font-bold text-white tracking-tight">
                      TELEMETRY PACKET TRANSMITTED
                    </h3>
                    <p className="text-xs font-mono text-slate-300 max-w-md mx-auto leading-relaxed">
                      Your inquiry has been transmitted securely. I will review your specification and follow up via your email shortly.
                    </p>
                  </div>
                  <button
                    onClick={() => setSuccess(false)}
                    className="px-5 py-2.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-semibold hover:bg-cyan-500 hover:text-black transition-all cursor-pointer"
                  >
                    SEND ANOTHER SPECIFICATION
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Send className="w-3.5 h-3.5 text-cyan-400" /> TRANSMIT PROJECT SPECIFICATION
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ALL FIELDS REQUIRED
                    </span>
                  </div>

                  {error && (
                    <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 font-mono text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{typeof error === 'string' ? error : (error?.message || 'Inquiry packet failed to transmit. Please try again or reach out directly.')}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                        Client / Organization Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Alex Vance / Apex Robotics"
                        className="w-full px-3.5 py-2.5 rounded-lg cyber-input font-mono text-xs text-white placeholder:text-slate-600"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                        Contact Electronic Mail
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="e.g., alex@apexrobotics.io"
                        className="w-full px-3.5 py-2.5 rounded-lg cyber-input font-mono text-xs text-white placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  {/* Subject Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                      Engagement Category / Domain
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg cyber-input font-mono text-xs text-white"
                    >
                      {formData.subject && !SUBJECT_OPTIONS.includes(formData.subject) && (
                        <option value={formData.subject} className="bg-[#080d1e] text-cyan-300 font-bold">
                          {formData.subject}
                        </option>
                      )}
                      {SUBJECT_OPTIONS.map((sub, idx) => (
                        <option key={idx} value={sub} className="bg-[#080d1e] text-slate-200">
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message Textarea */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                        Technical Scope & Problem Statement
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">
                        {formData.message.length} chars
                      </span>
                    </div>
                    <textarea
                      ref={messageInputRef}
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="Outline target deliverable, timeline, tech stack constraints, and current bottlenecks..."
                      className="w-full p-3.5 rounded-lg cyber-input font-mono text-xs text-white placeholder:text-slate-600 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-black hover:from-cyan-300 hover:to-indigo-500 shadow-neon-cyan transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>DISPATCHING TELEMETRY PACKET...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>DISPATCH INQUIRY PACKET</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
