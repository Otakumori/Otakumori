/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { Redis } from "@upstash/redis";

let redisSingleton: Redis | null = null;

export function getRedis(): Redis | null {
	const url = process.env.UPSTASH_REDIS_REST_URL;
	const token = process.env.UPSTASH_REDIS_REST_TOKEN;
	if (!url || !token) return null;
	if (redisSingleton) return redisSingleton;
	redisSingleton = new Redis({ url, token });
	return redisSingleton;
}
