import { pgTableCreator, pgSchema } from 'drizzle-orm/pg-core'

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */

export const authSchema = pgSchema('auth')

export const createAuthTable = (
  ...args: Parameters<typeof authSchema.table>
) => {
  const [name, ...rest] = args
  return authSchema.table(`advclub_${name}`, ...rest)
}

export const createTable = pgTableCreator((name) => `advclub_${name}`)
