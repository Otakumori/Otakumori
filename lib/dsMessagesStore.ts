 
 
import { redis } from '@/lib/redis';
import { DSMessage } from '@/lib/z';
import { randomUUID } from 'crypto';

const mem = new Map<string, DSMessage[]>();
const key = (slug: string) => `dsmsg:${slug}`;

export async function listDSMessages(slug: string) {
  if (!redis) return mem.get(slug) ?? [];
  const raw = await redis.get<string>(key(slug));
  return raw ? (JSON.parse(raw) as DSMessage[]) : [];
}

async function save(slug: string, arr: DSMessage[]) {
  if (!redis) {
    mem.set(slug, arr);
    return;
  }
  await redis.setex(key(slug), 86400, JSON.stringify(arr));
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
  if (kind === 'up') arr[i].appraisals += 1;
  else arr[i].disparages += 1;
  await save(slug, arr);
  return arr[i];
}
