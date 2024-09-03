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
  Loader,
  Select,
  Flex,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { z } from 'zod'
import { zodResolver } from 'mantine-form-zod-resolver'
import { formsDefaultSchema } from '../../_components/types'
import { api } from '@/trpc/react'
import { codeConductFormFieldSchema } from '../_components/code-conduct.type'
import { cn } from '@/lib/utils'
import { notifications } from '@mantine/notifications'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { modals } from '@mantine/modals'
import {
  IconChevronLeft,
  IconDeviceFloppy,
  IconEdit,
  IconTrash,
  IconChecks,
  IconX,
} from '@tabler/icons-react'

const schema = z
  .object({
    form: formsDefaultSchema.extend({
      fields: codeConductFormFieldSchema,
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
    title: 'Code of Conduct and Participation Agreement',
    slug: 'code-conduct',
    description:
      'Terms and Conditions of Code of Conduct and Participation Agreement',
    status: 'draft',
    guardianId: 0,
    kidId: 0,
    reviewedBy: null,
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

export function CodeConductForm({
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
      await utils.club.forms.getForms.invalidate()
      await utils.club.forms.getFormsBySlug.invalidate()
      await utils.club.forms.getFormsByLoggedInFamily.invalidate()
    },
  })

  const checkBoxError = !!form.errors?.['form.fields.codeAgreement']
  const consentError =
    !!form.errors?.['form.fields.kidSign'] ||
    !!form.errors?.['form.fields.parentSign']

  const handleCreateForm = async (values: FormType) => {
    console.log(schema.parse(values))
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
      router.push('/club/forms')
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
              legend={
                <Badge color={checkBoxError ? 'red' : undefined}>Consent</Badge>
              }
              className="flex flex-col gap-4"
              classNames={{
                root: cn(checkBoxError && 'border-red-500 bg-red-50'),
              }}
            >
              <Group align="center" gap={'md'} wrap="nowrap">
                <Checkbox
                  size="lg"
                  {...form.getInputProps('form.fields.codeAgreement', {
                    type: 'checkbox',
                  })}
                  error={''}
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
            <Fieldset
              legend={
                <Badge color={consentError ? 'red' : undefined}>
                  Consent and Sign
                </Badge>
              }
              classNames={{
                root: cn(consentError && 'border-red-500 bg-red-50'),
              }}
            >
              <Stack gap={20}>
                <Stack gap={4}>
                  <Text fz={'sm'} fw={'bold'}>
                    Select the kid and the responsible person to be able to fill
                    the application.
                  </Text>
                  <Stack gap={4}>
                    <Select
                      label="Kid"
                      placeholder="Select a kid"
                      readOnly={kids.isLoading}
                      rightSection={
                        kids.isLoading ? <Loader size={16} /> : undefined
                      }
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
        </Stack>
      </Card>
    </form>
  )
}
