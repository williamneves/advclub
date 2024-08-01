import { membersRouter } from './members.router'
import { kidsRouter } from './kids.router'
import { familiesRouter } from './families.router'
import { createTRPCRouter } from '../../trpc'
import { parentsRouter } from './parents.router'

export const clubRouter = createTRPCRouter({
  members: membersRouter,
  kids: kidsRouter,
  families: familiesRouter,
  parents: parentsRouter,
})
