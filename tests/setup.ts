import { setupServer } from "msw/node";
import { handlers } from "./msw/handlers";
import { beforeAll, afterEach, afterAll } from "vitest";
import "./test-env";

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
