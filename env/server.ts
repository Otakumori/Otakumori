import 'server-only';
import { env as validatedEnv } from '../env.mjs';

export type ServerEnv = typeof validatedEnv;

let cachedEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (typeof window !== 'undefined') {
    throw new Error('serverEnv imported on the client. Use /env/client in client code.');
  }

  if (!cachedEnv) {
    cachedEnv = validatedEnv;
  }

  return cachedEnv;
}

export const env = getServerEnv();
export default env;

