"use client";
import { useEffect } from "react";

type ClientErrorPayload =
  | { type: "error"; message: string; stack?: string; filename?: string; lineno?: number; colno?: number }
  | { type: "unhandledrejection"; reason: string }
  | { type: "console-error"; message: string; args: string[] };

export default function ClientErrorTrap() {
  useEffect(() => {
    const send = async (payload: ClientErrorPayload) => {
      try {
        await fetch("/api/log-client-error", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            timestamp: new Date().toISOString(),
            userAgent: window.navigator.userAgent,
            url: window.location.href,
          }),
          keepalive: true, // lets it flush during page unload
        });
      } catch {
        // swallow — logging should never crash the app
      }
    };

    const onErr = (e: ErrorEvent) => {
      void send({
        type: "error",
        message: e.message ?? "Unknown error",
        stack: e.error?.stack,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
      });
    };

    const onRej = (e: PromiseRejectionEvent) => {
      void send({
        type: "unhandledrejection",
        reason: typeof e.reason === "string" ? e.reason : JSON.stringify(e.reason),
      });
    };

    // Also catch console errors (for debugging)
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Log to our API if it looks like a real error
      const errorString = args.join(' ');
      if (errorString.includes('Error:') || errorString.includes('TypeError:') || errorString.includes('ReferenceError:')) {
        void send({
          type: "console-error",
          message: errorString,
          args: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)),
        });
      }
      // Still call original console.error
      originalConsoleError.apply(console, args);
    };

    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", onRej);
    
    return () => {
      window.removeEventListener("error", onErr);
      window.removeEventListener("unhandledrejection", onRej);
      console.error = originalConsoleError;
    };
  }, []);

  return null;
}
