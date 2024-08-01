import { relations } from 'drizzle-orm'
import { boolean, serial, text } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { createTable } from '../funcs/createTable'
import { timestamps } from './_defaults'
import { FamiliesTable } from './families'
import { sexEnum } from './enums'

export const Kidstable = createTable('kids', {
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
  ...timestamps,
})

export const kidsRelations = relations(Kidstable, ({ one }) => ({
  family: one(FamiliesTable, {
    fields: [Kidstable.familyId],
    references: [FamiliesTable.id],
    relationName: 'family_kids',
  })
}))

export type KidsSelect = typeof Kidstable.$inferSelect
export type KidsInsert = typeof Kidstable.$inferInsert
export type KidsUpdate = Partial<KidsInsert>

const kidsSelectSchema = createSelectSchema(Kidstable)
const kidsInsertSchema = createInsertSchema(Kidstable)

export const kidsSchema = {
  select: kidsSelectSchema,
  insert: kidsInsertSchema,
  update: kidsInsertSchema.partial(),
}
