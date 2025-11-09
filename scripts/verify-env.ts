import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import dotenv from 'dotenv';
import { envSchema, REQUIRED_SERVER_KEYS } from '../app/lib/env-schema';

type EnvValues = Record<string, string>;

interface EnvSource {
  name: string;
  values: EnvValues;
  path?: string;
}

function parseEnvFile(filePath: string): EnvValues {
  if (!existsSync(filePath)) {
    return {};
  }

  const contents = readFileSync(filePath, 'utf8');
  return dotenv.parse(contents);
}

function parseVercelFile(filePath: string): EnvValues {
  if (!existsSync(filePath)) {
    return {};
  }

  const contents = readFileSync(filePath, 'utf8');
  try {
    const parsed = JSON.parse(contents);
    if (Array.isArray(parsed)) {
      return parsed.reduce<Record<string, string>>((acc, item) => {
        if (item?.key && typeof item.value === 'string') {
          acc[item.key] = item.value;
        }
        return acc;
      }, {});
    }

    if (parsed && typeof parsed === 'object') {
      const envNode = parsed.env ?? parsed.production ?? parsed.preview ?? parsed;
      return Object.entries(envNode as Record<string, string | { value?: string }>)
        .map(([key, value]) => {
          if (typeof value === 'string') return [key, value];
          if (value && typeof value === 'object' && typeof value.value === 'string') {
            return [key, value.value];
          }
          return null;
        })
        .filter((entry): entry is [string, string] => Array.isArray(entry))
        .reduce<EnvValues>((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});
    }
  } catch (error) {
    console.warn(`Failed to parse Vercel env file at ${filePath}:`, error);
  }

  return {};
}

function trimValues(values: EnvValues): EnvValues {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, value.trim()]),
  );
}

function collectSources(): EnvSource[] {
  const projectRoot = process.cwd();
  const sources: EnvSource[] = [
    {
      name: 'process.env',
      values: trimValues(
        Object.entries(process.env)
          .filter(([, value]) => typeof value === 'string')
          .reduce<EnvValues>((acc, [key, value]) => {
            acc[key] = value as string;
            return acc;
          }, {}),
      ),
    },
  ];

  const dotEnvPath = path.join(projectRoot, '.env');
  const dotEnvLocalPath = path.join(projectRoot, '.env.local');
  const vercelFlagIndex = process.argv.findIndex((arg) => arg === '--vercel');
  const vercelPathArg = vercelFlagIndex >= 0 ? process.argv[vercelFlagIndex + 1] : undefined;

  if (existsSync(dotEnvPath)) {
    sources.push({
      name: '.env',
      path: dotEnvPath,
      values: trimValues(parseEnvFile(dotEnvPath)),
    });
  }

  if (existsSync(dotEnvLocalPath)) {
    sources.push({
      name: '.env.local',
      path: dotEnvLocalPath,
      values: trimValues(parseEnvFile(dotEnvLocalPath)),
    });
  }

  if (vercelPathArg) {
    const resolved = path.isAbsolute(vercelPathArg)
      ? vercelPathArg
      : path.join(projectRoot, vercelPathArg);
    sources.push({
      name: 'vercel',
      path: resolved,
      values: trimValues(parseVercelFile(resolved)),
    });
  }

  return sources;
}

function reportMissingKeys(sources: EnvSource[]) {
  const missingEverywhere = REQUIRED_SERVER_KEYS.filter(
    (key) => !sources.some((source) => source.values[key]),
  );

  const warnings: string[] = [];

  for (const source of sources) {
    const missing = REQUIRED_SERVER_KEYS.filter((key) => !source.values[key]);
    if (missing.length > 0) {
      warnings.push(`${source.name}: ${missing.join(', ')}`);
    }
  }

  if (warnings.length > 0) {
    console.warn('Missing keys by source:\n', warnings.join('\n'));
  }

  if (missingEverywhere.length > 0) {
    console.error(
      'Environment audit failed. The following keys are missing from all sources:\n',
      missingEverywhere.join(', '),
    );
    return false;
  }

  return true;
}

function reportSchemaViolations(sources: EnvSource[]) {
  const failures: string[] = [];

  const dotEnvValues = sources.find((source) => source.name === '.env')?.values ?? {};
  const dotEnvLocalValues = sources.find((source) => source.name === '.env.local')?.values ?? {};

  for (const source of sources) {
    if (source.name !== 'process.env' && source.name !== 'vercel') {
      continue;
    }

    const candidateValues =
      source.name === 'process.env'
        ? {
            ...dotEnvValues,
            ...dotEnvLocalValues,
            ...source.values,
          }
        : source.values;

    const result = envSchema.safeParse(candidateValues);
    if (!result.success) {
      const issues = result.error.issues.map((issue) => issue.path.join('.')).join(', ') || 'unknown';
      failures.push(`${source.name}: ${issues}`);
    }
  }

  if (failures.length > 0) {
    console.error('Environment schema validation failed:\n', failures.join('\n'));
    return false;
  }

  return true;
}

function reportMismatchedValues(sources: EnvSource[]) {
  const mismatches: string[] = [];
  const keyValues = new Map<string, Set<string>>();
  const valueOrigins = new Map<string, Map<string, string>>();

  for (const source of sources) {
    for (const key of REQUIRED_SERVER_KEYS) {
      const value = source.values[key];
      if (typeof value === 'string' && value.length > 0) {
        if (!keyValues.has(key)) {
          keyValues.set(key, new Set<string>());
        }
        keyValues.get(key)!.add(value);

        if (!valueOrigins.has(key)) {
          valueOrigins.set(key, new Map<string, string>());
        }
        valueOrigins
          .get(key)!
          .set(source.name, `${value.slice(0, 4)}…${value.slice(-4)}`);
      }
    }
  }

  for (const [key, values] of keyValues.entries()) {
    if (values.size > 1) {
      const details = Array.from(valueOrigins.get(key)?.entries() ?? [])
        .map(([source, masked]) => `${source}=${masked}`)
        .join(', ');
      mismatches.push(`${key} has differing values: ${details}`);
    }
  }

  if (mismatches.length > 0) {
    console.warn('Environment mismatches detected:\n', mismatches.join('\n'));
  }
}

async function main() {
  const sources = collectSources();

  const hasAllKeys = reportMissingKeys(sources);
  const schemaValid = reportSchemaViolations(sources);

  reportMismatchedValues(sources);

  if (!hasAllKeys || !schemaValid) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('verify-env failed:', error);
  process.exit(1);
});

