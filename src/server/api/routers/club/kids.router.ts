import { eq } from 'drizzle-orm'
import { z } from 'zod'

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/api/trpc'

import { KidsTable, kidsSchema } from '@/server/db/schemas/kids'

export const kidsRouter = createTRPCRouter({
  getAllKids: publicProcedure.query(async ({ ctx }) => {
    const kids = await ctx.db.query.KidsTable.findMany({
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
      const kid = await ctx.db.query.KidsTable.findFirst({
        where: (kids, { eq }) => eq(kids.id, input.id),
        with: {
          family: true,
        },
      })
      return kid
    }),
  getKidsByLoggedInFamily: protectedProcedure.query(async ({ ctx }) => {
    const family = await ctx.db.query.FamiliesTable.findFirst({
      where: (family, { eq }) => eq(family.userId, ctx.userId),
    })

    if (!family) {
      return []
    }

    const kids = await ctx.db.query.KidsTable.findMany({
      where: (kids, { eq }) => eq(kids.familyId, family.id),
      orderBy: (kids, { asc }) => asc(kids.firstName),
    })
    return kids
  }),

  getKidsByFamilyId: protectedProcedure
    .input(z.object({ familyId: z.number() }))
    .query(async ({ ctx, input }) => {
      const kids = await ctx.db.query.KidsTable.findMany({
        where: (kids, { eq }) => eq(kids.familyId, input.familyId),
        orderBy: (kids, { asc }) => asc(kids.firstName),
      })
      return kids
    }),

  createKid: protectedProcedure
    .input(kidsSchema.insert)
    .mutation(async ({ ctx, input }) => {
      const kid = await ctx.db.insert(KidsTable).values(input).returning({
        id: KidsTable.id,
      })
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
        .update(KidsTable)
        .set(input.data)
        .where(eq(KidsTable.id, input.id))
      return kid
    }),

  inactivateKid: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const kid = await ctx.db
        .update(KidsTable)
        .set({ inactive: true })
        .where(eq(KidsTable.id, input.id))
      return kid
    }),

  deleteKid: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const kid = await ctx.db
        .delete(KidsTable)
        .where(eq(KidsTable.id, input.id))
      return kid
    }),
})
