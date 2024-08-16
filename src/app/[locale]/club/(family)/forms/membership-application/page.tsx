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
import { formsDefaultSchema } from '../_components/types'

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
  masterGuides: z.object({
    father: z.enum(['yes', 'no']).default('no').nullish(),
    mother: z.enum(['yes', 'no']).default('no').nullish(),
  }),
  adventuresBefore: z.object({
    father: z.enum(['yes', 'no']).default('no').nullish(),
    mother: z.enum(['yes', 'no']).default('no').nullish(),
  }),
  approvalOfParents: z.boolean().default(false),
  consentAndSign: z.string().min(1, 'Initials are required').default(''),
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
    slug: 'membership-application',
    description: 'Membership Application',
    status: 'draft',
    guardianId: null,
    kidId: null,
    reviewedBy: null,
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
      masterGuides: {
        father: 'no',
        mother: 'no',
      },
      adventuresBefore: {
        father: 'no',
        mother: 'no',
      },
      approvalOfParents: false,
      consentAndSign: '',
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

  const kidName = selectedKid
    ? `${selectedKid.firstName} ${selectedKid.lastName}`
    : 'Waiting for selection'
  const kidAge = selectedKid
    ? `${dayjs(selectedKid.birthDate).format('DD/MM/YYYY')} (${dayjs().diff(selectedKid.birthDate, 'year')} years old)`
    : 'Waiting for selection'

  // const selectedParent = parents.data?.find(
  //   (parent) => parent.id == form.getValues().form.guardianId,
  // )
  // const parentName = selectedParent
  //   ? `${selectedParent.firstName} ${selectedParent.lastName}`
  //   : 'Waiting for selection'

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
                placeholder="Select a kid"
                readOnly={kids.isLoading}
                rightSection={kids.isLoading ? <Loader size={16} /> : undefined}
                data={kidsSelectData}
                {...form.getInputProps('form.kidId')}
              />
              <Select
                label="Responsible Person"
                placeholder="Select a responsible"
                data={parentsSelectData}
                {...form.getInputProps('form.guardianId')}
              />
            </Stack>
          </Stack>
          {/* Form Block */}
          <Collapse
            in={
              !!form.getValues().form.kidId &&
              !!form.getValues().form.guardianId
            }
          >
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
              <Fieldset legend={<Badge>Personal Information</Badge>}>
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
              <Fieldset legend={<Badge>Family History</Badge>}>
                {/* Master Guides */}
                <Stack>
                  <Stack gap={4}>
                    <Text fz={'sm'} className="font-medium">
                      My parents/guardians are Master Guides
                    </Text>
                    <Radio.Group
                      label="Father"
                      {...form.getInputProps('form.fields.masterGuides.father')}
                    >
                      <Group>
                        <Radio value="yes" label="Yes" />
                        <Radio value="no" label="No" />
                      </Group>
                    </Radio.Group>
                    <Radio.Group
                      label="Mother"
                      {...form.getInputProps('form.fields.masterGuides.mother')}
                    >
                      <Group>
                        <Radio value="yes" label="Yes" />
                        <Radio value="no" label="No" />
                      </Group>
                    </Radio.Group>
                  </Stack>
                  {/* Adventure's Before */}
                  <Stack gap={4}>
                    <Text fz={'sm'} className="font-medium">
                      Has either parent worked with Adventurers before?
                    </Text>
                    <Radio.Group
                      label="Father"
                      {...form.getInputProps(
                        'form.fields.adventuresBefore.father',
                      )}
                    >
                      <Group>
                        <Radio value="yes" label="Yes" />
                        <Radio value="no" label="No" />
                      </Group>
                    </Radio.Group>
                    <Radio.Group
                      label="Mother"
                      {...form.getInputProps(
                        'form.fields.adventuresBefore.mother',
                      )}
                    >
                      <Group>
                        <Radio value="yes" label="Yes" />
                        <Radio value="no" label="No" />
                      </Group>
                    </Radio.Group>
                  </Stack>
                </Stack>
              </Fieldset>
              {/* Approval of Parents */}
              <Fieldset
                legend={<Badge>Approval of Parents or Guardians</Badge>}
              >
                <Group align="center" gap={'md'} wrap="nowrap">
                  <Checkbox
                    {...form.getInputProps('form.fields.approvalOfParents', {
                      type: 'checkbox',
                    })}
                  />
                  <Text>
                    The applicant is in Pre-K through grade 4 at the time of
                    registration. We have read the Pledge and Law and are
                    willing and desirous that the applicant become an
                    Adventurer. We will assist the applicant in observing the
                    rules of the Adventurer organization. As parents, we
                    understand that the Adventurer Club program is an active one
                    for the applicant as well as the parent/guardian. It
                    includes many opportunities for service, adventure, and fun.
                    We will cooperate: <br /> 1. By learning how we can assist
                    the applicant and his/her leaders. <br /> 2. By encouraging
                    the applicant to take an active part in all Club activities.{' '}
                    <br />
                    3. By attending events to which parents are invited. <br />
                    4. By assisting Club leaders and by serving as leaders if
                    called upon.
                  </Text>
                </Group>
              </Fieldset>
              {/* Consent and Sign */}
              <Fieldset legend={<Badge>Consent and Sign</Badge>}>
                <Text>
                  We hereby certify that {kidName} was born on {kidAge}
                </Text>
                <TextInput
                  label="Parent/Guardian Initials"
                  placeholder="Initials"
                  {...form.getInputProps('form.fields.consentAndSign')}
                />
              </Fieldset>
              <Button type="submit">Submit</Button>
            </Stack>
          </Collapse>
        </Stack>
      </Card>
    </form>
  )
}
