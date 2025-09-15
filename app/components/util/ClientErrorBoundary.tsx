'use client';
import React, { useState } from 'react';

export default function ClientErrorBoundary({ children }: { children: React.ReactNode }) {
  const [err, setErr] = useState<Error | null>(null);

  if (err) {
    return (
      <div className="p-6 text-rose-300 bg-rose-900/20 rounded-lg border border-rose-500/30">
        <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
        <p className="text-sm text-rose-200 mb-4">
          This component failed to load. Please refresh the page or try again later.
        </p>
        <button
          onClick={() => setErr(null)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-sm transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return <ErrorBoundaryImpl onError={setErr}>{children}</ErrorBoundaryImpl>;
}

// Minimal boundary using a class component under the hood
class ErrorBoundaryImpl extends React.Component<
  { children: React.ReactNode; onError: (error: Error) => void },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return null; // Let parent handle the error display
    }

    return this.props.children;
  }
}
