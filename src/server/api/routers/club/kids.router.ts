import { eq } from 'drizzle-orm'
import { z } from 'zod'

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/api/trpc'

import { Kidstable, kidsSchema } from '@/server/db/schemas/kids'

export const kidsRouter = createTRPCRouter({
  getAllKids: publicProcedure.query(async ({ ctx }) => {
    const kids = await ctx.db.query.Kidstable.findMany({
      with: {
        family: true,
      },
      orderBy: (kids, { desc }) => desc(kids.createdAt),
    })
    return kids
  }),

  getKidById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const kid = await ctx.db.query.Kidstable.findFirst({
        where: (kids, { eq }) => eq(kids.id, input.id),
        with: {
          family: true,
        },
      })
      return kid
    }),

  getKidsByFamilyId: protectedProcedure
    .input(z.object({ familyId: z.number() }))
    .query(async ({ ctx, input }) => {
      const kids = await ctx.db.query.Kidstable.findMany({
        where: (kids, { eq }) => eq(kids.familyId, input.familyId),
        orderBy: (kids, { asc }) => asc(kids.firstName),
      })
      return kids
    }),

  createKid: protectedProcedure
    .input(kidsSchema.insert)
    .mutation(async ({ ctx, input }) => {
      const kid = await ctx.db.insert(Kidstable).values(input)
      return kid
    }),

  updateKid: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: kidsSchema.update,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const kid = await ctx.db
        .update(Kidstable)
        .set(input.data)
        .where(eq(Kidstable.id, input.id))
      return kid
    }),

  inactivateKid: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const kid = await ctx.db
        .update(Kidstable)
        .set({ inactive: true })
        .where(eq(Kidstable.id, input.id))
      return kid
    }),

  deleteKid: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const kid = await ctx.db
        .delete(Kidstable)
        .where(eq(Kidstable.id, input.id))
      return kid
    }),
})
