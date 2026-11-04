export type RuntimeEnvironment = Readonly<Record<string, string | undefined>>;

export function readRuntimeEnvironment(): RuntimeEnvironment {
  return typeof globalThis.process === 'undefined' ? {} : globalThis.process.env;
}
