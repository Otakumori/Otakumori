import { z } from 'zod';

export const collectPetalsReq = z.object({
  source: z
    .enum([
      'clicker',
      'mini-game:petal-run',
      'mini-game:memory',
      'mini-game:rhythm',
      'admin',
      'purchase',
    ]),
  amount: z.number().int().positive().max(200),
});
export type CollectPetalsReq = z.infer<typeof collectPetalsReq>;

export const walletRes = z.object({ balance: z.number().int(), updatedAt: z.string().optional() });
export type WalletRes = z.infer<typeof walletRes>;

