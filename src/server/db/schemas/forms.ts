import { relations } from 'drizzle-orm'
import { jsonb, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { createTable } from '../funcs/createTable'
import { timestamps } from './_defaults'
import { z } from 'zod'
import { FamiliesTable } from './families'
import { Kidstable } from './kids'

export const formStatusEnum = z.enum([
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'REJECTED',
])
export type FormStatus = z.infer<typeof formStatusEnum>

export const FormsTable = createTable('forms', {
  id: serial('id').primaryKey(),
  title: text('title').notNull().default(''),
  familyId: serial('family_id').references(() => FamiliesTable.id),
  kidId: serial('kid_id').references(() => Kidstable.id),
  slug: text('slug').notNull().default('').unique(),
  status: text('status').$type<FormStatus>().default('DRAFT'),
  fields: jsonb('fields').notNull().default('{}'),
  submittedAt: timestamp('submitted_at', {
    mode: 'date',
    withTimezone: true,
  }),
  closedAt: timestamp('closed_at', {
    mode: 'date',
    withTimezone: true,
  }),
  ...timestamps,
})

export const FormsRelations = relations(FormsTable, ({ one }) => ({
  family: one(FamiliesTable, {
    fields: [FormsTable.familyId],
    references: [FamiliesTable.id],
    relationName: 'family_forms',
  }),
  kid: one(Kidstable, {
    fields: [FormsTable.kidId],
    references: [Kidstable.id],
    relationName: 'kids_forms',
  }),
}))

export type FormSelect = typeof FormsTable.$inferSelect
export type FormInsert = typeof FormsTable.$inferInsert
export type FormUpdate = Partial<FormInsert>

const adjust = {
  status: formStatusEnum,
}

const formSelectSchema = createSelectSchema(FormsTable, adjust)
const formInsertSchema = createInsertSchema(FormsTable, adjust)

export const formSchemas = {
  select: formSelectSchema,
  insert: formInsertSchema,
  update: formInsertSchema.partial(),
}
