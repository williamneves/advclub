import { eq } from 'drizzle-orm'
import { z } from 'zod'

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/api/trpc'

import { FamiliesTable, familySchema } from '@/server/db/schemas/families'
import { revalidatePath } from 'next/cache'

export const familiesRouter = createTRPCRouter({
  getAllFamilies: publicProcedure.query(async ({ ctx }) => {
    const families = await ctx.db.query.FamiliesTable.findMany({
      with: {
        kids: true,
        parents: true,
      },
      orderBy: (families, { desc }) => desc(families.createdAt),
    })
    return families
  }),

  getLoggedInFamily: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      return null
    }

    const family = await ctx.db.query.FamiliesTable.findFirst({
      where: (families, { eq }) => eq(families.userId, ctx.userId),
      with: {
        kids: true,
        parents: true,
      },
    })
    if (!family) {
      return null
    }
    return family
  }),

  getFamilyById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const family = await ctx.db.query.FamiliesTable.findFirst({
        where: (families, { eq }) => eq(families.id, input.id),
        with: {
          kids: true,
          parents: true,
        },
      })
      return family
    }),

  createFamily: protectedProcedure
    .input(familySchema.insert.omit({ userId: true }))
    .mutation(async ({ ctx, input }) => {
      const family = await ctx.db.insert(FamiliesTable).values({
        ...input,
        userId: ctx.userId,
      })
      revalidatePath('/', 'layout')
      return family
    }),

  updateFamily: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: familySchema.update,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const family = await ctx.db
        .update(FamiliesTable)
        .set(input.data)
        .where(eq(FamiliesTable.id, input.id))
      return family
    }),
  updateLoggedInFamily: protectedProcedure
    .input(familySchema.update)
    .mutation(async ({ ctx, input }) => {
      const family = await ctx.db
        .update(FamiliesTable)
        .set(input)
        .where(eq(FamiliesTable.userId, ctx.userId))
      
      revalidatePath('/', 'layout')
      return family
    }),

  deleteFamily: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const family = await ctx.db
        .delete(FamiliesTable)
        .where(eq(FamiliesTable.id, input.id))
      return family
    }),
})
