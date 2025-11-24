'use client';

import React, { Component, type ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { OmButton as Button } from '@/app/components/ui/om/OmButton';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ShopErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      tags: { section: 'shop' },
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="container mx-auto px-4 py-12">
          <div className="backdrop-blur-lg bg-black/60 rounded-2xl p-8 text-center max-w-md mx-auto border border-white/20">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-pink-200 mb-4">
              Shop Temporarily Unavailable
            </h2>
            <p className="text-white/70 mb-6">
              Something went wrong loading the shop. Please try again.
            </p>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              variant="primary"
            >
              Retry
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
