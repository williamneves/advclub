import { relations } from 'drizzle-orm'
import { serial, text } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { createTable } from '../funcs/createTable'
import { timestamps } from './_defaults'
import { Kidstable } from './kids'
import { ParentsTable } from './parents'
import { FormsTable } from './forms'

export const FamiliesTable = createTable('families', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull().default(''),
  phoneNumber: text('phone_number').notNull().default(''),
  email: text('email').notNull().default(''),
  ...timestamps,
})

export const familyRelations = relations(FamiliesTable, ({ many }) => ({
  kids: many(Kidstable, { relationName: 'family_kids' }),
  parents: many(ParentsTable, { relationName: 'family_parents' }),
  forms: many(FormsTable, { relationName: 'family_forms' }),
}))

export type FamilySelect = typeof FamiliesTable.$inferSelect
export type FamilyInsert = typeof FamiliesTable.$inferInsert
export type FamilyUpdate = Partial<FamilyInsert>

const familySelectSchema = createSelectSchema(FamiliesTable)
const familyInsertSchema = createInsertSchema(FamiliesTable)

export const familySchema = {
  select: familySelectSchema,
  insert: familyInsertSchema,
  update: familyInsertSchema.partial(),
}
