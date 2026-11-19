import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  KeyRound,
  User,
  Database,
  Download,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  Cpu,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SecuritySettingsModal({ isOpen, onClose }) {
  const { user } = useAuth();

  // Active section tab: 'password' | 'profile' | 'backup'
  const [activeTab, setActiveTab] = useState('password');

  // Password Rotation form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Profile Username form state
  const [username, setUsername] = useState(user?.username || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Backup Engine telemetry state
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupStats, setBackupStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Notification banners
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setUsername(user?.username || '');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setError('');
      setSuccess('');
      fetchBackupStats();
    }
  }, [isOpen, user]);

  const fetchBackupStats = async () => {
    setStatsLoading(true);
    try {
      const stats = await api.getBackupStats();
      setBackupStats(stats);
    } catch (e) {
      console.warn('Could not fetch backup telemetry:', e);
    } finally {
      setStatsLoading(false);
    }
  };

  if (!isOpen) return null;

  // --- PASSWORD ROTATION HANDLER ---
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword) {
      setError('Please provide current security access key.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New security key must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Confirmation key does not match new security key.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_new_password: confirmNewPassword,
      });
      setSuccess(res.message || 'Security credentials rotated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setError(err.message || 'Key rotation rejected. Check current key.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // --- PROFILE USERNAME HANDLER ---
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim() || username.trim().length < 3) {
      setError('Username must be at least 3 characters in length.');
      return;
    }

    setProfileLoading(true);
    try {
      const res = await api.updateProfile({ username: username.trim() });
      setSuccess(`Operator identity successfully updated to "${res.username}".`);
    } catch (err) {
      setError(err.message || 'Failed to update operator profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  // --- IMMEDIATE BACKUP DOWNLOAD HANDLER ---
  const handleTriggerBackup = async () => {
    setError('');
    setSuccess('');
    setBackupLoading(true);

    try {
      const data = await api.createBackupSnapshot();
      const filename = data.filename || 'portfolio_snapshot.db.gz';
      const downloadUrl = data.download_url || `/api/admin/backups/${filename}/download`;
      const kb = ((data.size_bytes || 0) / 1024).toFixed(1);

      setSuccess(`Snapshot created: ${filename} (${kb} KB).`);
      fetchBackupStats();

      // Trigger download cleanly via hidden anchor link without in-flight fetch interception
      api.triggerFileDownload(downloadUrl, filename);
    } catch (err) {
      setError(err.message || 'Failed to generate online SQLite snapshot.');
    } finally {
      setBackupLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#080d1a] border border-cyan-500/40 rounded-2xl shadow-[0_0_40px_rgba(0,240,255,0.25)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Neon Gradient Top Bar */}
        <div className="h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 shrink-0"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-cyan-500/20 bg-[#0a0f24]/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-neon-cyan">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono font-bold text-base sm:text-lg text-slate-100 flex items-center gap-2">
                SUPERADMIN SECURITY & HARDENING
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  WAL ACTIVE
                </span>
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Operator credentials, live key rotation, and automated SQLite backup engine.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex items-center px-4 pt-3 border-b border-cyan-500/15 bg-[#050811]/60 gap-2 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => { setActiveTab('password'); setError(''); setSuccess(''); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-lg font-mono text-xs transition-all ${
              activeTab === 'password'
                ? 'bg-[#080d1a] border-t-2 border-l border-r border-cyan-400 text-cyan-300 font-semibold shadow-neon-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>KEY ROTATION</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('profile'); setError(''); setSuccess(''); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-lg font-mono text-xs transition-all ${
              activeTab === 'profile'
                ? 'bg-[#080d1a] border-t-2 border-l border-r border-cyan-400 text-cyan-300 font-semibold shadow-neon-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>OPERATOR PROFILE</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('backup'); setError(''); setSuccess(''); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-lg font-mono text-xs transition-all ${
              activeTab === 'backup'
                ? 'bg-[#080d1a] border-t-2 border-l border-r border-cyan-400 text-cyan-300 font-semibold shadow-neon-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>DB SNAPSHOTS & BACKUP</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Notification Alerts */}
          {error && (
            <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-500/60 text-rose-300 text-xs font-mono flex items-center gap-2 shadow-neon-crimson animate-fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-500/60 text-emerald-300 text-xs font-mono flex items-center gap-2 shadow-neon-emerald animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* TAB 1: KEY ROTATION */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-xs font-mono text-slate-300 leading-relaxed">
                <span className="text-cyan-400 font-bold block mb-1">CREDENTIAL ROTATION POLICY:</span>
                Provide your current access key to authorize cryptographic rotation. New security keys must be at least 8 characters in length.
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
                    Current Security Key *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    {showCurrentPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showCurrentPassword ? 'HIDE' : 'REVEAL'}</span>
                  </button>
                </div>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg cyber-input font-mono text-sm placeholder:text-slate-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
                      New Security Key *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      {showNewPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showNewPassword ? 'HIDE' : 'REVEAL'}</span>
                    </button>
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full px-3.5 py-2.5 rounded-lg cyber-input font-mono text-sm placeholder:text-slate-600"
                  />
                  {newPassword && (
                    <span className={`text-[10px] font-mono mt-1 block ${newPassword.length >= 8 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {newPassword.length >= 8 ? '✓ Length Requirement Met' : `${newPassword.length}/8 characters`}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Confirm New Key *
                  </label>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Repeat new key"
                    className="w-full px-3.5 py-2.5 rounded-lg cyber-input font-mono text-sm placeholder:text-slate-600"
                  />
                  {confirmNewPassword && (
                    <span className={`text-[10px] font-mono mt-1 block ${newPassword === confirmNewPassword ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {newPassword === confirmNewPassword ? '✓ Keys Match' : '✗ Keys Do Not Match'}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-cyan-500/15 flex justify-end">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-blue-600 text-black hover:from-cyan-300 hover:to-blue-500 shadow-neon-cyan transition-all disabled:opacity-50"
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>ROTATING KEY HASH...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>COMMIT KEY ROTATION</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: OPERATOR PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-xs font-mono text-slate-300 leading-relaxed">
                <span className="text-cyan-400 font-bold block mb-1">OPERATOR IDENTIFIER:</span>
                Modifying your superadmin handle updates active database records and issues a freshly signed JWT authorization token without requiring re-login.
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Superadmin Username *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    minLength={3}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg cyber-input font-mono text-sm placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-cyan-500/15 flex justify-end">
                <button
                  type="submit"
                  disabled={profileLoading || username.trim() === user?.username}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-blue-600 text-black hover:from-cyan-300 hover:to-blue-500 shadow-neon-cyan transition-all disabled:opacity-50"
                >
                  {profileLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>UPDATING IDENTITY...</span>
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4" />
                      <span>UPDATE OPERATOR IDENTITY</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: DB SNAPSHOTS & BACKUP ENGINE */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              {/* Architecture Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-[#050811] border border-cyan-500/30 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase block">Engine Mode</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    SQLite WAL Active
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#050811] border border-cyan-500/30 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase block">Snapshot Method</span>
                  <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    Atomic C-API Backup
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#050811] border border-cyan-500/30 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase block">Auto Prune Policy</span>
                  <span className="text-blue-400 font-bold flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" />
                    7-Day Retention
                  </span>
                </div>
              </div>

              {/* Telemetry Summary */}
              <div className="p-4 rounded-xl bg-[#050811] border border-cyan-500/20 space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2 text-slate-400">
                    <HardDrive className="w-4 h-4 text-cyan-400" />
                    Stored Backup Archives:
                  </span>
                  <span className="text-cyan-400 font-bold">
                    {backupStats?.total_snapshots ?? 0} Snapshot(s)
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Total Archive Storage:</span>
                  <span className="text-slate-200">
                    {backupStats?.total_size_bytes ? (backupStats.total_size_bytes / 1024).toFixed(1) + ' KB' : '0 KB'}
                  </span>
                </div>

                {backupStats?.latest_snapshot && (
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span className="truncate max-w-xs text-slate-400">
                      Latest: <code className="text-cyan-300">{backupStats.latest_snapshot.filename}</code>
                    </span>
                    <span>
                      {(backupStats.latest_snapshot.size_bytes / 1024).toFixed(1)} KB
                    </span>
                  </div>
                )}
              </div>

              {/* Action Banner */}
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-neon-cyan">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="font-mono font-bold text-xs text-slate-100 flex items-center gap-1.5 justify-center sm:justify-start">
                    <Download className="w-4 h-4 text-cyan-400" />
                    ON-DEMAND ATOMIC SNAPSHOT
                  </h4>
                  <p className="text-[11px] font-mono text-slate-400">
                    Triggers native online snapshot, gzip compression, and streams `.db.gz` file directly to browser.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTriggerBackup}
                  disabled={backupLoading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase bg-gradient-to-r from-cyan-400 to-blue-600 text-black hover:from-cyan-300 hover:to-blue-500 shadow-neon-cyan transition-all duration-200 shrink-0 disabled:opacity-50"
                >
                  {backupLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>SNAPSHOTING...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>DOWNLOAD .DB.GZ</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-[#050811]/90 border-t border-cyan-500/20 flex items-center justify-between text-[10px] font-mono text-slate-500 shrink-0">
          <span>PORTFOLIO SECURITY CORE // AES-256 + BCRYPT</span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 underline"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
}
