// DEPRECATED: This component is a duplicate. Use app\lib\printify\printifyClient.ts instead.
import axios from 'axios';
import { env } from '@/env.mjs';

const token = (env.PRINTIFY_API_KEY || '').trim();

export const printify = axios.create({
  baseURL: 'https://api.printify.com/v1',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  // optional: set a short timeout to avoid hanging builds
  timeout: 12000,
});
