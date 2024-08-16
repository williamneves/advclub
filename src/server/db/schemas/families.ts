import { relations } from 'drizzle-orm'
import { boolean, serial, text, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { createTable } from '../funcs/createTable'
import { timestamps } from './_defaults'
import { KidsTable } from './kids'
import { ParentsTable } from './parents'

export const FamiliesTable = createTable('families', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull(),
  inactive: boolean('inactive').default(false),
  userId: text('user_id').notNull(),
  name: text('name').notNull().default(''),
  familyAvatar: text('family_avatar').default(''),
  phoneNumber: text('phone_number').notNull().default(''),
  email: text('email').notNull().default(''),
  streetAddress: text('street_address').default(''),
  city: text('city').default(''),
  state: text('state').default(''),
  zipCode: text('zip_code').default(''),
  ...timestamps,
})

export const familyRelations = relations(FamiliesTable, ({ many }) => ({
  kids: many(KidsTable, { relationName: 'family_kids' }),
  parents: many(ParentsTable, { relationName: 'family_parents' }),
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
