import { useEffect, useRef } from 'react';
import api from '../services/api';

/**
 * Checks whether the current runtime environment is a local loopback developer session.
 *
 * @returns {boolean} True if running on localhost / loopback without explicit tracking override
 */
export const isLocalhostEnvironment = () => {
  if (typeof window === 'undefined') return false;
  // Allow explicit opt-in via environment variable
  if (import.meta.env?.VITE_TRACK_LOCAL === 'true') {
    return false;
  }
  const hostname = window.location.hostname;
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '[::1]' ||
    hostname === '::1' ||
    hostname.endsWith('.local')
  );
};

/**
 * Checks whether a route path belongs to internal administration or authentication.
 *
 * @param {string} path Route path to inspect
 * @returns {boolean} True if the path should be excluded from telemetry tracking
 */
export const isInternalRoute = (path) => {
  if (!path) return false;
  const cleanPath = path.toLowerCase().trim();
  return (
    cleanPath.startsWith('/admin') ||
    cleanPath === '/login' ||
    cleanPath.startsWith('/login/') ||
    cleanPath.startsWith('/auth') ||
    cleanPath.startsWith('/api')
  );
};

/**
 * Generates or retrieves a persistent cryptographic UUIDv4 token for browser session tracking.
 */
function getOrCreateSessionId() {
  const SESSION_KEY = 'cyber_visitor_session_id';
  try {
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        sessionId = crypto.randomUUID();
      } else {
        sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      }
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  } catch (e) {
    return 'sess_fallback_' + Date.now();
  }
}

/**
 * Privacy-first, zero-third-party visitor telemetry tracker hook.
 * Strictly excludes internal administrative operations (/admin/*, /login, /auth/*).
 * Dispatches an initial anonymized packet and maintains time-on-page heartbeat for public visitors.
 *
 * @param {string} customPath Optional custom route path (defaults to window.location.pathname)
 */
export default function useVisitorTracker(customPath = null) {
  const startTimeRef = useRef(Date.now());
  const sessionIdRef = useRef(null);

  useEffect(() => {
    // 1. Strict Localhost / Dev Environment Exclusion: Never track local developer traffic
    if (isLocalhostEnvironment()) {
      return;
    }

    const currentPath = customPath || (typeof window !== 'undefined' ? window.location.pathname : '/');

    // 2. Strict Client-Side Route Exclusion: Abort immediately for internal routes
    if (isInternalRoute(currentPath)) {
      return;
    }

    // 2. Lazy initialize session ID only for confirmed public visitors
    if (!sessionIdRef.current) {
      sessionIdRef.current = getOrCreateSessionId();
    }
    const sessionId = sessionIdRef.current;
    const referrer = document.referrer || 'Direct';
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : null;

    // Reset start timer for route change
    startTimeRef.current = Date.now();

    // 3. Dispatch initial visit telemetry transmission
    api.recordVisit({
      session_id: sessionId,
      page_path: currentPath,
      referrer: referrer,
      screen_width: screenWidth,
    });

    // 4. Set up heartbeat interval (every 15 seconds)
    const intervalId = setInterval(() => {
      const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startTimeRef.current) / 1000));
      api.sendHeartbeat(sessionId, elapsedSeconds);
    }, 15000);

    // 5. Send final duration on tab hide or window unload using Beacon or Keepalive
    const handleUnloadOrHide = () => {
      const finalSeconds = Math.max(0, Math.floor((Date.now() - startTimeRef.current) / 1000));
      const payload = JSON.stringify({
        session_id: sessionId,
        duration_seconds: finalSeconds,
      });

      const url = `${api.baseUrl}/api/telemetry/heartbeat`;

      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
      } else {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    };

    window.addEventListener('beforeunload', handleUnloadOrHide);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        handleUnloadOrHide();
      }
    });

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', handleUnloadOrHide);
      handleUnloadOrHide();
    };
  }, [customPath]);

  return {
    sessionId: sessionIdRef.current,
    isInternal: isInternalRoute(customPath || (typeof window !== 'undefined' ? window.location.pathname : '/')),
  };
}
