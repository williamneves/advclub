import { z } from 'zod'

export const mediaConsentFormFieldSchema = z
  .object({
    grade: z.string().default('').nullish(),
    firstPhoneType: z.enum(['home', 'cell']).default('cell').nullish(),
    secondPhoneType: z.enum(['home', 'cell']).default('cell').nullish(),
    secondContactNumber: z.string().default('').nullish(),
    email: z.string().default('').nullish(),
    consentAndSign: z.string().default('').nullish(),
    check: z.enum(['yes', 'no']).nullish(),
  })
  .refine((data) => data.consentAndSign, {
    path: ['consentAndSign'],
    message: 'You must sign the form',
  })
  .refine((data) => data.check, {
    path: ['check'],
    message: 'You must check the box',
  })
