import { relations } from 'drizzle-orm'
import { boolean, date, serial, text } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { createTable } from '../funcs/createTable'
import { timestamps } from './_defaults'
import { FamiliesTable } from './families'
import { sexEnum } from './enums'
import { FormsTable } from './forms'

export const KidsTable = createTable('kids', {
  id: serial('id').primaryKey(),
  familyId: serial('family_id').references(() => FamiliesTable.id, {
    onDelete: 'cascade',
  }),
  inactive: boolean('inactive').default(false),
  firstName: text('first_name').notNull().default(''),
  lastName: text('last_name').notNull().default(''),
  alias: text('alias').default(''),
  phoneNumber: text('phone_number').notNull().default(''),
  height: text('height').default(''),
  weight: text('weight').default(''),
  sex: sexEnum('sex'),
  avatar: text('avatar'),
  birthDate: date('birth_date', { mode: 'date' }).notNull(),
  notes: text('notes').default(''),
  ...timestamps,
})

export const kidsRelations = relations(KidsTable, ({ one, many}) => ({
  family: one(FamiliesTable, {
    fields: [KidsTable.familyId],
    references: [FamiliesTable.id],
    relationName: 'family_kids',
  }),
  forms: many(FormsTable),
}))

export type KidsSelect = typeof KidsTable.$inferSelect
export type KidsInsert = typeof KidsTable.$inferInsert
export type KidsUpdate = Partial<KidsInsert>

const kidsSelectSchema = createSelectSchema(KidsTable)
const kidsInsertSchema = createInsertSchema(KidsTable)

export const kidsSchema = {
  select: kidsSelectSchema,
  insert: kidsInsertSchema,
  update: kidsInsertSchema.partial(),
}
