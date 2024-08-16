import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/api/trpc'

import {
  ParentsTable,
  parentsSchema,
  parentsGuardiansType,
} from '@/server/db/schemas/parents'

export const parentsRouter = createTRPCRouter({
  getAllParents: publicProcedure.query(async ({ ctx }) => {
    const parents = await ctx.db.query.ParentsTable.findMany({
      with: {
        family: true,
      },
      orderBy: (parents, { desc }) => desc(parents.createdAt),
    })
    return parents
  }),

  getParentById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const parent = await ctx.db.query.ParentsTable.findFirst({
        where: (parents, { eq }) => eq(parents.id, input.id),
        with: {
          family: true,
        },
      })
      return parent
    }),

  getParentsByLoggedInFamily: protectedProcedure.query(async ({ ctx }) => {
    const family = await ctx.db.query.FamiliesTable.findFirst({
      where: (family, { eq }) => eq(family.userId, ctx.userId),
    })

    if (!family) {
      return []
    }

    const parents = await ctx.db.query.ParentsTable.findMany({
      where: (parents, { eq }) => eq(parents.familyId, family.id),
      orderBy: (parents, { desc }) => [
        desc(parents.main),
        desc(parents.lastName),
      ],
    })
    return parents
  }),
  getParentsByFamilyId: protectedProcedure
    .input(z.object({ familyId: z.number() }))
    .query(async ({ ctx, input }) => {
      const parents = await ctx.db.query.ParentsTable.findMany({
        where: (parents, { eq }) => eq(parents.familyId, input.familyId),
        orderBy: (parents, { desc }) => [
          desc(parents.main),
          desc(parents.lastName),
        ],
      })
      return parents
    }),

  getParentsByType: protectedProcedure
    .input(z.object({ type: parentsGuardiansType }))
    .query(async ({ ctx, input }) => {
      const parents = await ctx.db.query.ParentsTable.findMany({
        where: (parents, { eq }) => eq(parents.type, input.type),
        orderBy: (parents, { asc }) => asc(parents.lastName),
      })
      return parents
    }),

  createParent: protectedProcedure
    .input(parentsSchema.insert)
    .mutation(async ({ ctx, input }) => {
      const parent = await ctx.db.insert(ParentsTable).values(input).returning({
        id: ParentsTable.id,
      })
      return parent
    }),
  updateParent: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: parentsSchema.update,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const parent = await ctx.db
        .update(ParentsTable)
        .set(input.data)
        .where(eq(ParentsTable.id, input.id))
      return parent
    }),

  setMainParent: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        familyId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // First, set all parents in the family to not main
      await ctx.db
        .update(ParentsTable)
        .set({ main: false })
        .where(eq(ParentsTable.familyId, input.familyId))

      // Then, set the specified parent as main
      const parent = await ctx.db
        .update(ParentsTable)
        .set({ main: true })
        .where(
          and(
            eq(ParentsTable.id, input.id),
            eq(ParentsTable.familyId, input.familyId),
          ),
        )
      return parent
    }),

  inactivateParent: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const parent = await ctx.db
        .update(ParentsTable)
        .set({ inactive: true })
        .where(eq(ParentsTable.id, input.id))
      return parent
    }),

  deleteParent: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const parent = await ctx.db
        .delete(ParentsTable)
        .where(eq(ParentsTable.id, input.id))
      return parent
    }),
})
