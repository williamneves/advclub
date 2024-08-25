import { type Config } from 'drizzle-kit'

import { env } from '@/env'

export default {
  schema: './src/server/db/schemas',
  dialect: 'postgresql',
  out: './src/server/db/migrations',
  dbCredentials: {
    url: env.POSTGRES_URL,
  },
  migrations: {
    prefix: 'supabase',
  },
  tablesFilter: ['advclub_*'],
} satisfies Config
