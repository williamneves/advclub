import { pgEnum } from 'drizzle-orm/pg-core'

import { z } from 'zod'

export const SEX_OPTIONS = ['male', 'female', ''] as const

export const sexEnumSchema = z.enum(SEX_OPTIONS)

export type Sex = z.infer<typeof sexEnumSchema>

export const sexEnum = pgEnum('sex', SEX_OPTIONS)
