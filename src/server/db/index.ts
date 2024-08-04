import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schemas/'
import { env } from '@/env'

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */

const client = postgres(env.POSTGRES_URL)

export const db = drizzle(client, { schema })
export type DB = typeof db
