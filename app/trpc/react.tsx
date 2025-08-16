'use client';

import { useState } from 'react';
import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import SuperJSON from 'superjson';

import { env } from '@/env'; // ✅ Import validated env vars
import type { AppRouter } from '../server/api/root';

let clientQueryClientSingleton: QueryClient | undefined = undefined;

const getQueryClient = () => {
  if (typeof window === 'undefined') {
    // Server: create a new QueryClient instance
    return new QueryClient();
  }

  // Browser: use singleton instance
  clientQueryClientSingleton ??= new QueryClient();
  return clientQueryClientSingleton;
};

export const api = createTRPCReact<AppRouter>();

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: op =>
            process.env.NODE_ENV === 'development' ||
            (op.direction === 'down' && op.result instanceof Error),
        }),
        httpBatchLink({
          url: getBaseUrl() + '/api/trpc',
          transformer: SuperJSON,
          headers: () => ({
            'x-trpc-source': 'nextjs-react',
          }),
        }),
      ],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </api.Provider>
    </QueryClientProvider>
  );
}

function getBaseUrl() {
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:3000';
}
