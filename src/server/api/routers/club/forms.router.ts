import { eq, getTableColumns } from 'drizzle-orm'
import { z } from 'zod'

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/api/trpc'

import { FormsTable, formsSchema } from '@/server/db/schemas/forms'
import {
  FamiliesTable,
  familySchema,
  kidsSchema,
  KidsTable,
  ParentsTable,
} from '@/server/db/schemas'

export const formsRouter = createTRPCRouter({
  getForms: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.FormsTable.findMany()
  }),
  getFormByID: publicProcedure
    .input(
      z.object({
        id: formsSchema.select.shape.id,
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.query.FormsTable.findFirst({
        with: {
          kid: true,
          guardian: true,
        },
        where: eq(FormsTable.id, input.id),
      })
    }),
  getFormsBySlug: publicProcedure
    .input(
      z.object({
        slug: formsSchema.select.shape.slug,
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.query.FormsTable.findMany({
        with: {
          kid: true,
          guardian: true,
        },
        where: eq(FormsTable.slug, input.slug),
      })
    }),
  getFormByKidId: publicProcedure
    .input(
      z.object({
        kidId: kidsSchema.select.shape.id,
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.query.FormsTable.findFirst({
        with: {
          kid: true,
          guardian: true,
        },
        where: eq(FormsTable.kidId, input.kidId),
      })
    }),
  getFormsByFamilyId: publicProcedure
    .input(
      z.object({
        familyId: familySchema.select.shape.id,
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db
        .select({
          ...getTableColumns(FormsTable),
          guardian: {
            ...getTableColumns(ParentsTable),
          },
          kid: {
            ...getTableColumns(KidsTable),
          },
        })
        .from(FormsTable)
        .leftJoin(ParentsTable, eq(FormsTable.guardianId, ParentsTable.id))
        .leftJoin(KidsTable, eq(FormsTable.kidId, KidsTable.id))
        .where(eq(ParentsTable.familyId, input.familyId))
    }),
  getFormsByLoggedInFamily: protectedProcedure.query(({ ctx }) => {
    return ctx.db
      .select({
        ...getTableColumns(FormsTable),
        guardian: {
          ...getTableColumns(ParentsTable),
        },
        kid: {
          ...getTableColumns(KidsTable),
        },
      })
      .from(FormsTable)
      .leftJoin(ParentsTable, eq(FormsTable.guardianId, ParentsTable.id))
      .leftJoin(KidsTable, eq(FormsTable.kidId, KidsTable.id))
      .leftJoin(FamiliesTable, eq(FamiliesTable.id, ParentsTable.familyId))
      .where(eq(FamiliesTable.userId, ctx.userId))
  }),

  // MUTATIONS
  createForm: protectedProcedure
    .input(formsSchema.insert)
    .mutation(({ ctx, input }) => {
      return ctx.db
        .insert(FormsTable)
        .values(input)
        .returning({
          ...getTableColumns(FormsTable),
        })
    }),
  updateFormByID: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: formsSchema.update,
     })
    )
    .mutation(({ ctx, input }) => {
      return ctx.db
        .update(FormsTable)
        .set(input.data)
        .where(eq(FormsTable.id, input.id))
    }),
  reviewFormByID: protectedProcedure
    .input(
      formsSchema.update.extend({
        id: z.number(),
        reviewedBy: z.number(),
        reviewedAt: z.date(),
        status: z.enum(['approved', 'rejected']),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db
        .update(FormsTable)
        .set(input)
        .where(eq(FormsTable.id, input.id))
    }),
  deleteFormByID: protectedProcedure
    .input(
      z.object({
        id: formsSchema.select.shape.id,
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.delete(FormsTable).where(eq(FormsTable.id, input.id))
    }),
})
