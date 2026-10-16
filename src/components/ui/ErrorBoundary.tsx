import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangleIcon, RotateCcwIcon } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-6 my-4 text-center shadow-xs">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-3">
            <AlertTriangleIcon className="h-5 w-5" />
          </div>
          <h3 className="font-display text-[16px] font-semibold text-rose-900">
            {this.props.fallbackTitle || 'Unable to display this view'}
          </h3>
          <p className="mt-1 text-[13px] text-rose-700/80 max-w-[420px] mx-auto">
            {this.state.error?.message || 'An unexpected rendering issue occurred.'}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3.5 py-1.5 text-[13px] font-medium text-white hover:bg-rose-700 transition-colors shadow-2xs"
          >
            <RotateCcwIcon className="h-3.5 w-3.5" />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
