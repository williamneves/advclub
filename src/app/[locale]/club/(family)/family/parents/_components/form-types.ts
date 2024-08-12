import { parentsGuardiansType } from '@/server/db/schemas'
import type { RouterOutputs } from '@/trpc/react'
import { z } from 'zod'

export const getParentFormSchema = (t: (key: string) => string) =>
  z
    .object({
      firstName: z.string().min(1, t('firstName.error')).nullish(),
      lastName: z.string().min(1, t('lastName.error')).nullish(),
      type: parentsGuardiansType,
      sex: z.enum(['male', 'female', '']).nullish(),
      birthDate: z.coerce.string().nullable(),
      // remove all non-digit characters
      phone: z
        .string()
        .transform((value) => value.replace(/\D/g, ''))
        .nullish(),
      email: z.string().email().nullish(),
      allowToPickUp: z.boolean().default(false).nullish(),
      allowToAssignSignatures: z.boolean().default(false).nullish(),
      main: z.boolean().default(false),
      avatar: z.string().nullish(),
      driverLicense: z.string().nullish(),
      useFamilyAddress: z.boolean().default(false),
      streetAddress: z.string().optional().default(''),
      city: z.string().optional().default(''),
      state: z.string().optional().default(''),
      zipCode: z.string().optional().default(''),
    })
    .refine((data) => data.sex !== '', {
      path: ['sex'],
      message: t('sex.error'),
    })
    .refine((data) => data.streetAddress !== '' && !data.state, {
      path: ['state'],
      message: t('state.error'),
    })

export type ParentFormData = z.infer<ReturnType<typeof getParentFormSchema>>

export type EditParentFormDataProps = {
  parent: NonNullable<RouterOutputs['club']['parents']['getParentById']>
}
