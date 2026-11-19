import React, { useState } from 'react';
import { Terminal, ShieldAlert, Lock, User, Eye, EyeOff, ArrowRight, Zap, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login({ onNavigate }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please provide superadmin identity credentials.');
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err.message || 'Invalid cyber credentials. Access strictly denied.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setUsername('admin');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-[#050811]">
      {/* Background Cyber Ambient Lights */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Cyber Grid Pattern Background */}
      <div className="absolute inset-0 bg-cyber-grid bg-[size:30px_30px] opacity-40 pointer-events-none"></div>

      {/* Login Card */}
      <div className="relative w-full max-w-md bg-[#080d1a]/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.2)] overflow-hidden z-10 animate-fade-in">
        {/* Neon Header Accent */}
        <div className="h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 shadow-neon-cyan"></div>

        {/* Back to Public Site link */}
        {onNavigate && (
          <div className="px-6 pt-4 pb-0 flex justify-between items-center">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>RETURN TO PUBLIC PORTFOLIO</span>
            </button>
          </div>
        )}

        <div className="p-8 pt-6 space-y-6">
          {/* Logo / Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-950/40 border border-cyan-500/50 shadow-neon-cyan mb-1">
              <Terminal className="w-7 h-7 text-cyan-400" />
            </div>

            <h1 className="text-2xl font-mono font-bold tracking-wider text-slate-100">
              CYBER//ADMIN CORE
            </h1>

            <p className="text-xs font-mono text-cyan-400/80">
              AUTHORIZED PERSONNEL ONLY // CLASSIFIED GATEWAY
            </p>
          </div>

          {/* Security Warning Notice */}
          <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/20 flex items-start gap-2.5 text-[11px] font-mono text-slate-400">
            <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              Single-operator console. No public registration enabled. Access attempts are hashed and logged.
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-500/60 text-rose-300 text-xs font-mono flex items-center gap-2 shadow-neon-crimson">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Operator Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg cyber-input font-mono text-sm placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
                  Access Key (Password)
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPassword ? 'HIDE' : 'REVEAL'}</span>
                </button>
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg cyber-input font-mono text-sm placeholder:text-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-mono text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 text-black hover:from-cyan-300 hover:to-blue-500 shadow-neon-cyan hover:shadow-neon-cyan-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AUTHENTICATING SECURE HASH...</span>
                </>
              ) : (
                <>
                  <span>INITIALIZE SESSION</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credential Filler */}
          <div className="pt-4 border-t border-cyan-500/15 text-center">
            <button
              type="button"
              onClick={handleQuickFill}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 text-[11px] font-mono text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>Auto-fill Demo Credentials (admin / admin123)</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-[#050811]/90 py-3 px-6 text-center border-t border-cyan-500/20 text-[10px] font-mono text-slate-400 flex items-center justify-between">
          <span>PORTFOLIO ADMIN PROTOCOL</span>
          <span className="text-emerald-400 font-semibold">STATUS: 200 OK</span>
        </div>
      </div>
    </div>
  );
}
