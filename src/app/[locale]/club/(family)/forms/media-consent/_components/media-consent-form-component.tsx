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
import { useEffect, useState } from 'react'
import { notifications } from '@mantine/notifications'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { capitalizeWords, formatPhoneNumber } from '@/utils/stringUtils'
import { usePathname, useRouter } from 'next/navigation'
import { formsDefaultSchema } from '../../_components/types'
import { mediaConsentFormFieldSchema } from './media-consent.type'
import { modals } from '@mantine/modals'
import {
  IconChevronLeft,
  IconDeviceFloppy,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react'

const schema = z
  .object({
    form: formsDefaultSchema.extend({
      fields: mediaConsentFormFieldSchema,
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
    title: 'Media Consent',
    slug: 'media-consent',
    description: 'Terms and Conditions of Media Consent',
    status: 'draft',
    guardianId: 0,
    kidId: 0,
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

export function MediaConsent({
  formId,
  mode,
}: {
  formId?: number
  mode: 'edit' | 'new' | 'view'
}) {
  const [loading, setLoading] = useState(false)
  const t = useTranslations('common')
  const router = useRouter()
  const pathname = usePathname()

  const disabled = loading || mode === 'view'

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

  const checkBoxError = !!form.errors?.['form.fields.check']
  const formError =
    !!form.errors?.['form.fields.grade'] ||
    !!form.errors?.['form.fields.firstPhoneType'] ||
    !!form.errors?.['form.fields.secondPhoneType'] ||
    !!form.errors?.['form.fields.secondContactNumber'] ||
    !!form.errors?.['form.fields.email']
  const consentAndSignError = !!form.errors?.['form.fields.consentAndSign']

  // const handleSubmit = (values: FormType) => {
  //   console.log(values)
  //   console.log(schema.parse(values))
  // }

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
              !!form.getValues().form.kidId &&
              !!form.getValues().form.guardianId
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
                <Text>
                  This is a Parental Permission Form for Minor’s Online
                  Participation in all TLT activities as well as taking photos
                  and videos at TLT activities that may be used on the TLT
                  YouTube Channel and other conference media resources.
                </Text>
              </Fieldset>

              {/* Form */}
              <Fieldset
                legend={
                  <Badge color={formError ? 'red' : undefined}>Form</Badge>
                }
                classNames={{
                  root: cn(formError && 'border-red-500 bg-red-50'),
                }}
              >
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
                      <Text fz={'sm'}>
                        <b>Phone:</b>{' '}
                        {parentPhone
                          ? formatPhoneNumber(parentPhone)
                          : 'Not provided'}
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
                    <Text fz={'sm'}>
                      <b>Address:</b>{' '}
                      {parentAddress
                        ? capitalizeWords(parentAddress)
                        : 'Not provided'}
                    </Text>
                  </Stack>
                </Stack>
              </Fieldset>

              <Fieldset
                legend={
                  <Badge color={checkBoxError ? 'red' : undefined}>Check</Badge>
                }
                className="flex flex-col gap-4"
                classNames={{
                  root: cn(checkBoxError && 'border-red-500 bg-red-50'),
                }}
              >
                <Stack>
                  <Radio.Group
                    label="Check one of the following:"
                    {...form.getInputProps('form.fields.check')}
                    error={''}
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
              <Fieldset
                legend={
                  <Badge color={consentAndSignError ? 'red' : undefined}>
                    Consent and Sign
                  </Badge>
                }
                classNames={{
                  root: cn(consentAndSignError && 'border-red-500 bg-red-50'),
                }}
              >
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
                  </Text>
                  <Text fw={'bold'} fs="italic">
                    I have read and understand the foregoing.
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
              <Group justify="flex-end">
                <Button
                  type="button"
                  variant="outline"
                  mr="auto"
                  onClick={() => router.back()}
                >
                  <IconChevronLeft />
                </Button>
                {mode !== 'new' && (
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
              </Group>
            </Stack>
          </Collapse>
        </Stack>
      </Card>
    </form>
  )
}
