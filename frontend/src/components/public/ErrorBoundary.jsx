import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Public Portfolio ErrorBoundary]', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6 text-center font-mono">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#090f20]/95 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,240,255,0.15)] space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold tracking-widest text-white uppercase">
                TELEMETRY RECOVERY NODE
              </h3>
              <p className="text-xs text-slate-400">
                A localized component rendering exception was isolated safely.
              </p>
            </div>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 text-xs font-semibold tracking-wider transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>RE-INITIALIZE SECTION</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
