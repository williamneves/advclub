import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { timestamp } from 'drizzle-orm/pg-core'
import { z } from 'zod'

dayjs.extend(utc)
dayjs.extend(timezone)

export const timestamps = {
  createdAt: timestamp('created_at', {
    mode: 'date',
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', {
    mode: 'date',
    withTimezone: true,
  }).$onUpdateFn(() => dayjs().toDate()),
}

export const genderEnum = z
  .enum(['male', 'female', 'other', 'prefer_not_to_say', ''])
  .default('')
export const genderLabels = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
  prefer_not_to_say: 'Prefer not to say',
}
export type Gender = z.infer<typeof genderEnum>
