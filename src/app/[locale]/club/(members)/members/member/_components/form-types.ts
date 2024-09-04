import { memberTypeEnum } from '@/server/db/schemas'
import type { RouterOutputs } from '@/trpc/react'
import { z } from 'zod'

export const getMemberFormSchema = (t: (key: string) => string) =>
  z
    .object({
      authId: z.string().min(1, 'authId is required').nullish(),
      firstName: z.string().min(1, t('firstName.error')).nullish(),
      lastName: z.string().min(1, t('lastName.error')).nullish(),
      type: memberTypeEnum,
      sex: z.enum(['male', 'female', '']).nullish(),
      avatar: z.string().nullable(),
      phone: z
        .string()
        .transform((value) => value.replace(/\D/g, ''))
        .optional(),
      email: z.string().email().nullish(),
    })
    .refine((data) => data.sex !== '', {
      path: ['sex'],
      message: t('sex.error'),
    })

export type MemberFormData = z.infer<ReturnType<typeof getMemberFormSchema>>

export type EditMemberFormDataProps = {
  member: NonNullable<RouterOutputs['club']['members']['getMemberById']>
}
