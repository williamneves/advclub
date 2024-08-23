import { relations } from 'drizzle-orm'
import { boolean, serial, text } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { createTable } from '../funcs/createTable'
import { timestamps } from './_defaults'
import { FamiliesTable } from './families'
import { sexEnum } from './enums'
import { z } from 'zod'
import { date } from 'drizzle-orm/pg-core'
export const parentsGuardiansType = z.enum(['parent', 'guardian', 'relative'])
export type ParentsGuardiansType = z.infer<typeof parentsGuardiansType>

export const ParentsTable = createTable('parents', {
  id: serial('id').primaryKey(),
  inactive: boolean('inactive').default(false),
  main: boolean('main').default(false),
  familyId: serial('family_id').references(() => FamiliesTable.id, {
    onDelete: 'cascade',
  }),
  type: text('type').$type<ParentsGuardiansType>().notNull(),
  firstName: text('first_name').default(''),
  lastName: text('last_name').default(''),
  birthDate: date('birth_date', { mode: 'date' }),
  sex: sexEnum('sex').default(''),
  avatar: text('avatar').default(''),
  driverLicense: text('driver_license').default(''),
  phone: text('phone').default(''),
  email: text('email').default(''),
  useFamilyAddress: boolean('use_family_address').default(true),
  streetAddress: text('street_address').default(''),
  city: text('city').default(''),
  state: text('state').default(''),
  zipCode: text('zip_code').default(''),
  allowToPickUp: boolean('allow_to_pick_up').default(false),
  allowToAssignSignatures: boolean('allow_to_assign_signatures').default(false),
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
  birthDate: z.coerce.string().transform((val) => new Date(val).toISOString()),
}

const parentsSelectSchema = createSelectSchema(ParentsTable, adjust)
const parentsInsertSchema = createInsertSchema(ParentsTable, adjust)

export const parentsSchema = {
  select: parentsSelectSchema,
  insert: parentsInsertSchema,
  update: parentsInsertSchema.partial(),
}
