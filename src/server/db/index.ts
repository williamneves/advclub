import { drizzle } from 'drizzle-orm/vercel-postgres'
import { sql } from '@vercel/postgres'

import * as schema from './schemas/'

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */

export const db = drizzle(sql, { schema })
export type DB = typeof db
