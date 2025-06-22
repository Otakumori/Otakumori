'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.createQueryClient = void 0;
const react_query_1 = require('@tanstack/react-query');
const superjson_1 = __importDefault(require('superjson'));
const createQueryClient = () =>
  new react_query_1.QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 30 * 1000,
      },
      dehydrate: {
        serializeData: superjson_1.default.serialize,
        shouldDehydrateQuery: query =>
          (0, react_query_1.defaultShouldDehydrateQuery)(query) || query.state.status === 'pending',
      },
      hydrate: {
        deserializeData: superjson_1.default.deserialize,
      },
    },
  });
exports.createQueryClient = createQueryClient;
