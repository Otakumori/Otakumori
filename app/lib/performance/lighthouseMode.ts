import 'server-only';
import { env } from '@/env';

export function isLighthouseCiRuntime(): boolean {
  return env.LIGHTHOUSE_CI === '1';
}
