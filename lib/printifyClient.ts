import axios from 'axios';
import { env } from '@/env';

const token = (env.PRINTIFY_API_KEY || '').trim();

export const printify = axios.create({
  baseURL: env.PRINTIFY_API_URL ?? 'https://api.printify.com/v1',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  // optional: set a short timeout to avoid hanging builds
  timeout: 12000,
});
