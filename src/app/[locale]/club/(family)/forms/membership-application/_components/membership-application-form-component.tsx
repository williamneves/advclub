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
  Flex,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { z } from 'zod'
import { zodResolver } from 'mantine-form-zod-resolver'
import { api } from '@/trpc/react'
import dayjs from 'dayjs'
import { formsDefaultSchema } from '../../_components/types'
import { membershipApplicationFormFieldSchema } from './membership-application.type'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { notifications } from '@mantine/notifications'
import { cn } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import {
  IconChecks,
  IconChevronLeft,
  IconDeviceFloppy,
  IconEdit,
  IconTrash,
  IconX,
} from '@tabler/icons-react'
import { modals } from '@mantine/modals'

const schema = z
  .object({
    form: formsDefaultSchema.extend({
      fields: membershipApplicationFormFieldSchema,
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
    title: 'Membership Application',
    slug: 'membership-application',
    description: 'Membership Application',
    status: 'draft',
    guardianId: 0,
    kidId: 0,
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

export function MembershipApplicationForm({
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
      disabled,
    }),
  })

  const clubName = 'Brisbane'

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

  const law = !!form.errors?.['form.fields.lawPledge']
  const commitment = !!form.errors?.['form.fields.commitment']
  const approvalOfParents = !!form.errors?.['form.fields.approvalOfParents']
  const consentAndSign = !!form.errors?.['form.fields.consentAndSign']

  const handleGoToEdit = () => {
    const path = pathname.replace('/view', '/edit')
    router.push(path)
  }

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
      router.push(`/club/members/applications`)
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
      router.push(`/club/members/applications`)
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
            <Title order={2}>Membership Application</Title>
            <Text fz={'sm'} c={'dimmed'}>
              {t('form_disclaimer')}
            </Text>
            <Divider />
          </Stack>

          <Stack gap={4}>
            <Text fz={'sm'} fw={'bold'}>
              {t('form_parent_selector.disclaimer')}
            </Text>
            <Stack gap={4}>
              <Select
                label={t('form_parent_selector.kid_label')}
                placeholder={t('form_parent_selector.kid_placeholder')}
                readOnly={kids.isLoading}
                rightSection={kids.isLoading ? <Loader size={16} /> : undefined}
                data={kidsSelectData}
                {...form.getInputProps('form.kidId')}
              />
              <Select
                label={t('form_parent_selector.responsible_person_label')}
                placeholder={t(
                  'form_parent_selector.responsible_person_placeholder',
                )}
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
              <Alert title={t('form_alert_title')} />
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
                legend={
                  <Badge color={law ? 'red' : undefined}>Law & Pledge</Badge>
                }
                className="flex flex-col gap-4"
                classNames={{
                  root: cn(law && 'border-red-500 bg-red-50'),
                }}
              >
                <Group align="center" gap={'md'} wrap="nowrap">
                  <Checkbox
                    size="lg"
                    {...form.getInputProps('form.fields.lawPledge', {
                      type: 'checkbox',
                    })}
                    error={''}
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
              <Fieldset
                legend={
                  <Badge color={commitment ? 'red' : undefined}>
                    Applicant's Commitment
                  </Badge>
                }
                classNames={{
                  root: cn(commitment && 'border-red-500 bg-red-50'),
                }}
              >
                <Group wrap="nowrap" align="center" gap={'md'}>
                  <Checkbox
                    size="lg"
                    {...form.getInputProps('form.fields.commitment', {
                      type: 'checkbox',
                    })}
                    error={''}
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
                      <Radio disabled={disabled} value="yes" label="Yes" />
                      <Radio disabled={disabled} value="no" label="No" />
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
                      <Radio disabled={disabled} value="yes" label="Yes" />
                      <Radio disabled={disabled} value="no" label="No" />
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
                      <Checkbox
                        disabled={disabled}
                        value="Little Lamb"
                        label="Little Lamb"
                      />
                      <Checkbox
                        disabled={disabled}
                        value="Eager Beaver"
                        label="Eager Beaver"
                      />
                      <Checkbox
                        disabled={disabled}
                        value="Busy Bee"
                        label="Busy Bee"
                      />
                      <Checkbox
                        disabled={disabled}
                        value="Sunbeam"
                        label="Sunbeam"
                      />
                      <Checkbox
                        disabled={disabled}
                        value="Builder"
                        label="Builder"
                      />
                      <Checkbox
                        disabled={disabled}
                        value="Helping Hand"
                        label="Helping Hand"
                      />
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
                        <Radio disabled={disabled} value="yes" label="Yes" />
                        <Radio disabled={disabled} value="no" label="No" />
                      </Group>
                    </Radio.Group>
                    <Radio.Group
                      label="Mother"
                      {...form.getInputProps('form.fields.masterGuides.mother')}
                    >
                      <Group>
                        <Radio disabled={disabled} value="yes" label="Yes" />
                        <Radio disabled={disabled} value="no" label="No" />
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
                        <Radio disabled={disabled} value="yes" label="Yes" />
                        <Radio disabled={disabled} value="no" label="No" />
                      </Group>
                    </Radio.Group>
                    <Radio.Group
                      label="Mother"
                      {...form.getInputProps(
                        'form.fields.adventuresBefore.mother',
                      )}
                    >
                      <Group>
                        <Radio disabled={disabled} value="yes" label="Yes" />
                        <Radio disabled={disabled} value="no" label="No" />
                      </Group>
                    </Radio.Group>
                  </Stack>
                </Stack>
              </Fieldset>

              {/* Approval of Parents */}
              <Fieldset
                legend={
                  <Badge color={approvalOfParents ? 'red' : undefined}>
                    Approval of Parents or Guardians
                  </Badge>
                }
                classNames={{
                  root: cn(approvalOfParents && 'border-red-500 bg-red-50'),
                }}
              >
                <Group align="center" gap={'md'} wrap="nowrap">
                  <Checkbox
                    size="lg"
                    {...form.getInputProps('form.fields.approvalOfParents', {
                      type: 'checkbox',
                    })}
                    error={''}
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
                  We hereby certify that {kidName} was born on {kidAge}
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
                        void handleRejectForm()
                      }}
                    >
                      {t('form_reject')}
                    </Button>
                    <Button
                      type="button"
                      rightSection={<IconChecks size={20} stroke={1.5} />}
                      onClick={() => {
                        void handleApproveForm()
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
