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
  Input,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { z } from 'zod'
import { zodResolver } from 'mantine-form-zod-resolver'
import { api } from '@/trpc/react'
import dayjs from 'dayjs'
import { PatternFormat } from 'react-number-format'
import { DateInput } from '@mantine/dates'
import { IconCalendar } from '@tabler/icons-react'

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
  medicalConsent: z.boolean().default(false),
  medical: z.object({
    medicalInsurance: z.string().default('').nullish(),
    policyNumber: z.string().default('').nullish(),
    physicianName: z.string().default('').nullish(),
    physicianPhone: z.string().default('').nullish(),
    tetanusShot: z.coerce
      .string()
      .transform((value) => new Date(value).toISOString()),
    foodAllergies: z.string().default('').nullish(),
    medicationAllergies: z.string().default('').nullish(),
    medicationsNow: z.string().default('').nullish(),
    medicalHistory: z.string().default('').nullish(),
  }),
  otherContact: z.object({
    name: z.string().default('').nullish(),
    phone: z.string().default('').nullish(),
    relationship: z.string().default('').nullish(),
    treatmentConsent: z
      .enum(['emergency', 'first', 'both', 'none'])
      .default('none'),
  }),
  consentAndSign: z.string().default('').nullish(),
})

const schema = z.object({
  form: formsDefaultSchema.extend({
    fields: fieldsSchema,
  }),
})

type FormType = z.infer<typeof schema>

const defaultValues: FormType = {
  form: {
    title: 'Medical Consent',
    description: 'Medical Consent',
    status: 'draft',
    guardianId: null,
    kidId: null,
    checkedByMemberId: null,
    submittedAt: null,
    approvedAt: null,
    rejectedAt: null,
    fields: {
      medicalConsent: false,
      medical: {
        medicalInsurance: '',
        policyNumber: '',
        physicianName: '',
        physicianPhone: '',
        tetanusShot: '',
        foodAllergies: '',
        medicationAllergies: '',
        medicationsNow: '',
        medicalHistory: '',
      },
      otherContact: {
        name: '',
        phone: '',
        relationship: '',
        treatmentConsent: 'none',
      },
      consentAndSign: '',
    },
  },
}

export default function MedicalConsent() {
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
  const kidAge = selectedKid
    ? `${dayjs(selectedKid.birthDate).format('DD/MM/YYYY')} (${dayjs().diff(selectedKid.birthDate, 'year')} years old)`
    : 'Waiting for selection'

  const kidSex = kids.data?.find(
    (kid) => kid.id == form.getValues().form.kidId,
  )?.sex

  const kidPhone = kids.data?.find(
    (kid) => kid.id == form.getValues().form.kidId,
  )?.phoneNumber

  const weight = kids.data?.find(
    (kid) => kid.id == form.getValues().form.kidId,
  )?.weight

  const height = kids.data?.find(
    (kid) => kid.id == form.getValues().form.kidId,
  )?.height

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

  const parentCity = parents.data?.find(
    (parent) => parent.id == form.getValues().form.guardianId,
  )?.city

  const parentState = parents.data?.find(
    (parent) => parent.id == form.getValues().form.guardianId,
  )?.state

  const parentZip = parents.data?.find(
    (parent) => parent.id == form.getValues().form.guardianId,
  )?.zipCode

  const otherName = form.getValues().form.fields.otherContact.name

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
            <Title order={2}>Medical Consent</Title>
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
              {/* Consent */}

              <Fieldset
                legend={<Badge>Consent</Badge>}
                className="flex flex-col gap-4"
              >
                <Group align="center" gap={'md'} wrap="nowrap">
                  <Checkbox
                    {...form.getInputProps('form.fields.medicalConsent', {
                      type: 'checkbox',
                    })}
                  />
                  <Stack gap={4}>
                    <Text>
                      In these days of lawsuits, medical consent forms are a
                      necessity on every outing. The basic idea of the form is
                      that it gives parental authorization for a doctor to treat
                      a minor. It also provides information on where the parents
                      and family doctor can be located.
                    </Text>
                    <Text>
                      The consent form provides protection for the doctor, the
                      child, and the Club Director. <br />
                      1. <span className="font-bold underline">
                        The Doctor
                      </span>{' '}
                      - a doctor who would give medical assistance to a child
                      without the knowledge of the parents would take a
                      tremendous risk. If the results are serious or even fatal,
                      the parents may sue. A signed consent form{' '}
                      <span className="font-bold underline">may</span> be enough
                      to persuade a doctor that the parents are unlikely to sue.
                      (Many young people have been given medical aid at a remote
                      hospital or office after the leader produced a consent
                      form. Other times the form has not helped at all.)
                      <br />
                      2. <span className="font-bold underline">
                        The Child
                      </span>{' '}
                      - leaders who take a child on an outing have an obligation
                      to provide the best medical care. Not having a form would
                      severely reduce that chance. <br />
                      3.{' '}
                      <span className="font-bold underline">
                        The Director
                      </span>{' '}
                      - if a child is injured and is not able to get proper
                      medical care because the director did not bother to{' '}
                      <span className="font-bold underline">require</span>{' '}
                      medical consent forms, that director would certainly be a
                      handy target for a liability suit.
                    </Text>
                    <Text>
                      <span className="flex flex-col items-center font-bold underline md:flex-row">
                        Note:{' '}
                        <span className="font-normal">
                          {' '}
                          Medical consent forms may be dated in such a way that
                          they are good for the whole year.
                        </span>
                      </span>
                      This has the obvious advantage of saving a lot of work in
                      collecting new forms for each outing. There are two
                      disadvantages to year-long consent forms. First, a form
                      signed several months ago will not be as impressive to a
                      doctor as one signed recently. Secondly, the form won't
                      have current information on the location of the parents.
                      <br />
                      Adventurer parents MUST be with the Adventurers on a
                      weekend outing. Adventurers cannot stay overnight without
                      a parent present.
                    </Text>
                  </Stack>
                </Group>
              </Fieldset>

              {/* Form */}
              <Fieldset legend={<Badge>Form</Badge>}>
                <Stack>
                  {/* Children Info */}
                  <Stack gap={4}>
                    <Text>
                      <b>Child's Name:</b> {kidName}
                    </Text>
                    <Text>
                      <b>Date of Birth:</b> {kidAge}
                    </Text>
                    <Text>
                      <b>Gender:</b> {kidSex}
                    </Text>
                    <Text>
                      <b>Phone Number</b>{' '}
                      {kidPhone === '' ? 'Not provided' : kidPhone}
                    </Text>
                  </Stack>
                  {/* Parent Info */}
                  <Stack gap={4}>
                    <Text>
                      <b>Father’s Name:</b> {parentName}
                    </Text>
                    <Text>
                      <b>Phone Number</b>{' '}
                      {kidPhone === '' ? 'Not provided' : parentPhone}
                    </Text>
                    <Text>
                      <b>Address:</b>{' '}
                      {parentAddress === '' ? 'Not provided' : parentAddress}
                    </Text>
                    <Text>
                      <b>City:</b>{' '}
                      {parentCity === '' ? 'Not provided' : parentCity}
                    </Text>
                    <Text>
                      <b>State:</b>{' '}
                      {parentState === '' ? 'Not provided' : parentState}
                    </Text>
                    <Text>
                      <b>Zip:</b>{' '}
                      {parentZip === '' ? 'Not provided' : parentZip}
                    </Text>
                  </Stack>
                  <Stack gap={2}>
                    <TextInput
                      label="Medical Insurance"
                      placeholder="Medical Insurance"
                      {...form.getInputProps(
                        'form.fields.medical.medicalInsurance',
                      )}
                    />
                    <TextInput
                      label="Policy Number"
                      placeholder="Policy Number"
                      {...form.getInputProps(
                        'form.fields.medical.policyNumber',
                      )}
                    />
                  </Stack>
                  <Stack gap={2}>
                    <TextInput
                      label="Physician’s Name"
                      placeholder="Physician’s Name"
                      {...form.getInputProps(
                        'form.fields.medical.physicianName',
                      )}
                    />
                    <Input.Wrapper label="Phone">
                      <Input
                        placeholder="(123) 456-7890"
                        component={PatternFormat}
                        mask={'_'}
                        format={'(###) ###-####'}
                        {...form.getInputProps(
                          'form.fields.medical.physicianPhone',
                        )}
                      />
                    </Input.Wrapper>
                  </Stack>
                </Stack>
              </Fieldset>

              {/* Medical History */}
              <Fieldset legend={<Badge>Medical History</Badge>}>
                <Stack>
                  <Stack gap={4}>
                    <Text>
                      <b>Weight</b> {weight === '' ? 'Not provided' : weight}
                    </Text>
                    <Text>
                      <b>Height:</b> {height === '' ? 'Not provided' : height}
                    </Text>
                    <DateInput
                      valueFormat="DD/MM/YYYY"
                      leftSection={<IconCalendar size={16} />}
                      label="Last Tetanus shot"
                      placeholder="Last Tetanus shot"
                      {...form.getInputProps('form.fields.medical.tetanusShot')}
                      // value={new Date(form.getInputProps('tetanusShot').value)}
                    />
                    <TextInput
                      label="Food allergies"
                      placeholder="Food allergies"
                      {...form.getInputProps(
                        'form.fields.medical.foodAllergies',
                      )}
                    />
                    <TextInput
                      label="Medication allergies"
                      placeholder="Medication allergies"
                      {...form.getInputProps(
                        'form.fields.medical.medicationAllergies',
                      )}
                    />
                    <TextInput
                      label="Medications receiving now"
                      placeholder="Medications receiving now"
                      {...form.getInputProps(
                        'form.fields.medical.medicationsNow',
                      )}
                    />
                    <TextInput
                      label="Medical history (i.e., recent surgery, diabetic, chronic illness)"
                      placeholder="Medical history (i.e., recent surgery, diabetic, chronic illness)"
                      {...form.getInputProps(
                        'form.fields.medical.medicalHistory',
                      )}
                    />
                  </Stack>
                </Stack>
              </Fieldset>

              {/* Notify in case of not available */}
              <Fieldset legend={<Badge>Notify in case of not available</Badge>}>
                <Stack>
                  <Stack gap={4}>
                    <TextInput
                      label="Name"
                      placeholder="Name"
                      {...form.getInputProps('form.fields.otherContact.name')}
                    />
                    <Input.Wrapper label="Phone" error={form.errors.phone}>
                      <Input
                        placeholder="(123) 456-7890"
                        component={PatternFormat}
                        mask={'_'}
                        format={'(###) ###-####'}
                        {...form.getInputProps(
                          'form.fields.otherContact.phone',
                        )}
                      />
                    </Input.Wrapper>
                    <TextInput
                      label="Relationship to child"
                      placeholder="Relationship to child"
                      {...form.getInputProps(
                        'form.fields.otherContact.relationship',
                      )}
                    />
                  </Stack>
                  <Text fz={'sm'}>
                    I, <span className="font-bold">{parentName}</span>, give the
                    following emergency medical treatment consent for the
                    above-named child. Effective: From{' '}
                    <span className="font-bold">{otherName}</span> to{' '}
                    <span className="font-bold">{kidName}</span>
                  </Text>
                </Stack>
                <Radio.Group
                  label="One of the types of treatment must be marked"
                  {...form.getInputProps(
                    'form.fields.otherContact.treatmentConsent',
                  )}
                >
                  <Group>
                    <SimpleGrid cols={2}>
                      <Radio value="emergency" label="Emergency Surgery" />
                      <Radio value="first" label="First Aid" />
                      <Radio value="both" label="Both of the above" />
                      <Radio value="none" label="None of the above" />
                    </SimpleGrid>
                  </Group>
                </Radio.Group>
              </Fieldset>

              {/* Medical alert */}
              <Alert
                title="ALL MEDICAL CONSENTS MUST BE NOTARIZED"
                color="yellow"
              />

              {/* Consent and Sign */}
              <Fieldset legend={<Badge>Consent and Sign</Badge>}>
                <Text>
                  Signature of Parent/Guardian initials is required for all
                  children
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
