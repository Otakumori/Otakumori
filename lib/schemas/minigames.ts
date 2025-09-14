import { z } from 'zod';

export const gameIdSchema = z.enum(['petal-run', 'memory', 'rhythm']);

export const startSessionReq = z.object({
  game: gameIdSchema,
});
export type StartSessionReq = z.infer<typeof startSessionReq>;

export const startSessionRes = z.object({
  runId: z.string(),
  startedAt: z.string(),
});
export type StartSessionRes = z.infer<typeof startSessionRes>;

export const submitScoreReq = z.object({
  runId: z.string().min(1),
  game: gameIdSchema,
  score: z.number().int().min(0).max(10_000_000),
});
export type SubmitScoreReq = z.infer<typeof submitScoreReq>;

export const submitScoreRes = z.object({
  ok: z.literal(true),
  score: z.number().int(),
  petalsGranted: z.number().int().nonnegative(),
  balance: z.number().int().nonnegative().optional(),
});
export type SubmitScoreRes = z.infer<typeof submitScoreRes>;

