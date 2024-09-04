import { eq } from 'drizzle-orm'
import { z } from 'zod'

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/api/trpc'

import {
  MembersTable,
  membersSchema,
  memberTypeEnum,
} from '@/server/db/schemas/members'

export const membersRouter = createTRPCRouter({
  getAllMembers: publicProcedure.query(async ({ ctx }) => {
    const members = await ctx.db.query.MembersTable.findMany({
      orderBy: (members, { desc }) => desc(members.createdAt),
    })
    return members
  }),

  getMemberById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const member = await ctx.db.query.MembersTable.findFirst({
        where: (members, { eq }) => eq(members.id, input.id),
      })
      return member
    }),

  getMemberByAuthId: protectedProcedure
    .input(z.object({ authId: z.string() }))
    .query(async ({ ctx, input }) => {
      const member = await ctx.db.query.MembersTable.findFirst({
        where: (members, { eq }) => eq(members.authId, input.authId),
      })
      return member
    }),

  getMembersByType: protectedProcedure
    .input(z.object({ type: memberTypeEnum }))
    .query(async ({ ctx, input }) => {
      const members = await ctx.db.query.MembersTable.findMany({
        where: (members, { eq }) => eq(members.type, input.type),
        orderBy: (members, { asc }) => asc(members.lastName),
      })
      return members
    }),

  getAllAuthUsers: protectedProcedure.query(async ({ ctx }) => {
    return ctx.supabaseAdmin.auth.admin.listUsers()
  }),

  createMember: protectedProcedure
    .input(membersSchema.insert)
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.db.insert(MembersTable).values(input)
      return member
    }),

  updateMember: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: membersSchema.update,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.db
        .update(MembersTable)
        .set(input.data)
        .where(eq(MembersTable.id, input.id))
      return member
    }),

  inactivateMember: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.db
        .update(MembersTable)
        .set({ inactive: true })
        .where(eq(MembersTable.id, input.id))
      return member
    }),

  deleteMember: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.db
        .delete(MembersTable)
        .where(eq(MembersTable.id, input.id))
      return member
    }),
})
