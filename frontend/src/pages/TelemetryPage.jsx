import React, { useState, useEffect } from 'react';
import {
  Activity,
  Globe,
  Radio,
  Clock,
  Compass,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Layers,
  ArrowUpRight,
  Eye,
  Cpu
} from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import api from '../services/api';

export default function TelemetryPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [overview, setOverview] = useState({
    total_views: 0,
    unique_sessions_total: 0,
    unique_sessions_24h: 0,
    unique_sessions_7d: 0,
    unique_sessions_30d: 0,
    avg_duration_seconds: 0,
    bounce_rate: 0,
    total_countries: 0,
    top_referrer: 'Direct',
    top_referrer_percent: 0,
  });
  const [sources, setSources] = useState([]);
  const [locations, setLocations] = useState({ countries: [], cities: [] });
  const [devices, setDevices] = useState({ device_types: [], browsers: [], operating_systems: [] });
  const [livePackets, setLivePackets] = useState([]);

  // Purge Dialog & Toast State
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [purgeLoading, setPurgeLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchTelemetry = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const [ovData, srcData, locData, devData, liveData] = await Promise.all([
        api.getTelemetryOverview(),
        api.getTelemetrySources(),
        api.getTelemetryLocations(),
        api.getTelemetryDevices(),
        api.getTelemetryLive(20),
      ]);

      setOverview(ovData);
      setSources(srcData.sources || []);
      setLocations(locData || { countries: [], cities: [] });
      setDevices(devData || { device_types: [], browsers: [], operating_systems: [] });
      setLivePackets(liveData || []);
    } catch (err) {
      console.error('Failed to load telemetry dataset:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  // Auto-refresh interval (12 seconds)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchTelemetry(true);
    }, 12000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleConfirmPurge = async () => {
    setPurgeLoading(true);
    try {
      const res = await api.purgeTelemetry();
      setIsPurgeModalOpen(false);
      setToastMessage(res.message || 'Telemetry transmissions flushed.');
      setTimeout(() => setToastMessage(null), 4000);
      fetchTelemetry();
    } catch (err) {
      alert(`Purge failed: ${err.message}`);
    } finally {
      setPurgeLoading(false);
    }
  };

  const formatSeconds = (sec) => {
    if (!sec || sec <= 0) return '0s';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const getDeviceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-3.5 h-3.5 text-cyan-400" />;
      case 'tablet':
        return <Tablet className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <Monitor className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Live Status & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-mono font-bold tracking-wide text-slate-100">
              AUDIENCE INTELLIGENCE
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono shadow-neon-emerald animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              LIVE SENSORS ACTIVE
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            Zero-third-party, privacy-preserving visitor telemetry mesh with salted SHA-256 IP anonymization.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs border transition-all ${
              autoRefresh
                ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300 shadow-neon-cyan'
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
            title="Toggle 12s live polling"
          >
            <Radio className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-pulse text-cyan-400' : ''}`} />
            <span>AUTO-SYNC: {autoRefresh ? 'ON' : 'PAUSED'}</span>
          </button>

          {/* Manual Refresh */}
          <button
            onClick={() => fetchTelemetry(false)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>SCAN</span>
          </button>

          {/* Purge Logs Button */}
          <button
            onClick={() => setIsPurgeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs bg-rose-950/20 border border-rose-500/30 text-rose-400 hover:bg-rose-900/40 hover:text-rose-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>PURGE LOGS</span>
          </button>
        </div>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Unique Visitors */}
        <div className="cyber-card p-4 rounded-xl border border-cyan-500/20 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-mono tracking-wider uppercase">Active Traffic</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-slate-100">{overview.unique_sessions_24h}</span>
            <span className="text-[11px] font-mono text-cyan-400 font-semibold">24H UNIQUES</span>
          </div>
          <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>All-time: <strong className="text-slate-200">{overview.unique_sessions_total}</strong> sessions</span>
            <span>Hits: <strong className="text-slate-200">{overview.total_views}</strong></span>
          </div>
        </div>

        {/* Card 2: Dwell & Engagement */}
        <div className="cyber-card p-4 rounded-xl border border-cyan-500/20 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-mono tracking-wider uppercase">Dwell Time</span>
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-slate-100">{formatSeconds(overview.avg_duration_seconds)}</span>
            <span className="text-[11px] font-mono text-blue-400 font-semibold">AVG DURATION</span>
          </div>
          <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Bounce: <strong className="text-amber-400">{overview.bounce_rate}%</strong></span>
            <span className="text-emerald-400 font-semibold">ENGAGED</span>
          </div>
        </div>

        {/* Card 3: Top Acquisition Channel */}
        <div className="cyber-card p-4 rounded-xl border border-cyan-500/20 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-mono tracking-wider uppercase">Top Channel</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-mono font-bold text-slate-100 truncate">{overview.top_referrer}</span>
          </div>
          <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Share: <strong className="text-emerald-400">{overview.top_referrer_percent}%</strong></span>
            <span>Acquisition</span>
          </div>
        </div>

        {/* Card 4: Global Reach */}
        <div className="cyber-card p-4 rounded-xl border border-cyan-500/20 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-mono tracking-wider uppercase">Global Footprint</span>
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-slate-100">{overview.total_countries}</span>
            <span className="text-[11px] font-mono text-rose-400 font-semibold">COUNTRIES</span>
          </div>
          <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Client IP: <strong className="text-cyan-400">SHA-256</strong></span>
            <span className="text-emerald-400">GDPR Clean</span>
          </div>
        </div>
      </div>

      {/* Analytics Midsection: Acquisition Channels & Device Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Acquisition Matrix (1 Column) */}
        <div className="cyber-card p-5 rounded-xl border border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-mono font-bold text-sm text-slate-100 flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              ACQUISITION CHANNELS
            </h3>
            <span className="text-[10px] font-mono text-slate-400">{sources.length} SOURCES</span>
          </div>

          {sources.length === 0 ? (
            <div className="py-8 text-center space-y-1.5">
              <Compass className="w-6 h-6 text-slate-600 mx-auto" />
              <p className="text-xs font-mono text-slate-400">Awaiting external referral traffic...</p>
              <p className="text-[10px] font-mono text-slate-600">Zero localhost/dev data captured.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {sources.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                      {item.name}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      <strong className="text-cyan-300">{item.count}</strong> ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(item.percentage, 4)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Device & Platform Matrix (1 Column) */}
        <div className="cyber-card p-5 rounded-xl border border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-mono font-bold text-sm text-slate-100 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              CLIENT PLATFORMS
            </h3>
            <span className="text-[10px] font-mono text-slate-400">HARDWARE & OS</span>
          </div>

          {/* Device Types */}
          {!devices.device_types || devices.device_types.length === 0 ? (
            <div className="py-8 text-center space-y-1.5">
              <Cpu className="w-6 h-6 text-slate-600 mx-auto" />
              <p className="text-xs font-mono text-slate-400">Awaiting hardware telemetry...</p>
              <p className="text-[10px] font-mono text-slate-600">Client platforms register on visitor hits.</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Device Form Factor</span>
                <div className="grid grid-cols-3 gap-2">
                  {devices.device_types?.map((dev, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#050811] border border-slate-800 text-center space-y-1">
                      <div className="flex justify-center">{getDeviceIcon(dev.name)}</div>
                      <div className="text-[11px] font-mono font-bold text-slate-200">{dev.name}</div>
                      <div className="text-[10px] font-mono text-cyan-400">{dev.percentage}%</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Operating Systems */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Operating Systems</span>
                <div className="space-y-2">
                  {devices.operating_systems?.slice(0, 4).map((osItem, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300">{osItem.name}</span>
                      <div className="flex items-center gap-2 w-32 justify-end">
                        <div className="w-20 bg-slate-900 h-1 rounded-full overflow-hidden">
                          <div className="bg-blue-400 h-full" style={{ width: `${osItem.percentage}%` }}></div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold">{osItem.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Geographic Distribution (1 Column) */}
        <div className="cyber-card p-5 rounded-xl border border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-mono font-bold text-sm text-slate-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              GEOGRAPHIC ORIGINS
            </h3>
            <span className="text-[10px] font-mono text-slate-400">REGIONS</span>
          </div>

          {locations.countries?.length === 0 ? (
            <div className="py-8 text-center space-y-1.5">
              <Globe className="w-6 h-6 text-slate-600 mx-auto" />
              <p className="text-xs font-mono text-slate-400">Awaiting geographic origins...</p>
              <p className="text-[10px] font-mono text-slate-600">CDN GeoIP coordinates stream on public arrival.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {locations.countries.slice(0, 5).map((loc, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-200 font-semibold">{loc.name}</span>
                    <span className="text-[11px] font-mono text-cyan-400">{loc.count} hits ({loc.percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(loc.percentage, 4)}%` }}
                    ></div>
                  </div>
                </div>
              ))}

              {/* Cities pills */}
              {locations.cities?.length > 0 && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block mb-2">
                    Top Metropolitan Hubs
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {locations.cities.slice(0, 6).map((city, cIdx) => (
                      <span
                        key={cIdx}
                        className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#050811] text-slate-300 border border-slate-800"
                      >
                        {city.city} ({city.count})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Real-time Visitor Transmission Feed */}
      <div className="cyber-card rounded-xl border border-cyan-500/20 overflow-hidden space-y-0">
        <div className="p-4 bg-[#080d1a] border-b border-cyan-500/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="font-mono font-bold text-sm text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              LIVE TELEMETRY TRANSMISSIONS
            </h3>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Chronological log of the latest anonymized visitor events captured by edge sensors.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-black/60 text-cyan-400 border border-cyan-500/30 shrink-0">
            {livePackets.length} PACKETS IN BUFFER
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center font-mono text-xs text-cyan-400 animate-pulse flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>INTERCEPTING TELEMETRY PACKETS...</span>
          </div>
        ) : livePackets.length === 0 ? (
          <div className="py-16 text-center space-y-3 px-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center shadow-neon-cyan">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <h4 className="font-mono font-bold text-sm text-slate-200 tracking-wide">
              AWAITING LIVE EXTERNAL TRANSMISSIONS...
            </h4>
            <p className="text-xs font-mono text-slate-400 max-w-md mx-auto leading-relaxed">
              All synthetic test records purged. Edge sensors are active and listening.
              Telemetry packets from genuine external visitors will stream live here once public traffic arrives.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#050811]/90 border-b border-cyan-500/20 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Status</th>
                  <th className="p-3">Time Ago</th>
                  <th className="p-3">Route Path</th>
                  <th className="p-3">Origin / Geo</th>
                  <th className="p-3">Referrer</th>
                  <th className="p-3">Environment</th>
                  <th className="p-3 text-right">Dwell Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {livePackets.map((pkt) => (
                  <tr key={pkt.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        SYN
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 whitespace-nowrap text-[11px]">
                      {pkt.time_ago}
                    </td>
                    <td className="p-3 font-semibold text-cyan-300 max-w-xs truncate">
                      {pkt.page_path}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-black/60 text-[10px] text-slate-300 border border-slate-800">
                        {pkt.country} {pkt.city && pkt.city !== 'Unknown' ? `(${pkt.city})` : ''}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-cyan-950/30 text-[10px] text-cyan-400 border border-cyan-500/30 font-semibold">
                        {pkt.referrer}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 whitespace-nowrap text-[11px]">
                      <div className="inline-flex items-center gap-1.5">
                        {getDeviceIcon(pkt.device_type)}
                        <span>{pkt.browser} on {pkt.os}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap font-bold text-slate-200">
                      {formatSeconds(pkt.duration_seconds)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Purge Dialog */}
      <ConfirmDialog
        isOpen={isPurgeModalOpen}
        title="PURGE AUDIENCE TELEMETRY BUFFER"
        message="Are you certain you wish to completely wipe all historical visitor sessions and transmission logs from SQLite? This cannot be undone."
        confirmText="PURGE TELEMETRY"
        loading={purgeLoading}
        onConfirm={handleConfirmPurge}
        onClose={() => setIsPurgeModalOpen(false)}
        onCancel={() => setIsPurgeModalOpen(false)}
      />

      {/* Cyber Neon Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#080d1a] border border-cyan-500/50 shadow-neon-cyan animate-fade-in text-cyan-300 font-mono text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
