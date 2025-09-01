"use client";
import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; msg?: string };

export default class DiagErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(err: any) { return { hasError: true, msg: String(err?.message || err) }; }
  componentDidCatch(error: any, info: any) {
    console.error("[DiagErrorBoundary] caught", { error, info });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-xl border border-red-500/30 bg-red-500/5 text-red-300">
          <p className="font-semibold">Mini-Games canvas crashed.</p>
          <p className="text-sm opacity-80 mt-1">{this.state.msg || "Check console for stack."}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
