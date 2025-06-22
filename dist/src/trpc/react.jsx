'use strict';
'use client';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.api = void 0;
exports.TRPCReactProvider = TRPCReactProvider;
const react_1 = require('react');
const react_query_1 = require('@trpc/react-query');
const client_1 = require('@trpc/client');
const react_query_2 = require('@tanstack/react-query');
const superjson_1 = __importDefault(require('superjson'));
const query_client_1 = require('./query-client');
const env_1 = require('@/env'); // ✅ Import validated env vars
let clientQueryClientSingleton = undefined;
const getQueryClient = () => {
  if (typeof window === 'undefined') {
    // Server: create a new QueryClient instance
    return (0, query_client_1.createQueryClient)();
  }
  // Browser: use singleton instance
  clientQueryClientSingleton ??= (0, query_client_1.createQueryClient)();
  return clientQueryClientSingleton;
};
exports.api = (0, react_query_1.createTRPCReact)();
function TRPCReactProvider(props) {
  const queryClient = getQueryClient();
  const [trpcClient] = (0, react_1.useState)(() =>
    exports.api.createClient({
      links: [
        (0, client_1.loggerLink)({
          enabled: op =>
            env_1.env.NODE_ENV === 'development' ||
            (op.direction === 'down' && op.result instanceof Error),
        }),
        (0, client_1.httpBatchStreamLink)({
          transformer: superjson_1.default,
          url: getBaseUrl() + '/api/trpc',
          headers: () => {
            const headers = new Headers();
            headers.set('x-trpc-source', 'nextjs-react');
            return headers;
          },
        }),
      ],
    })
  );
  return (
    <react_query_2.QueryClientProvider client={queryClient}>
      <exports.api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </exports.api.Provider>
    </react_query_2.QueryClientProvider>
  );
}
function getBaseUrl() {
  if (typeof window !== 'undefined') return window.location.origin;
  if (env_1.env.VERCEL_URL) return `https://${env_1.env.VERCEL_URL}`;
  return `http://localhost:${env_1.env.PORT ?? 3000}`;
}
