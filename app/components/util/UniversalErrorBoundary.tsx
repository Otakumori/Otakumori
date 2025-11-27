'use client';

import { Component, ReactNode } from 'react';
import { logger } from '@/app/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  sectionName?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class UniversalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const sectionName = this.props.sectionName || 'Unknown';
    
    // Log to Sentry/logger
    logger.error('Error boundary caught error', {
      extra: {
        section: sectionName,
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      },
    }, error);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 rounded-lg border border-rose-500/30 bg-rose-900/20">
          <h3 className="text-lg font-semibold text-rose-300 mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-rose-200 mb-4">
            {this.props.sectionName 
              ? `An error occurred in ${this.props.sectionName}.`
              : 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-sm transition"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

