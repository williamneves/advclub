import {
  boolean,
  serial, text
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { createTable } from '../funcs/createTable'
import { timestamps } from './_defaults'
import { sexEnum } from './enums'
import { z } from 'zod'

export const memberTypeEnum = z.enum(['parent', 'guardian', 'relative'])
export type MemberType = z.infer<typeof memberTypeEnum>


export const MembersTable = createTable('members', {
  id: serial('id').primaryKey(),
  authId: text('auth_id').notNull(),
  inactive: boolean('inactive').default(false),
  type: text('type').$type<MemberType>().notNull(),
  firstName: text('first_name').default(''),
  lastName: text('last_name').default(''),
  sex: sexEnum('sex').default(''),
  avatar: text('avatar'),
  phone: text('phone').default(''),
  email: text('email').default(''),
  ...timestamps,
})


export type MembersSelect = typeof MembersTable.$inferSelect
export type MembersInsert = typeof MembersTable.$inferInsert

const adjust = {
  type: memberTypeEnum
}

const membersSelectSchema = createSelectSchema(MembersTable, adjust)
const membersInsertSchema = createInsertSchema(MembersTable, adjust)

export const membersSchema = {
  select: membersSelectSchema,
  insert: membersInsertSchema,
  update: membersInsertSchema.partial(),
}
