import 'server-only';
import { env } from '../env.mjs';

export { env };
export type ServerEnv = typeof env;
export default env;

