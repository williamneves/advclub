import { relations } from 'drizzle-orm'
import { boolean, serial, text } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { createTable } from '../funcs/createTable'
import { timestamps } from './_defaults'
import { FamiliesTable } from './families'
import { sexEnum } from './enums'
import { z } from 'zod'

export const parentsGuardiansType = z.enum(['parent', 'guardian', 'relative'])
export type ParentsGuardiansType = z.infer<typeof parentsGuardiansType>

export const ParentsTable = createTable('parents', {
  id: serial('id').primaryKey(),
  inactive: boolean('inactive').default(false),
  main: boolean('main').default(false),
  familyId: serial('family_id').references(() => FamiliesTable.id),
  type: text('type').$type<ParentsGuardiansType>().notNull(),
  firstName: text('first_name').default(''),
  lastName: text('last_name').default(''),
  sex: sexEnum('sex').default(''),
  avatar: text('avatar'),
  phone: text('phone').default(''),
  email: text('email').default(''),
  ...timestamps,
})

export const parentsRelations = relations(ParentsTable, ({ one }) => ({
  family: one(FamiliesTable, {
    fields: [ParentsTable.familyId],
    references: [FamiliesTable.id],
    relationName: 'family_parents',
  }),
}))

export type ParentsSelect = typeof ParentsTable.$inferSelect
export type ParentsInsert = typeof ParentsTable.$inferInsert

const adjust = {
  type: parentsGuardiansType,
}

const parentsSelectSchema = createSelectSchema(ParentsTable, adjust)
const parentsInsertSchema = createInsertSchema(ParentsTable, adjust)

export const parentsSchema = {
  select: parentsSelectSchema,
  insert: parentsInsertSchema,
  update: parentsInsertSchema.partial(),
}
