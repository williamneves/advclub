'use client'

import {
  Card,
  Divider,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title,
  TextInput,
  Collapse,
  Fieldset,
  Group,
  Checkbox,
  Badge,
  Alert,
  Radio,
  Button,
  Loader,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { z } from 'zod'
import { zodResolver } from 'mantine-form-zod-resolver'
import { api } from '@/trpc/react'
import dayjs from 'dayjs'

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
  familyHistory: z.enum(['yes', 'no']).default('no').nullish(),
  approvalOfParents: z.boolean().default(false),
  consentAndSign: z.boolean().default(false),
})

const schema = z.object({
  form: formsDefaultSchema.extend({
    fields: fieldsSchema,
  }),
})

type FormType = z.infer<typeof schema>

const defaultValues: FormType = {
  form: {
    title: 'Membership Application',
    description: 'Membership Application',
    status: 'draft',
    guardianId: null,
    kidId: null,
    checkedByMemberId: null,
    submittedAt: null,
    approvedAt: null,
    rejectedAt: null,
    fields: {
      reason: 'new-member',
      transferFrom: '',
      lawPledge: false,
      commitment: false,
      personalInformation: {
        grade: '',
        baptized: 'no',
        churchName: '',
        haveBeenAdventureBefore: 'no',
        oldClubName: '',
        levelsCompleted: [],
      },
      familyHistory: 'no',
      approvalOfParents: false,
      consentAndSign: false,
    },
  },
}

export default function MembershipApplication() {
  const form = useForm({
    initialValues: defaultValues,
    validate: zodResolver(schema),
  })

  const clubName = 'Brisbane'

  const parents = api.club.parents.getParentsByLoggedInFamily.useQuery()
  const kids = api.club.kids.getKidsByLoggedInFamily.useQuery()

  const kidsSelectData =
    kids.data?.map((kid) => ({
      value: kid.id.toString(),
      label: `${kid.firstName} ${kid.lastName}`,
    })) ?? []
  const parentsSelectData =
    parents.data?.map((parent) => ({
      value: parent.id.toString(),
      label: `${parent.firstName} ${parent.lastName}`,
    })) ?? []

  const selectedKid = kids.data?.find(
    (kid) => kid.id == form.getValues().form.kidId,
  )

  const kidName = selectedKid ? `${selectedKid.firstName} ${selectedKid.lastName}` : 'Waiting for selection'
  const kidAge = selectedKid ? `${dayjs(selectedKid.birthDate).format('DD/MM/YYYY')} (${dayjs().diff(selectedKid.birthDate, 'year')} years old)` : 'Waiting for selection'

  const selectedParent = parents.data?.find(
    (parent) => parent.id == form.getValues().form.guardianId,
  )
  const parentName = selectedParent ? `${selectedParent.firstName} ${selectedParent.lastName}` : 'Waiting for selection'

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
            <Title order={2}>Membership Application</Title>
            <Text fz={'sm'} c={'dimmed'}>
              Please complete this form for each child you would like to join
              the club.
            </Text>
            <Divider />
          </Stack>

          <Stack gap={4}>
            <Text fz={'sm'} fw={'bold'}>
              Select the kid and the responsible person to be able to fill the
              application.
            </Text>
            <Stack gap={4}>
              <Select
                label="Kid"
                placeholder="Select a reason"
                readOnly={kids.isLoading}
                rightSection={kids.isLoading ? <Loader size={16} /> : undefined}
                data={kidsSelectData}
                {...form.getInputProps('form.kidId')}
              />
              <Select
                label="Responsible Person"
                placeholder="Select a reason"
                data={parentsSelectData}
                {...form.getInputProps('form.guardianId')}
              />
            </Stack>
          </Stack>
          {/* Form Block */}
          <Collapse in={!!form.getValues().form.kidId && !!form.getValues().form.guardianId}>
            <Stack>
              <Divider />
              <Alert title="Read all the boxes and check the ones that apply." />
              {/* Reason to Apply */}
              <Stack gap={4}>
                <Select
                  label="Reason to Apply"
                  placeholder="Select a reason"
                  data={[
                    { label: 'Apply for membership', value: 'new-member' },
                    { label: 'Renew membership', value: 'renew-member' },
                    { label: 'Transfer membership', value: 'transfer-member' },
                  ]}
                  {...form.getInputProps('form.fields.reason')}
                />
                <Collapse
                  in={form.getValues().form.fields.reason === 'transfer-member'}
                >
                  <TextInput
                    disabled={
                      form.getValues().form.fields.reason !== 'transfer-member'
                    }
                    label="Transfer from"
                    placeholder="Older club name"
                    {...form.getInputProps('form.fields.transferFrom')}
                  />
                </Collapse>
              </Stack>
              {/* Law */}

              <Fieldset
                legend={<Badge>Law & Pledge</Badge>}
                className="flex flex-col gap-4"
              >
                <Group align="center" gap={'md'} wrap="nowrap">
                  <Checkbox
                    {...form.getInputProps('form.fields.lawPledge', {
                      type: 'checkbox',
                    })}
                  />
                  <Stack>
                    <Stack gap={4}>
                      <Title order={3}>Law</Title>
                      <SimpleGrid cols={2}>
                        <Stack gap={4}>
                          <Text>Be obedient</Text>
                          <Text>Be pure</Text>
                          <Text>Be true</Text>
                          <Text>Be kind</Text>
                          <Text>Be respectful</Text>
                        </Stack>
                        <Stack gap={4}>
                          <Text>Be attentive</Text>
                          <Text>Be helpful</Text>
                          <Text>Be cheerful</Text>
                          <Text>Be thoughtful</Text>
                          <Text>Be reverent</Text>
                        </Stack>
                      </SimpleGrid>
                    </Stack>
                    <Stack gap={4}>
                      <Title order={4}>Pledge</Title>
                      <Text>
                        Because Jesus loves me, I will always do my best.
                      </Text>
                    </Stack>
                  </Stack>
                </Group>
              </Fieldset>
              {/* Commitment */}
              <Fieldset legend={<Badge>Applicant's Commitment</Badge>}>
                <Group wrap="nowrap" align="center" gap={'md'}>
                  <Checkbox
                    {...form.getInputProps('form.fields.commitment', {
                      type: 'checkbox',
                    })}
                  />
                  <Stack gap={4}>
                    <Text>
                      I <b>{kidName}</b> would like to join the {clubName}
                      Adventurer Club.
                    </Text>
                    <Text>
                      I will attend Club meetings, hikes, field trips,
                      missionary adventures, and other Club activities. I agree
                      to be guided by the rules of the Club and the Adventurer
                      Pledge and Law.
                    </Text>
                  </Stack>
                </Group>
              </Fieldset>
              {/* Personal Information */}
              <Fieldset legend={<Badge>Applicant's Commitment</Badge>}>
                <Stack>
                  {/* CHildren Info */}
                  <Stack gap={4}>
                    <Text>
                      <b>Name:</b> {kidName}
                    </Text>
                    <Text>
                      <b>Date of Birth:</b> {kidAge}
                    </Text>
                    <Text>
                      <b>Gender:</b> Male
                    </Text>
                  </Stack>
                  <TextInput
                    label="Grade in School"
                    placeholder="Ex: 1st Grade"
                    {...form.getInputProps(
                      'form.fields.personalInformation.grade',
                    )}
                  />
                  <Radio.Group
                    label="Baptized"
                    {...form.getInputProps(
                      'form.fields.personalInformation.baptized',
                    )}
                  >
                    <Group>
                      <Radio value="yes" label="Yes" />
                      <Radio value="no" label="No" />
                    </Group>
                  </Radio.Group>
                  <TextInput
                    label="Church Name"
                    placeholder="Church Name"
                    {...form.getInputProps(
                      'form.fields.personalInformation.churchName',
                    )}
                  />
                  <Radio.Group
                    label="Have Been Adventure Before?"
                    {...form.getInputProps(
                      'form.fields.personalInformation.haveBeenAdventureBefore',
                    )}
                  >
                    <Group>
                      <Radio value="yes" label="Yes" />
                      <Radio value="no" label="No" />
                    </Group>
                  </Radio.Group>
                  <TextInput
                    label="Old Club Name"
                    placeholder="Old Club Name"
                    {...form.getInputProps(
                      'form.fields.personalInformation.oldClubName',
                    )}
                  />
                  <Checkbox.Group
                    label="Levels Completed"
                    description="Check levels you kid has completed, if you don't know, leave blank"
                    {...form.getInputProps(
                      'form.fields.personalInformation.levelsCompleted',
                    )}
                  >
                    <SimpleGrid cols={2} spacing={8} my={'sm'}>
                      <Checkbox value="Little Lamb" label="Little Lamb" />
                      <Checkbox value="Eager Beaver" label="Eager Beaver" />
                      <Checkbox value="Busy Bee" label="Busy Bee" />
                      <Checkbox value="Sunbeam" label="Sunbeam" />
                      <Checkbox value="Builder" label="Builder" />
                      <Checkbox value="Helping Hand" label="Helping Hand" />
                    </SimpleGrid>
                  </Checkbox.Group>
                </Stack>
              </Fieldset>
              {/* Family History */}
              {/* Approval of Parents */}
              {/* Consent and Sign */}
        <Button type="submit">Submit</Button>
            </Stack>
          </Collapse>
        </Stack>
      </Card>
    </form>
  )
}
