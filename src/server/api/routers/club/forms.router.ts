import { eq } from 'drizzle-orm'
import { z } from 'zod'

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/api/trpc'

import {
  FormsTable,
  formSchemas,
  formStatusEnum,
} from '@/server/db/schemas/forms'

export const formsRouter = createTRPCRouter({
  getAllForms: publicProcedure.query(async ({ ctx }) => {
    const forms = await ctx.db.query.FormsTable.findMany({
      with: {
        family: true,
      },
      orderBy: (forms, { desc }) => desc(forms.createdAt),
    })
    return forms
  }),

  getFormById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const form = await ctx.db.query.FormsTable.findFirst({
        where: (forms, { eq }) => eq(forms.id, input.id),
        with: {
          family: true,
        },
      })
      return form
    }),

  getFormBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const form = await ctx.db.query.FormsTable.findFirst({
        where: (forms, { eq }) => eq(forms.slug, input.slug),
        with: {
          family: true,
        },
      })
      return form
    }),

  getFormsByFamilyId: protectedProcedure
    .input(z.object({ familyId: z.number() }))
    .query(async ({ ctx, input }) => {
      const forms = await ctx.db.query.FormsTable.findMany({
        where: (forms, { eq }) => eq(forms.familyId, input.familyId),
        orderBy: (forms, { desc }) => desc(forms.createdAt),
      })
      return forms
    }),

  getFormsByStatus: protectedProcedure
    .input(z.object({ status: formStatusEnum }))
    .query(async ({ ctx, input }) => {
      const forms = await ctx.db.query.FormsTable.findMany({
        where: (forms, { eq }) => eq(forms.status, input.status),
        orderBy: (forms, { desc }) => desc(forms.createdAt),
      })
      return forms
    }),

  createForm: protectedProcedure
    .input(formSchemas.insert)
    .mutation(async ({ ctx, input }) => {
      const form = await ctx.db.insert(FormsTable).values(input)
      return form
    }),

  updateForm: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: formSchemas.update,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const form = await ctx.db
        .update(FormsTable)
        .set(input.data)
        .where(eq(FormsTable.id, input.id))
      return form
    }),

  submitForm: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const form = await ctx.db
        .update(FormsTable)
        .set({
          status: 'SUBMITTED',
          submittedAt: new Date(),
        })
        .where(eq(FormsTable.id, input.id))
      return form
    }),

  closeForm: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(['APPROVED', 'REJECTED']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const form = await ctx.db
        .update(FormsTable)
        .set({
          status: input.status,
          closedAt: new Date(),
        })
        .where(eq(FormsTable.id, input.id))
      return form
    }),

  deleteForm: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const form = await ctx.db
        .delete(FormsTable)
        .where(eq(FormsTable.id, input.id))
      return form
    }),
})
