import { relations } from 'drizzle-orm'
import {
  index,
  integer,
  jsonb,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { createTable } from '../funcs/createTable'
import { timestamps } from './_defaults'
import { KidsTable } from './kids'
import { ParentsTable } from './parents'
import { MembersTable } from './members'
import { z } from 'zod'

export const formsStatusArray = [
  'draft',
  'submitted',
  'approved',
  'rejected',
] as const
export const formsStatusEnum = z.enum(formsStatusArray)
export type FormsStatus = z.infer<typeof formsStatusEnum>

export const FormsTable = createTable(
  'forms',
  {
    id: serial('id').primaryKey(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status').$type<FormsStatus>().default('draft').notNull(),
    guardianId: integer('guardian_id')
      .references(() => ParentsTable.id)
      .notNull(),
    kidId: integer('kid_id')
      .references(() => KidsTable.id)
      .notNull(),
    reviewedBy: integer('reviewed_by_member_id').references(
      () => MembersTable.id,
    ),
    fields: jsonb('fields').$type<Record<string, unknown>>().default({}),
    submittedAt: timestamp('submitted_at', {
      mode: 'date',
      withTimezone: true,
    }),
    approvedAt: timestamp('approved_at', {
      mode: 'date',
      withTimezone: true,
    }),
    rejectedAt: timestamp('rejected_at', {
      mode: 'date',
      withTimezone: true,
    }),

    ...timestamps,
  },
  (table) => ({
    slugUniqueIndex: index('forms_slug_uniq').on(table.slug),
  }),
)

export const formsRelations = relations(FormsTable, ({ one }) => ({
  guardian: one(ParentsTable, {
    fields: [FormsTable.guardianId],
    references: [ParentsTable.id],
  }),
  kid: one(KidsTable, {
    fields: [FormsTable.kidId],
    references: [KidsTable.id],
  }),
  reviewedByMember: one(MembersTable, {
    fields: [FormsTable.reviewedBy],
    references: [MembersTable.id],
  }),
}))

export type FormsSelect = typeof FormsTable.$inferSelect
export type FormsInsert = typeof FormsTable.$inferInsert
export type FormsUpdate = Partial<FormsInsert>

const adjustments = {
  status: formsStatusEnum,
  fields: z.record(z.string(), z.unknown()),
}

const formsSelectSchema = createSelectSchema(FormsTable, {
  ...adjustments,
})
const formsInsertSchema = createInsertSchema(FormsTable, {
  ...adjustments,
})

export const formsSchema = {
  select: formsSelectSchema,
  insert: formsInsertSchema,
  update: formsInsertSchema.partial(),
}
