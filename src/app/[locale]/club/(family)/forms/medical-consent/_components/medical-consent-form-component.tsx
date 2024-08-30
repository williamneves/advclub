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
  Flex,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { z } from 'zod'
import { zodResolver } from 'mantine-form-zod-resolver'
import { api } from '@/trpc/react'
import dayjs from 'dayjs'
import { PatternFormat } from 'react-number-format'
import { DateInput } from '@mantine/dates'
import {
  IconCalendar,
  IconChecks,
  IconChevronLeft,
  IconDeviceFloppy,
  IconEdit,
  IconTrash,
  IconX,
} from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { notifications } from '@mantine/notifications'
import { cn } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { formsDefaultSchema } from '../../_components/types'
import { medicalFormFieldSchema } from './medical-consent.type'
import { modals } from '@mantine/modals'

const schema = z
  .object({
    form: formsDefaultSchema.extend({
      fields: medicalFormFieldSchema,
      kidId: z.coerce.number(),
      guardianId: z.coerce.number(),
    }),
  })
  .refine((data) => data.form.kidId, {
    path: ['form.kidId'],
    message: 'Por favor selecione uma criança',
  })
  .refine((data) => data.form.guardianId, {
    path: ['form.guardianId'],
    message: 'Por favor selecione um responsável',
  })

type FormType = z.infer<typeof schema>

const defaultValues: FormType = {
  form: {
    title: 'Medical Consent',
    slug: 'medical-consent',
    description: 'Medical Consent',
    status: 'draft',
    guardianId: 0,
    kidId: 0,
    reviewedBy: null,
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

export function MedicalConsentForm({
  formId,
  mode,
}: {
  formId?: number
  mode: 'edit' | 'new' | 'view' | 'review'
}) {
  const [loading, setLoading] = useState(false)
  const t = useTranslations('common')
  const router = useRouter()
  const pathname = usePathname()

  const disabled = loading || mode === 'view' || mode === 'review'

  const form = useForm({
    initialValues: defaultValues,
    validate: zodResolver(schema),
    enhanceGetInputProps: () => ({
      disabled: disabled,
    }),
  })

  const canBeDeleted =
    mode === 'edit' || form.getValues().form.status === 'submitted'

  const submitButtonLabel =
    form.getValues().form.status === 'draft' ? t('submit') : t('update')

  const fetchedForm = api.club.forms.getFormByID.useQuery(
    {
      id: formId!,
    },
    {
      enabled: !!formId,
    },
  )

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

  const utils = api.useUtils()
  const createForm = api.club.forms.createForm.useMutation({
    onSuccess: async () => {
      await utils.club.families.getLoggedInFamily.invalidate()
      await utils.club.forms.getForms.invalidate()
      await utils.club.forms.getFormsBySlug.invalidate()
      await utils.club.forms.getFormsByLoggedInFamily.invalidate()
    },
  })

  const updateForm = api.club.forms.updateFormByID.useMutation({
    onSuccess: async () => {
      await utils.club.families.getLoggedInFamily.invalidate()
      await utils.club.forms.getForms.invalidate()
      await utils.club.forms.getFormsBySlug.invalidate()
      await utils.club.forms.getFormsByLoggedInFamily.invalidate()
      await utils.club.forms.getFormByID.invalidate(
        {
          id: formId!,
        },
        {
          exact: false,
        },
      )
    },
  })

  const deleteForm = api.club.forms.deleteFormByID.useMutation({
    onSuccess: async () => {
      await utils.club.families.getLoggedInFamily.invalidate()
      await utils.club.forms.getForms.invalidate()
      await utils.club.forms.getFormsBySlug.invalidate()
      await utils.club.forms.getFormsByLoggedInFamily.invalidate()
    },
  })

  const medicalConsent = !!form.errors?.['form.fields.medicalConsent']
  const consentAndSign = !!form.errors?.['form.fields.consentAndSign']

  const handleCreateForm = async (values: FormType) => {
    try {
      setLoading(true)
      const parsedValues = schema.parse(values)
      await createForm.mutateAsync({
        title: parsedValues.form.title,
        slug: parsedValues.form.slug,
        guardianId: parsedValues.form.guardianId,
        kidId: parsedValues.form.kidId,
        description: parsedValues.form.description,
        status: 'submitted',
        fields: parsedValues.form.fields,
      })

      notifications.show({
        title: t('success'),
        message: t('form_send_success'),
        color: 'green',
      })

      form.reset()
      router.push(`/club/forms`)
    } catch (error) {
      console.log(error)
      throw t('system_error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values: FormType) => {
    if (
      values.form.status === 'approved' ||
      values.form.status === 'rejected' ||
      mode === 'view'
    ) {
      // If if approved or rejected, do nothing
      return
    }
    if (mode === 'new') {
      return handleCreateForm(values)
    }
    return handleUpdateForm(values)
  }

  const handleUpdateForm = async (values: FormType) => {
    try {
      setLoading(true)
      const parsedValues = schema.parse(values)
      await updateForm.mutateAsync({
        id: formId!,
        data: parsedValues.form,
      })
      form.setInitialValues(values)
      form.reset()
      notifications.show({
        title: t('success'),
        message: t('success_message'),
        color: 'green',
      })
      router.push('/club/forms')
    } catch (error) {
      console.log(error)
      notifications.show({
        title: t('error'),
        message: t('system_error'),
        color: 'red',
      })
      throw t('system_error')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveForm = async () => {
    try {
      setLoading(true)
      await updateForm.mutateAsync({
        id: formId!,
        data: {
          status: 'approved',
        },
      })
      notifications.show({
        title: t('success'),
        message: t('success_message'),
        color: 'green',
      })
      router.push(`/club/forms`)
    } catch (error) {
      console.log(error)
      notifications.show({
        title: t('error'),
        message: t('system_error'),
        color: 'red',
      })
      throw t('system_error')
    } finally {
      setLoading(false)
    }
  }

  const handleRejectForm = async () => {
    try {
      setLoading(true)
      await updateForm.mutateAsync({
        id: formId!,
        data: {
          status: 'rejected',
        },
      })
      notifications.show({
        title: t('success'),
        message: t('success_message'),
        color: 'green',
      })
      router.push(`/club/forms`)
    } catch (error) {
      console.log(error)
      notifications.show({
        title: t('error'),
        message: t('system_error'),
        color: 'red',
      })
      throw t('system_error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteForm = async () => {
    modals.openConfirmModal({
      title: t('delete_form'),
      children: <Text>{t('delete_form_confirmation')}</Text>,
      labels: { confirm: t('delete'), cancel: t('cancel') },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        await deleteForm.mutateAsync({
          id: formId!,
        })

        router.push(`/club/forms`)
      },
    })
  }

  const handleError = (errors: typeof form.errors) => {
    Object.keys(errors).forEach((key) => {
      notifications.show({
        title: t('error'),
        message: errors[key],
        color: 'red',
      })
    })
    console.log(errors)
  }

  const handleGoToEdit = () => {
    const path = pathname.replace('/view', '/edit')
    router.push(path)
  }

  useEffect(() => {
    if (form.initialized) return

    if (mode === 'new') {
      form.initialize(defaultValues)
      return
    }

    if (fetchedForm.isSuccess && fetchedForm.data) {
      form.initialize({
        form: {
          title: fetchedForm.data.title,
          slug: fetchedForm.data.slug,
          description: fetchedForm.data.description,
          status: fetchedForm.data.status,
          guardianId: fetchedForm.data.guardianId,
          kidId: fetchedForm.data.kidId,
          reviewedBy: fetchedForm.data.reviewedBy,
          submittedAt: fetchedForm.data.submittedAt,
          approvedAt: fetchedForm.data.approvedAt,
          rejectedAt: fetchedForm.data.rejectedAt,
          fields: fetchedForm.data.fields as FormType['form']['fields'],
        },
      })
    }
  }, [mode, formId, fetchedForm.data, fetchedForm.status, form.initialized])

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
                legend={
                  <Badge color={medicalConsent ? 'red' : undefined}>
                    Consent
                  </Badge>
                }
                className="flex flex-col gap-4"
                classNames={{
                  root: cn(medicalConsent && 'border-red-500 bg-red-50'),
                }}
              >
                <Group align="center" gap={'md'} wrap="nowrap">
                  <Checkbox
                    size="lg"
                    {...form.getInputProps('form.fields.medicalConsent', {
                      type: 'checkbox',
                    })}
                    error={''}
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
                  </Stack>
                  {/* Parent Info */}
                  <Stack gap={4}>
                    <Text>
                      <b>Father’s Name:</b> {parentName}
                    </Text>
                    <Text>
                      <b>Phone Number</b>{' '}
                      {parentPhone === '' ? 'Not provided' : parentPhone}
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
                  <Divider />
                  <Stack gap={7}>
                    <Text fz={'sm'}>
                      I, <b>{parentName}</b>, give the following emergency
                      medical treatment consent for the child <b>{kidName}</b>.
                    </Text>
                    <Text fz={'sm'}>
                      Effective from today (
                      <span className="font-bold">
                        {dayjs().format('DD/MM/YYYY')}
                      </span>
                      ) to{' '}
                      <span className="font-bold">
                        {dayjs().add(1, 'year').format('DD/MM/YYYY')}
                      </span>
                      .
                    </Text>
                  </Stack>
                  <Divider />
                  <Radio.Group
                    label="One of the types of treatment must be marked"
                    {...form.getInputProps(
                      'form.fields.otherContact.treatmentConsent',
                    )}
                  >
                    <Group>
                      <SimpleGrid cols={2} spacing={6}>
                        <Radio
                          value="emergency"
                          label="Emergency Surgery"
                          disabled={disabled}
                        />
                        <Radio
                          value="first"
                          label="First Aid"
                          disabled={disabled}
                        />
                        <Radio
                          value="both"
                          label="Both of the above"
                          disabled={disabled}
                        />
                        <Radio
                          value="none"
                          label="None of the above"
                          disabled={disabled}
                        />
                      </SimpleGrid>
                    </Group>
                  </Radio.Group>
                </Stack>
              </Fieldset>

              {/* Consent and Sign */}
              <Fieldset
                legend={
                  <Badge color={consentAndSign ? 'red' : undefined}>
                    Consent and Sign
                  </Badge>
                }
                classNames={{
                  root: cn(consentAndSign && 'border-red-500 bg-red-50'),
                }}
              >
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
              <Group justify="flex-end">
                <Button
                  type="button"
                  variant="outline"
                  mr="auto"
                  onClick={() => router.back()}
                >
                  <IconChevronLeft />
                </Button>
                {mode !== 'new' && mode !== 'review' && (
                  <Button
                    type="button"
                    color="red"
                    variant="light"
                    disabled={!canBeDeleted}
                    rightSection={<IconTrash stroke={1.5} size={20} />}
                    onClick={handleDeleteForm}
                  >
                    {t('delete')}
                  </Button>
                )}
                {mode !== 'view' &&
                  mode !== 'review' &&
                  form.getValues().form.status !== 'approved' &&
                  form.getValues().form.status !== 'rejected' && (
                    <Button
                      type="submit"
                      rightSection={<IconDeviceFloppy stroke={1.5} size={20} />}
                    >
                      {submitButtonLabel}
                    </Button>
                  )}
                {mode === 'view' &&
                  form.getValues().form.status === 'submitted' && (
                    <Button
                      type="button"
                      onClick={handleGoToEdit}
                      rightSection={<IconEdit stroke={1.5} size={20} />}
                    >
                      {t('edit')}
                    </Button>
                  )}
                {mode === 'review' && (
                  <Flex gap={10}>
                    <Button
                      type="button"
                      color="red"
                      variant="light"
                      rightSection={<IconX size={20} stroke={1.5} />}
                      onClick={() => {
                        handleRejectForm()
                      }}
                    >
                      {t('form_reject')}
                    </Button>
                    <Button
                      type="button"
                      rightSection={<IconChecks size={20} stroke={1.5} />}
                      onClick={() => {
                        handleApproveForm()
                      }}
                    >
                      {t('form_approve')}
                    </Button>
                  </Flex>
                )}
              </Group>
            </Stack>
          </Collapse>
        </Stack>
      </Card>
    </form>
  )
}
