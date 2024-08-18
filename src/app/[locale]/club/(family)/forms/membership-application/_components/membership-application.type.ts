import { z } from 'zod'

export const membershipApplicationFormFieldSchema = z
  .object({
    reason: z.string(),
    transferFrom: z.string().default('').nullish(),
    lawPledge: z.boolean().default(false),
    commitment: z.boolean().default(false),
    personalInformation: z.object({
      grade: z.string().default('').nullish(),
      baptized: z.enum(['yes', 'no']).default('no').nullish(),
      churchName: z.string().default('').nullish(),
      haveBeenAdventureBefore: z.enum(['yes', 'no']).default('no').nullish(),
      oldClubName: z.string().default('').nullish(),
      levelsCompleted: z.array(z.string()).default([]).nullish(),
    }),
    masterGuides: z.object({
      father: z.enum(['yes', 'no']).default('no').nullish(),
      mother: z.enum(['yes', 'no']).default('no').nullish(),
    }),
    adventuresBefore: z.object({
      father: z.enum(['yes', 'no']).default('no').nullish(),
      mother: z.enum(['yes', 'no']).default('no').nullish(),
    }),
    approvalOfParents: z.boolean().default(false),
    consentAndSign: z.string().default('').nullish(),
  })
  .refine((data) => data.consentAndSign, {
    path: ['consentAndSign'],
    message: 'You must sign the form',
  })
  .refine((data) => data.reason, {
    path: ['reason'],
    message: 'You must provide a reason',
  })
  .refine((data) => data.lawPledge, {
    path: ['lawPledge'],
    message: 'You must agree to the law pledge',
  })
  .refine((data) => data.commitment, {
    path: ['commitment'],
    message: 'You must agree to the commitment',
  })
  .refine((data) => data.approvalOfParents, {
    path: ['approvalOfParents'],
    message: 'You must agree to the approval of parents',
  })
