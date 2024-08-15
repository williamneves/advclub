import type { RouterOutputs } from '@/trpc/react'
import { z } from 'zod'

export const getKidFormSchema = (t: (key: string) => string) =>
  z
    .object({
      firstName: z.string().min(1, t('firstName.error')).optional(),
      lastName: z.string().min(1, t('lastName.error')).optional(),
      sex: z.enum(['male', 'female', '']).nullish(),
      birthDate: z.coerce
        .string()
        .transform((value) => new Date(value).toISOString()),
      phoneNumber: z
        .string()
        .transform((value) => value.replace(/\D/g, ''))
        .optional(),
      alias: z.string().optional(),
      height: z.string().optional(),
      weight: z.string().optional(),
      avatar: z.string().nullable(),
      notes: z.string().optional(),
    })
    .refine((data) => data.sex !== '', {
      path: ['sex'],
      message: t('sex.error'),
    })

export type KidFormData = z.infer<ReturnType<typeof getKidFormSchema>>

export type EditKidFormDataProps = {
  kid: NonNullable<RouterOutputs['club']['kids']['getKidById']>
}
