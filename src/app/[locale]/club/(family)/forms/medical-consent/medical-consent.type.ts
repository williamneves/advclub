import { z } from 'zod'

export const medicalFormFieldSchema = z
  .object({
    medicalConsent: z.boolean().default(false),
    medical: z.object({
      medicalInsurance: z.string().default('').nullish(),
      policyNumber: z.string().default('').nullish(),
      physicianName: z.string().default('').nullish(),
      physicianPhone: z.string().default('').nullish(),
      tetanusShot: z.coerce.string().default('').nullish(),
      foodAllergies: z.string().default('').nullish(),
      medicationAllergies: z.string().default('').nullish(),
      medicationsNow: z.string().default('').nullish(),
      medicalHistory: z.string().default('').nullish(),
    }),
    otherContact: z.object({
      name: z.string().default('').nullish(),
      phone: z.string().default('').nullish(),
      relationship: z.string().default('').nullish(),
      treatmentConsent: z
        .enum(['emergency', 'first', 'both', 'none'])
        .default('none'),
    }),
    consentAndSign: z.string().default('').nullish(),
  })
  .refine((data) => data.consentAndSign, {
    path: ['consentAndSign'],
    message: 'You must sign the form',
  })
  .refine((data) => data.medicalConsent, {
    path: ['medicalConsent'],
    message: 'You must agree to the medical consent',
  })
