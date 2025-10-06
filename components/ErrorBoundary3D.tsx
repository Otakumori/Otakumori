'use client';

import React, { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary3D extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('3D Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center w-full h-full bg-black/20 backdrop-blur-sm rounded-lg border border-red-500/30">
            <div className="text-center p-6">
              <div className="text-red-400 text-lg mb-2">
                <span role="img" aria-label="Warning">
                  ⚠️
                </span>
              </div>
              <h3 className="text-white font-medium mb-2">3D Component Error</h3>
              <p className="text-gray-300 text-sm mb-4">
                The 3D graphics component encountered an error. This might be due to WebGL
                compatibility issues.
              </p>
              <button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
