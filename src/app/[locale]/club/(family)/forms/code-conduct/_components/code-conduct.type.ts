import { z } from 'zod'

export const codeConductFormFieldSchema = z
  .object({
    kidSign: z.string().default('').nullish(),
    parentSign: z.string().default('').nullish(),
    codeAgreement: z.boolean().default(false),
  })
  .refine((data) => data.codeAgreement, {
    path: ['codeAgreement'],
    message: 'You must agree to the code of conduct',
  })
  .refine((data) => data.kidSign, {
    path: ['kidSign'],
    message: 'You must sign the form',
  })
  .refine((data) => data.parentSign, {
    path: ['parentSign'],
    message: 'You must sign the form',
  })
