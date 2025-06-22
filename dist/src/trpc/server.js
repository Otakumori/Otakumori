'use strict';
var _a;
Object.defineProperty(exports, '__esModule', { value: true });
exports.HydrateClient = exports.api = void 0;
require('server-only');
const rsc_1 = require('@trpc/react-query/rsc');
const headers_1 = require('next/headers');
const react_1 = require('react');
const root_1 = require('~/server/api/root');
const trpc_1 = require('~/server/api/trpc');
const query_client_1 = require('./query-client');
/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = (0, react_1.cache)(async () => {
  const heads = new Headers(await (0, headers_1.headers)());
  heads.set('x-trpc-source', 'rsc');
  return (0, trpc_1.createTRPCContext)({
    headers: heads,
  });
});
const getQueryClient = (0, react_1.cache)(query_client_1.createQueryClient);
const caller = (0, root_1.createCaller)(createContext);
(_a = (0, rsc_1.createHydrationHelpers)(caller, getQueryClient)),
  (exports.api = _a.trpc),
  (exports.HydrateClient = _a.HydrateClient);
