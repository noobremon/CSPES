import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs text-center space-y-4 my-4 max-w-2xl mx-auto">
          <div className="w-12 h-12 bg-[#FFF7E6] text-[#D97706] rounded-full flex items-center justify-center mx-auto border border-[#F3D19C] shadow-2xs">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
              {this.props.fallbackTitle || 'Display Module Recovered'}
            </h3>
            <p className="text-xs text-[#64748B] mt-1 max-w-md mx-auto">
              A view rendering notice occurred. The enterprise portal has isolated the fault to maintain system integrity.
            </p>
          </div>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-4 py-2 bg-gov-navy hover:bg-gov-navy-dark text-white font-semibold text-xs rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Module</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

