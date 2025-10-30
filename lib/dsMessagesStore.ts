import { getRedis } from '@/app/lib/redis';
import { DSMessage } from '@/lib/z';
import { randomUUID } from 'crypto';

const mem = new Map<string, DSMessage[]>();
const key = (slug: string) => `dsmsg:${slug}`;

export async function listDSMessages(slug: string) {
  try {
    const redis = await getRedis();
    const raw = await redis.get(key(slug));
    return raw ? (JSON.parse(raw) as DSMessage[]) : [];
  } catch {
    return mem.get(slug) ?? [];
  }
}

async function save(slug: string, arr: DSMessage[]) {
  try {
    const redis = await getRedis();
    await redis.set(key(slug), JSON.stringify(arr), 'EX', 86400);
  } catch {
    mem.set(slug, arr);
  }
}

export async function addDSMessage(slug: string, phrase: string, userId: string | null) {
  const msg: DSMessage = {
    id: randomUUID(),
    postSlug: slug,
    userId,
    phrase: phrase.trim(),
    createdAt: new Date().toISOString(),
    appraisals: 0,
    disparages: 0,
  };
  const parsed = DSMessage.parse(msg);
  const arr = await listDSMessages(slug);
  arr.unshift(parsed);
  await save(slug, arr);
  return parsed;
}

export async function voteDSMessage(slug: string, id: string, kind: 'up' | 'down') {
  const arr = await listDSMessages(slug);
  const i = arr.findIndex((x) => x.id === id);
  if (i < 0) return null;
  const message = arr[i];
  if (!message) return null;
  if (kind === 'up') message.appraisals += 1;
  else message.disparages += 1;
  await save(slug, arr);
  return message;
}
