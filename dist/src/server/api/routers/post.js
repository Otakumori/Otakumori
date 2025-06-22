'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.postRouter = void 0;
const zod_1 = require('zod');
const trpc_1 = require('~/server/api/trpc');
const schema_1 = require('~/server/db/schema');
exports.postRouter = (0, trpc_1.createTRPCRouter)({
  hello: trpc_1.publicProcedure
    .input(zod_1.z.object({ text: zod_1.z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  create: trpc_1.protectedProcedure
    .input(zod_1.z.object({ name: zod_1.z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(schema_1.posts).values({
        name: input.name,
        createdById: ctx.session.user.id,
      });
    }),
  getLatest: trpc_1.protectedProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.query.posts.findFirst({
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });
    return post ?? null;
  }),
  getSecretMessage: trpc_1.protectedProcedure.query(() => {
    return 'you can now see this secret message!';
  }),
});
