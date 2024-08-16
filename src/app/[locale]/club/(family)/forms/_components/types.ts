import { z } from 'zod'

export const formsDefaultSchema = z.object({
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable().default(''),
  status: z
    .enum(['draft', 'submitted', 'approved', 'rejected'])
    .default('draft'),
  guardianId: z.coerce.number().nullable(),
  kidId: z.coerce.number().nullable(),
  reviewedBy: z.coerce.number().nullable(),
  fields: z.record(z.string(), z.unknown()),
  submittedAt: z.date().nullable(),
  approvedAt: z.date().nullable(),
  rejectedAt: z.date().nullable(),
})
