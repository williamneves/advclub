'use client'

import {
  Card,
  Stack,
  Text,
  Title,
  TextInput,
  Fieldset,
  Group,
  Checkbox,
  Badge,
  Alert,
  Button,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { z } from 'zod'
import { zodResolver } from 'mantine-form-zod-resolver'

const formsDefaultSchema = z.object({
  title: z.string(),
  description: z.string().nullable().default(''),
  status: z
    .enum(['draft', 'submitted', 'approved', 'rejected'])
    .default('draft'),
  guardianId: z.coerce.number().nullable(),
  kidId: z.coerce.number().nullable(),
  checkedByMemberId: z.coerce.number().nullable(),
  fields: z.record(z.string(), z.unknown()),
  submittedAt: z.date().nullable(),
  approvedAt: z.date().nullable(),
  rejectedAt: z.date().nullable(),
})

const fieldsSchema = z.object({
  kidSign: z.string().default('').nullish(),
  parentSign: z.string().default('').nullish(),
  codeAgreement: z.boolean().default(false),
})

const schema = z.object({
  form: formsDefaultSchema.extend({
    fields: fieldsSchema,
  }),
})

type FormType = z.infer<typeof schema>

const defaultValues: FormType = {
  form: {
    title: 'Code Conduct',
    description: 'Code Conduct',
    status: 'draft',
    guardianId: null,
    kidId: null,
    checkedByMemberId: null,
    submittedAt: null,
    approvedAt: null,
    rejectedAt: null,
    fields: {
      kidSign: '',
      parentSign: '',
      codeAgreement: false,
    },
  },
}

export default function CodeConduct() {
  const form = useForm({
    initialValues: defaultValues,
    validate: zodResolver(schema),
  })

  const handleSubmit = (values: FormType) => {
    console.log(values)
    console.log(schema.parse(values))
  }

  const handleError = (errors: typeof form.errors) => {
    console.log(errors)
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit, handleError)}>
      <Card withBorder>
        <Stack>
          <Stack gap={4}>
            <Title order={2}>Code of Conduct and Participation Agreement</Title>
            <Text fz={'sm'} c={'dimmed'}>
              Please complete this form for each child you would like to join
              the club.
            </Text>
          </Stack>

          {/* Form Block */}
          <Stack>
            <Alert title="Read all the boxes and check the ones that apply." />
            {/* Consent */}

            <Fieldset
              legend={<Badge>Consent</Badge>}
              className="flex flex-col gap-4"
            >
              <Group align="center" gap={'md'} wrap="nowrap">
                <Checkbox
                  {...form.getInputProps('form.fields.codeAgreement', {
                    type: 'checkbox',
                  })}
                />
                <Stack gap={20}>
                  <Text>
                    <span className="font-bold">1.</span> Adventurers should be
                    on time to all Club meetings and events. Chronic tardiness
                    will be taken into account when evaluating an Adventurer’s
                    Personal Performance.
                  </Text>
                  <Text>
                    <span className="font-bold">2.</span> <b>Field Uniform</b>{' '}
                    (Club tee shirt, shorts with length to the knees or jeans,
                    tennis shoes) will be worn at all Club meetings and informal
                    activities and functions unless specified otherwise
                    including camp outs. Open toe shoes are not allowed at Club
                    meetings.
                  </Text>
                  <Text>
                    <span className="font-bold">3.</span> Complete{' '}
                    <b>Class A or B Uniform</b> will be worn at all formal Club
                    activities and designated Club meetings. Class A uniform
                    consists of: white shirts with all patches and pins, slacks
                    (boys) navy blue jumper or navy-blue dress (girls), navy
                    blue socks (boys) white socks (girls), black dress shoes
                    (closed toe), sash, scarf, and uniforms slide. Class B
                    uniform is all of the above without the sash, scarf and
                    slide.
                  </Text>
                  <Text>
                    <span className="font-bold">4.</span> <b>Jewelry</b>: We as
                    members of the Seventh-day Adventist Church believe that the
                    wearing of jewelry and the display of wealth that it implies
                    is inconsistent with the principles of Adventuring.
                    Therefore, we request that no visible jewelry be worn to any
                    Adventurer function. This also prevents the loss of valuable
                    items.
                  </Text>
                  <Text>
                    <span className="font-bold">5.</span> Adventurers should
                    attempt to <b>participate</b> in all activities for their
                    Class level and maintain good conduct.
                  </Text>
                  <Text>
                    <span className="font-bold">6.</span> Adventurers will{' '}
                    <b>show respect</b> at all times to the Adventurer Staff,
                    their fellow Adventurers as well as all other people.
                    Adventurers are expected to follow directions of Adventurer
                    staff. Adventurers will ask for God’s help to do their best
                    to live out the Adventurer Pledge and Law at all things at
                    all times whether during Club meetings or events at home,
                    church, school or in the community.
                  </Text>
                  <Text>
                    <span className="font-bold">7.</span> During Club meetings
                    or events, Adventurers will <b>stay together</b> with a
                    counselor or instructor. If an Adventurer needs to leave the
                    group area they must have permission from a counselor, sign
                    out as instructed (if applicable) and travel using the buddy
                    system.
                  </Text>
                  <Text>
                    <span className="font-bold">8.</span> On campouts,
                    Adventurers are expected to <b>help out</b> with set up,
                    take down, kitchen patrol or any other necessary duties as
                    scheduled; we must work as a team. Adventurers should not
                    expect to go home until all equipment is cleaned and put
                    away.
                  </Text>
                  <Text>
                    <span className="font-bold">9.</span> Adventurers will abide
                    by the Camping Code of taking only pictures/memories and
                    leaving only footprints while camping. Remember that Nature
                    is God’s First Published Book.
                  </Text>
                  <Text>
                    <span className="font-bold">10.</span> New Adventurers will
                    be put in Class level according to age and grade level. To
                    join the Adventurers Club a child must be between Pre-K and
                    4th grade. If a child is moving to the church during the
                    year they should bring their records from their previous
                    Club.
                  </Text>
                </Stack>
              </Group>
            </Fieldset>

            {/* Consent and Sign */}
            <Fieldset legend={<Badge>Consent and Sign</Badge>}>
              <Stack gap={20}>
                <Stack gap={0}>
                  <Text>
                    Signature of Adventurer/Child initials is required for all
                    children
                  </Text>
                  <TextInput
                    label="Adventurer/Child Initials"
                    placeholder="Initials"
                    {...form.getInputProps('form.fields.kidSign')}
                  />
                </Stack>
                <Stack gap={0}>
                  <Text>
                    Signature of Parent/Guardian initials is required for all
                    children
                  </Text>
                  <TextInput
                    label="Parent/Guardian Initials"
                    placeholder="Initials"
                    {...form.getInputProps('form.fields.parentSign')}
                  />
                </Stack>
              </Stack>
            </Fieldset>
            <Button type="submit">Submit</Button>
          </Stack>
        </Stack>
      </Card>
    </form>
  )
}
