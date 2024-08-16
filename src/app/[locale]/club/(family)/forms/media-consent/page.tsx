'use client'

import {
  Card,
  Divider,
  Select,
  Stack,
  Text,
  Title,
  TextInput,
  Collapse,
  Fieldset,
  Group,
  Badge,
  Alert,
  Radio,
  Button,
  Loader,
  Input,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { z } from 'zod'
import { zodResolver } from 'mantine-form-zod-resolver'
import { api } from '@/trpc/react'
import { PatternFormat } from 'react-number-format'
import { formsDefaultSchema } from '../_components/types'

const fieldsSchema = z.object({
  grade: z.string().default('').nullish(),
  firstPhoneType: z.enum(['home', 'cell']).default('cell').nullish(),
  secondPhoneType: z.enum(['home', 'cell']).default('cell').nullish(),
  secondContactNumber: z.string().default('').nullish(),
  email: z.string().email().default('').nullish(),
  consentAndSign: z.string().default('').nullish(),
  check: z.enum(['yes', 'no']).nullish(),
})

const schema = z.object({
  form: formsDefaultSchema.extend({
    fields: fieldsSchema,
  }),
})

type FormType = z.infer<typeof schema>

const defaultValues: FormType = {
  form: {
    title: 'Media Consent',
    slug: 'media-consent',
    description: 'Media Consent',
    status: 'draft',
    guardianId: null,
    kidId: null,
    reviewedBy: null,
    submittedAt: null,
    approvedAt: null,
    rejectedAt: null,
    fields: {
      grade: '',
      firstPhoneType: 'cell',
      secondPhoneType: 'cell',
      secondContactNumber: '',
      email: '',
      consentAndSign: '',
      check: null,
    },
  },
}

export default function MediaConsent() {
  const form = useForm({
    initialValues: defaultValues,
    validate: zodResolver(schema),
  })

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

  const selectedParent = parents.data?.find(
    (parent) => parent.id == form.getValues().form.guardianId,
  )
  const parentName = selectedParent
    ? `${selectedParent.firstName} ${selectedParent.lastName}`
    : 'Waiting for selection'

  const parentPhone = parents.data?.find(
    (parent) => parent.id == form.getValues().form.guardianId,
  )?.phone

  const parentAddress = parents.data?.find(
    (parent) => parent.id == form.getValues().form.guardianId,
  )?.streetAddress

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
            <Title order={2}>
              Consent for Minors to Participate in Florida Conference TLT
              Activities{' '}
            </Title>
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
              // !!form.getValues().form.kidId &&
              // !!form.getValues().form.guardianId
              true
            }
          >
            <Stack>
              <Divider />
              <Alert title="Read all the boxes and check the ones that apply." />
              {/* Consent */}

              <Fieldset
                legend={<Badge>Info</Badge>}
                className="flex flex-col gap-4"
              >
                <Group align="center" gap={'md'} wrap="nowrap">
                  <Stack gap={4}>
                    <Text>
                      Name of Sponsoring Entity Florida Conference of SDA TLT
                      Program
                    </Text>
                    <Text>
                      Parental Permission Form for Minor’s Online Participation
                      in all TLT activities as well as taking photos and videos
                      at TLT activities that may be used on the TLT YouTube
                      Channel and other conference media resources.
                    </Text>
                  </Stack>
                </Group>
              </Fieldset>

              {/* Form */}
              <Fieldset legend={<Badge>Form</Badge>}>
                <Stack>
                  <Stack gap={10}>
                    <Text>
                      <b>Name of Minor (print legibly):</b> {kidName}
                    </Text>
                    <Text>
                      <b>Parent/Guardian Name: </b> {parentName}
                    </Text>
                    <TextInput
                      label="Minor Grade Level"
                      placeholder="Minor Grade Level"
                      {...form.getInputProps('form.fields.grade')}
                    />
                    <Stack gap={0}>
                      <Text>
                        <b>Phone:</b>{' '}
                        {parentPhone ? parentPhone : 'Not provided'}
                      </Text>
                      <Radio.Group
                        label="Home or Cell"
                        {...form.getInputProps('form.fields.firstPhoneType')}
                      >
                        <Group>
                          <Radio value="home" label="Home" />
                          <Radio value="cell" label="Cell" />
                        </Group>
                      </Radio.Group>
                    </Stack>

                    <Stack gap={0}>
                      <Input.Wrapper label="Contact Number #2: ">
                        <Input
                          placeholder="(123) 456-7890"
                          component={PatternFormat}
                          mask={'_'}
                          format={'(###) ###-####'}
                          {...form.getInputProps(
                            'form.fields.secondContactNumber',
                          )}
                        />
                      </Input.Wrapper>
                      <Radio.Group
                        label="Home or Cell"
                        {...form.getInputProps('form.fields.secondPhoneType')}
                      >
                        <Group>
                          <Radio value="home" label="Home" />
                          <Radio value="cell" label="Cell" />
                        </Group>
                      </Radio.Group>
                    </Stack>
                    <TextInput
                      label="Email Address"
                      placeholder="Email Address"
                      {...form.getInputProps('form.fields.email')}
                    />
                    <Text>
                      <b>Address:</b>{' '}
                      {parentAddress ? parentAddress : 'Not provided'}
                    </Text>
                  </Stack>
                </Stack>
              </Fieldset>

              <Fieldset
                legend={<Badge>Check</Badge>}
                className="flex flex-col gap-4"
              >
                <Stack>
                  <Radio.Group
                    label="Check one of the following:"
                    {...form.getInputProps('form.fields.check')}
                  >
                    <Group>
                      <Radio
                        value="yes"
                        label="I do give permission for the minor to participate and allow the use of their image and likeness to 
                        be used."
                      />
                      <Radio
                        value="no"
                        label="I do not give permission for the minor to participate. (If you choose for the minor NOT to 
                        participate in online at Florida Conference of SDA TLT Program, the minor will not be able to participate 
                        at all, including in person trainings.)"
                      />
                    </Group>
                  </Radio.Group>
                </Stack>
              </Fieldset>

              {/* Consent and Sign */}
              <Fieldset legend={<Badge>Consent and Sign</Badge>}>
                <Stack gap={20}>
                  <Text>
                    Further, I/we understand by agreeing to allow the minor to
                    participate that the Online Activities identified above
                    involve certain risks such as exposure to bullying,
                    pornography, misappropriation of personal information and
                    other risks associated with online activity. In addition,
                    the Sponsoring Entity stated above cannot guarantee that
                    participation in this online activity will not expose your
                    hardware to viruses, and other malicious software or
                    code-based tools. I/we still wish to proceed with the
                    activities described herein I/we do so and assume all risk
                    and understanding of the risks involved. I/we fully
                    understand that the sponsoring organization cannot fully
                    protect me, my child, or my computer systems, including
                    software and hardware. Any technical support for my computer
                    systems, the use of any software on my computer systems or
                    accessed through the internet are my sole responsibility. I
                    understand that supervision of what my child accesses
                    online, the information they share, and any messages with
                    volunteers, employees, other parents and other minors are my
                    responsibility. I agree to fully supervise all activities
                    the minor participates in and to screen and assume
                    responsibility for all messages my child sends and receives.{' '}
                    <span className="font-bold italic underline">
                      I have read and understand the foregoing.
                    </span>
                  </Text>
                  <Stack gap={4}>
                    <Text>
                      Signature of Parent/Guardian initials is required for all
                      children
                    </Text>
                    <TextInput
                      label="Parent/Guardian Initials"
                      placeholder="Initials"
                      {...form.getInputProps('form.fields.consentAndSign')}
                    />
                  </Stack>
                </Stack>
              </Fieldset>
              <Button type="submit">Submit</Button>
            </Stack>
          </Collapse>
        </Stack>
      </Card>
    </form>
  )
}
