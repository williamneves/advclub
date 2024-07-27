import { z } from 'zod'

export const profileType = z.enum(['family', 'club_crew', 'admin'])

export type ProfileType = z.infer<typeof profileType>
