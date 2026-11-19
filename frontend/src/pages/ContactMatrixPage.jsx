import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Save,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Share2,
  ArrowRight,
  Eye,
  Radio,
  ExternalLink
} from 'lucide-react';
import { WhatsAppIcon } from '../components/Icons';
import api from '../services/api';

const AVAILABILITY_PRESETS = [
  { label: 'OPEN FOR CONTRACTS', isAvailable: true },
  { label: 'AVAILABLE FOR FREELANCE', isAvailable: true },
  { label: 'LIMITED AVAILABILITY', isAvailable: false },
  { label: 'CURRENTLY BOOKED', isAvailable: false },
];

export default function ContactMatrixPage({ onNavigateSocials }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    matrix_title: 'NODE CONTACT MATRIX',
    availability_badge: 'OPEN FOR CONTRACTS',
    is_available: true,
    email: 'daniyalayazahmed@gmail.com',
    location: 'Karachi, Pakistan (Global Remote)',
    timezone: 'PKT (UTC+5) // Async Availability',
    security_title: 'ZERO-LEAK DIRECT PERSISTENCE',
    security_description:
      'Inquiries are securely piped directly to the private database without third-party mail brokers or tracking scripts.',
    show_security_card: true,
    whatsapp_number: '',
    whatsapp_url: '',
    show_whatsapp: true,
  });

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await api.getPublicContactMatrix();
      if (data) {
        setFormData({
          matrix_title: data.matrix_title || 'NODE CONTACT MATRIX',
          availability_badge: data.availability_badge || 'OPEN FOR CONTRACTS',
          is_available: data.is_available ?? true,
          email: data.email || 'daniyalayazahmed@gmail.com',
          location: data.location || 'Karachi, Pakistan (Global Remote)',
          timezone: data.timezone || 'PKT (UTC+5) // Async Availability',
          security_title: data.security_title || 'ZERO-LEAK DIRECT PERSISTENCE',
          security_description:
            data.security_description ||
            'Inquiries are securely piped directly to the private database without third-party mail brokers or tracking scripts.',
          show_security_card: data.show_security_card ?? true,
          whatsapp_number: data.whatsapp_number || '',
          whatsapp_url: data.whatsapp_url || '',
          show_whatsapp: data.show_whatsapp ?? true,
        });
      }
    } catch (err) {
      console.error('Failed to load contact matrix config:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to fetch matrix configuration.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleApplyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      availability_badge: preset.label,
      is_available: preset.isAvailable,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setFeedback(null);
      await api.updateContactMatrix(formData);
      setFeedback({
        type: 'success',
        message: 'Node Contact Matrix synchronized and published successfully.',
      });
    } catch (err) {
      console.error('Failed to update contact matrix:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to update matrix.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold tracking-wider uppercase">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>NODE TELEMETRY & AVAILABILITY PROTOCOL</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1">
            CONTACT MATRIX CONFIG
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Configure public coordinates, operational availability status, and direct communication channels.
          </p>
        </div>

        <button
          onClick={loadConfig}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#090f20] border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 hover:text-white text-xs transition-all w-fit cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>RELOAD MATRIX</span>
        </button>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
            feedback.type === 'error'
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Grid: Form on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Config Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="p-6 rounded-2xl bg-[#090f20]/90 border border-cyan-500/30 shadow-[0_0_25px_rgba(0,240,255,0.08)] space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>COORDINATES & AVAILABILITY SETTINGS</span>
              </span>
              <span className="text-[10px] text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30">
                PERSISTED IN SQLITE
              </span>
            </div>

            {/* Matrix Header Title */}
            <div>
              <label className="block text-slate-400 text-xs mb-1 font-semibold">
                MATRIX HEADER TITLE *
              </label>
              <input
                type="text"
                name="matrix_title"
                value={formData.matrix_title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#050811] border border-cyan-500/30 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs uppercase"
              />
            </div>

            {/* Availability Status Badge & Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-slate-400 text-xs font-semibold">
                  AVAILABILITY STATUS BADGE *
                </label>
                <span className="text-[10px] text-slate-500">Quick status presets:</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {AVAILABILITY_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`px-2.5 py-1 rounded text-[10px] border transition-all cursor-pointer ${
                      formData.availability_badge === preset.label
                        ? preset.isAvailable
                          ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400'
                          : 'bg-amber-950/60 border-amber-400 text-amber-300 ring-1 ring-amber-400'
                        : 'bg-[#050811] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <input
                    type="text"
                    name="availability_badge"
                    value={formData.availability_badge}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#050811] border border-cyan-500/30 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs uppercase"
                  />
                </div>

                <div className="flex items-center">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      name="is_available"
                      checked={formData.is_available}
                      onChange={handleChange}
                      className="w-4 h-4 rounded bg-[#050811] border-cyan-500/40 text-cyan-400 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <span>
                      ACTIVE / OPEN GLOW ({formData.is_available ? 'EMERALD' : 'AMBER'})
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Coordinates: Email, Location, Timezone */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-slate-400 text-xs mb-1 font-semibold">
                  DIRECT DISPATCH EMAIL *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#050811] border border-cyan-500/30 text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1 font-semibold">
                    BASE OF OPERATIONS *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#050811] border border-cyan-500/30 text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs mb-1 font-semibold">
                    OPERATIONAL TIMEZONE *
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleChange}
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#050811] border border-cyan-500/30 text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Direct Contact Coordinates */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <WhatsAppIcon className="w-4 h-4 text-emerald-400" />
                  <span>WHATSAPP DIRECT CONTACT</span>
                </span>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    name="show_whatsapp"
                    checked={formData.show_whatsapp}
                    onChange={handleChange}
                    className="w-4 h-4 rounded bg-[#050811] border-emerald-500/40 text-emerald-400 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>SHOW WHATSAPP CARD</span>
                </label>
              </div>

              {formData.show_whatsapp && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-slate-400 text-xs mb-1 font-semibold">
                      WHATSAPP DISPLAY NUMBER
                    </label>
                    <div className="relative">
                      <WhatsAppIcon className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        name="whatsapp_number"
                        value={formData.whatsapp_number}
                        onChange={handleChange}
                        placeholder="e.g., +92 300 1234567"
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#050811] border border-emerald-500/30 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-xs"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Display text shown on the public direct contact card.
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs mb-1 font-semibold">
                      WHATSAPP DIRECT LINK (WA.ME URL)
                    </label>
                    <input
                      type="text"
                      name="whatsapp_url"
                      value={formData.whatsapp_url}
                      onChange={handleChange}
                      placeholder="https://wa.me/923001234567 or +923001234567"
                      className="w-full px-3 py-2 rounded-lg bg-[#050811] border border-emerald-500/30 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-xs"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Accepts wa.me URL, phone number, or prefilled message link.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Security Persistence Card Settings */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>SECURITY & PRIVACY CARD CALLOUT</span>
                </span>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    name="show_security_card"
                    checked={formData.show_security_card}
                    onChange={handleChange}
                    className="w-4 h-4 rounded bg-[#050811] border-cyan-500/40 text-cyan-400 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>RENDER CARD</span>
                </label>
              </div>

              {formData.show_security_card && (
                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-slate-400 text-xs mb-1 font-semibold">
                      SECURITY CARD TITLE
                    </label>
                    <input
                      type="text"
                      name="security_title"
                      value={formData.security_title}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg bg-[#050811] border border-cyan-500/30 text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs mb-1 font-semibold">
                      SECURITY CARD DESCRIPTION
                    </label>
                    <textarea
                      name="security_description"
                      rows={2}
                      value={formData.security_description}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg bg-[#050811] border border-cyan-500/30 text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <span className="text-[11px] text-slate-500">
                Updates take effect immediately on the public website.
              </span>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 hover:bg-cyan-500/30 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all font-bold text-xs cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>SYNCHRONIZE MATRIX</span>
              </button>
            </div>
          </form>

          {/* Social Links Hub Shortcut */}
          <div className="mt-6 p-4 rounded-xl bg-[#090f20]/60 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#050811] text-cyan-400 border border-slate-800">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-200 block">
                  NETWORK CHANNELS & PROFILES
                </span>
                <span className="text-[11px] text-slate-400">
                  External profile pills (GitHub, LinkedIn, Upwork, Fiverr) sync automatically from Social Links Manager.
                </span>
              </div>
            </div>

            {onNavigateSocials && (
              <button
                type="button"
                onClick={onNavigateSocials}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-all font-semibold shrink-0 cursor-pointer"
              >
                <span>MANAGE PROFILES</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Live Cyber-Card Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>LIVE CYBER-CARD PREVIEW</span>
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              REAL-TIME MIRROR
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-[#080d1e]/90 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,240,255,0.1)] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-cyan-500/15">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4" /> {formData.matrix_title || 'NODE CONTACT MATRIX'}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                  formData.is_available
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : 'bg-amber-950/40 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                }`}
              >
                {formData.availability_badge || 'OPEN FOR CONTRACTS'}
              </span>
            </div>

            {/* Coordinates */}
            <div className="space-y-4 text-xs font-mono">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#050812] border border-cyan-500/15">
                <Mail className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">DIRECT DISPATCH</span>
                  <span className="text-white font-semibold">{formData.email}</span>
                </div>
              </div>

              {/* WhatsApp Live Preview Card */}
              {formData.show_whatsapp && formData.whatsapp_url && (
                <div className="flex items-start justify-between p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300">
                  <div className="flex items-start gap-3">
                    <WhatsAppIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-emerald-400/80 block text-[10px] uppercase font-bold">DIRECT WHATSAPP</span>
                      <span className="text-emerald-200 font-semibold">{formData.whatsapp_number || 'Instant Encrypted Chat'}</span>
                    </div>
                  </div>
                  <span className="text-emerald-400 text-xs font-mono">↗</span>
                </div>
              )}

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#050812] border border-cyan-500/15">
                <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">BASE OF OPERATIONS</span>
                  <span className="text-slate-200">{formData.location}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#050812] border border-cyan-500/15">
                <Clock className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">OPERATIONAL TIMEZONE</span>
                  <span className="text-slate-200">{formData.timezone}</span>
                </div>
              </div>
            </div>

            {/* Profile Channels Placeholder */}
            <div className="pt-2 border-t border-cyan-500/15 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                NETWORK CHANNELS & PROFILES (DYNAMIC)
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                <div className="p-2 rounded bg-[#050812] border border-slate-800 text-slate-300">
                  ● GitHub & LinkedIn
                </div>
                <div className="p-2 rounded bg-[#050812] border border-slate-800 text-slate-300">
                  ● Upwork & Fiverr
                </div>
              </div>
            </div>

            {/* Security Persistence Card Preview */}
            {formData.show_security_card && (
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/25 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs font-mono text-slate-300 space-y-1 leading-relaxed">
                  <span className="text-cyan-300 font-semibold block uppercase">
                    {formData.security_title}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {formData.security_description}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
