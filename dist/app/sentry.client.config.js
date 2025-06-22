'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
const Sentry = __importStar(require('@sentry/react'));
const tracing_1 = require('@sentry/tracing');
const replay_1 = require('@sentry/replay');
Sentry.init({
  dsn: 'https://388fd3ecd8a41c61b6cf6c9e7f42e15d@o4509520271114240.ingest.us.sentry.io/4509520275701760',
  sendDefaultPii: true,
  tracesSampleRate: 1.0, // Adjust for production
  integrations: [new tracing_1.BrowserTracing(), new replay_1.Replay()],
  // You can add more options here (release, environment, etc.)
});
// Usage: Wrap your app with Sentry.ErrorBoundary for client-side error catching
// Example:
// <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
//   <App />
// </Sentry.ErrorBoundary>
// To test Sentry, add a button in your app:
// <button onClick={() => {throw new Error('This is your first error!')}}>Break the world</button>
