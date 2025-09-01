"use client";
import React from "react";

interface ErrorBoundaryState {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // Ship to API for logs
    fetch("/api/log-client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "react-error-boundary",
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
        errorInfo: {
          componentStack: errorInfo.componentStack,
        },
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      }),
    }).catch(() => {
      // Silently fail if logging fails
    });
  }

  render() {
    if (this.state.error) {
      // Return fallback UI or null for production
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Minimal error UI for development
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        return (
          <div className="p-4 bg-red-900 border border-red-500 rounded-lg text-white">
            <h2 className="text-lg font-bold mb-2">React Error Boundary Caught:</h2>
            <p className="text-sm mb-2">{this.state.error.message}</p>
            <details className="text-xs">
              <summary className="cursor-pointer">Stack Trace</summary>
              <pre className="mt-2 whitespace-pre-wrap">{this.state.error.stack}</pre>
            </details>
            {this.state.errorInfo && (
              <details className="text-xs mt-2">
                <summary className="cursor-pointer">Component Stack</summary>
                <pre className="mt-2 whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
              </details>
            )}
          </div>
        );
      }
      
      // Production: return null to avoid breaking the page
      return null;
    }

    return this.props.children;
  }
}
