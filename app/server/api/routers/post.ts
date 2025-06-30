import { z } from 'zod';
import { desc } from 'drizzle-orm';

import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { posts } from '../../db/schema';

export const postRouter = createTRPCRouter({
  hello: publicProcedure.input(z.object({ text: z.string() })).query(({ input }) => {
    return {
      greeting: `Hello ${input.text}`,
    };
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(posts).values({
        name: input.name,
        createdById: ctx.session.user.id,
      });
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.select().from(posts).orderBy(desc(posts.createdAt)).limit(1);

    return post[0] ?? null;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return 'you can now see this secret message!';
  }),
});
