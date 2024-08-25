'use client'

import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'

import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { api } from '@/trpc/react'
import { notifications } from '@mantine/notifications'
import { useRouter } from 'next/navigation'
import {
  Modal,
  Stack,
  TextInput,
  Select,
  Button,
  Group,
  Radio,
  Card,
  Title,
  Text,
  Input,
  SimpleGrid,
  Divider,
  Checkbox,
  Badge,
  Alert,
  FileInput,
  Box,
  FileButton,
  LoadingOverlay,
  Flex,
  ThemeIcon,
} from '@mantine/core'
import Image from 'next/image'
import { IconCheck, IconPdf, IconX } from '@tabler/icons-react'
import { parentsGuardiansType } from '@/server/db/schemas/parents'
import { sexEnumSchema } from '@/server/db/schemas'
import { PatternFormat } from 'react-number-format'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DropzoneInput } from '@/components/form-inputs/dropzone'
import { useUploadAvatar, useUploadDriverLicense } from '@/lib/useUploadFiles'

const createParentSchema = (t: (key: string) => string) =>
  z
    .object({
      firstName: z.string().min(1, t('firstName.error')),
      lastName: z.string().min(1, t('lastName.error')),
      type: parentsGuardiansType,
      sex: sexEnumSchema,
      phone: z
        .string()
        .min(4, t('phone.error'))
        .transform((value) => value.replace(/\D/g, '')),
      email: z.string().email(t('email.error')),
      main: z.boolean().default(false),
      allowToPickUp: z.boolean().default(false),
      allowToAssignSignatures: z.boolean().default(false),
    })
    .refine((data) => data.sex !== '', {
      path: ['sex'],
      message: t('sex.error'),
    })

type NewParentFormData = z.infer<ReturnType<typeof createParentSchema>>

type NewParentFormProps = {
  familyId: number
  familyUUID: string
  isFirstParent: boolean
}

export function NewParentForm({
  familyId,
  familyUUID,
  isFirstParent,
}: NewParentFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const t = useTranslations('parent_form')
  const schema = createParentSchema(t)

  const form = useForm<NewParentFormData>({
    initialValues: {
      firstName: '',
      lastName: '',
      type: 'parent',
      sex: '',
      phone: '',
      email: '',
      main: isFirstParent,
      allowToPickUp: isFirstParent,
      allowToAssignSignatures: isFirstParent,
    },
    validate: zodResolver(schema),
    enhanceGetInputProps: () => ({
      disabled: createParent.isPending || loading,
    }),
  })

  const utils = api.useUtils()
  const createParent = api.club.parents.createParent.useMutation({
    onSuccess: async () => {
      await utils.club.parents.getParentsByLoggedInFamily.invalidate()
      await utils.club.families.getLoggedInFamily.invalidate()
    },
  })

  const updateParent = api.club.parents.updateParent.useMutation({
    onSuccess: async () => {
      await utils.club.parents.getParentsByLoggedInFamily.invalidate()
      await utils.club.families.getLoggedInFamily.invalidate()
    },
  })

  const { avatarFile, setAvatarFile, uploadAvatar } = useUploadAvatar()

  const { uploadDriverLicense, driverLicenseFile, setDriverLicenseFile } =
    useUploadDriverLicense()

  const handleSubmit = async (data: NewParentFormData) => {
    // If pickup is active, parent need to have avatar and driver licence
    if (data.allowToPickUp) {
      if (!avatarFile) {
        form.setFieldError('allowToPickUp', t('permissions.pickup.error'))
        return
      }
      if (!driverLicenseFile) {
        form.setFieldError('allowToPickUp', t('permissions.pickup.error'))
        return
      }
    }

    try {
      setLoading(true)

      // Revalidate form
      const values = schema.parse(data)

      // Create parent and get the id
      const parent = await createParent.mutateAsync({
        ...values,
        familyId,
      })
      const parentId = parent[0]?.id

      if (!parentId) {
        throw new Error('Parent not created')
      }

      // Upload the files
      let avatarUrl: string | null = null
      let driverLicenceUrl: string | null = null
      if (avatarFile) {
        avatarUrl = await uploadAvatar(familyUUID, parentId)
        if (!avatarUrl) {
          throw new Error('Avatar not uploaded')
        }
      }
      if (driverLicenseFile) {
        driverLicenceUrl = await uploadDriverLicense(familyUUID, parentId)
        if (!driverLicenceUrl) {
          throw new Error('Driver licence not uploaded')
        }
      }

      // Update parent with the files
      await updateParent.mutateAsync({
        id: parentId,
        data: {
          avatar: avatarUrl ?? '',
          driverLicense: driverLicenceUrl ?? '',
        },
      })

      notifications.show({
        message: t('toast.success'),
        icon: <IconCheck />,
        color: 'teal',
      })
      form.reset()
      router.push(`/club/family`)
    } catch (error) {
      console.error('Error creating parent:', error)
      notifications.show({
        message: t('toast.error'),
        icon: <IconX />,
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  const driverLicenceUrl = useMemo(() => {
    if (!driverLicenseFile) return null
    return URL.createObjectURL(driverLicenseFile)
  }, [driverLicenseFile])

  const avatarUrl = useMemo(() => {
    if (!avatarFile) return null
    return URL.createObjectURL(avatarFile)
  }, [avatarFile])

  useEffect(() => {
    if (isFirstParent) {
      form.setFieldValue('allowToPickUp', true)
      form.setFieldValue('allowToAssignSignatures', true)
    }
  }, [isFirstParent])

  return (
    <Card withBorder w={'100%'}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Title order={3}>{t('title')}</Title>
          <Text>{t('description')}</Text>

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Radio.Group
              label={t('type.label')}
              {...form.getInputProps('type')}
            >
              <Stack gap={6}>
                {parentsGuardiansType.options.map((type) => (
                  <Radio
                    key={type}
                    value={type}
                    label={t(`type.options.${type}`)}
                    disabled={loading}
                  />
                ))}
              </Stack>
            </Radio.Group>

            <Radio.Group label={t('sex.label')} {...form.getInputProps('sex')}>
              <Stack gap={6}>
                {['male', 'female'].map((sex) => (
                  <Radio
                    key={sex}
                    value={sex}
                    label={t(`sex.options.${sex}`)}
                    disabled={loading}
                  />
                ))}
              </Stack>
            </Radio.Group>
            <TextInput
              label={t('firstName.label')}
              placeholder={t('firstName.placeholder')}
              {...form.getInputProps('firstName')}
            />
            <TextInput
              label={t('lastName.label')}
              placeholder={t('lastName.placeholder')}
              {...form.getInputProps('lastName')}
            />
            <Input.Wrapper label={t('phone.label')} error={form.errors.phone}>
              <Input
                placeholder={t('phone.placeholder')}
                component={PatternFormat}
                mask={'_'}
                format={'(###) ###-####'}
                {...form.getInputProps('phone')}
              />
            </Input.Wrapper>

            <TextInput
              label={t('email.label')}
              placeholder={t('email.placeholder')}
              {...form.getInputProps('email')}
            />
          </SimpleGrid>
          <Divider
            label={
              <Badge size="sm" variant="outline" radius={'sm'} color="blue">
                {t('divider')}
              </Badge>
            }
            labelPosition="left"
          />
          {isFirstParent && (
            <Alert title={t('permissions.firstParentAlert.title')} color="blue">
              {t('permissions.firstParentAlert.description')}
            </Alert>
          )}
          <Checkbox
            label={t('permissions.pickup.label')}
            description={t('permissions.pickup.description')}
            {...form.getInputProps('allowToPickUp', { type: 'checkbox' })}
            disabled={isFirstParent}
          />
          <Checkbox
            label={t('permissions.sign_document.label')}
            description={t('permissions.sign_document.description')}
            {...form.getInputProps('allowToAssignSignatures', {
              type: 'checkbox',
            })}
            disabled={isFirstParent}
          />
          <Divider label={t('files.divider')} labelPosition="left" />

          <Stack gap={'lg'}>
            {form.errors.allowToPickUp && (
              <Alert title={t('permissions.pickup.error')} color="red" />
            )}
            <div className="flex flex-col gap-4 md:flex-row">
              {!avatarUrl ? (
                <Box className="align-center flex h-[160px] w-[160px] flex-col justify-center gap-2 rounded-md border-4 border-dashed border-gray-400 bg-gray-50 p-6">
                  <Text ta={'center'}>{t('files.avatar.placeholder')}</Text>
                </Box>
              ) : (
                <Box className="relative h-[160px] w-[160px] overflow-hidden rounded-md ring-4 ring-gray-400 ring-offset-4 ring-offset-white">
                  <LoadingOverlay visible={loading} />
                  <Image
                    priority
                    src={avatarUrl}
                    alt="avatar"
                    className="h-[160px] w-[160px] object-cover"
                    width={160}
                    height={160}
                  />
                  <IconX
                    className="absolute right-2 top-2 cursor-pointer rounded-full bg-white p-1"
                    onClick={() => setAvatarFile(null)}
                  />
                </Box>
              )}

              <Stack align="flex-start" justify="flex-end" gap={4}>
                <Text fz={'sm'} c={'dimmed'}>
                  {t('files.avatar.disclaimer')}
                </Text>
                <Group justify="center">
                  {!avatarUrl && (
                    <FileButton onChange={setAvatarFile} accept="image/*">
                      {(props) => (
                        <Button variant="light" {...props} disabled={loading}>
                          {t('files.avatar.label')}
                        </Button>
                      )}
                    </FileButton>
                  )}
                  {avatarUrl && (
                    <Button
                      onClick={() => setAvatarFile(null)}
                      color="red"
                      rightSection={<IconX />}
                      disabled={loading}
                    >
                      {t('files.avatar.remove')}
                    </Button>
                  )}
                </Group>
              </Stack>
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
              {!driverLicenceUrl ? (
                <Box className="align-center flex h-[161px] w-[210px] flex-col justify-center gap-2 rounded-md border-4 border-dashed border-gray-400 bg-gray-50 p-6">
                  <Text ta={'center'}>
                    {t('files.driverLicence.placeholder')}
                  </Text>
                </Box>
              ) : (
                <Box className="relative flex h-[161px] w-[210px] items-center justify-center overflow-hidden rounded-md ring-4 ring-gray-400 ring-offset-4 ring-offset-white">
                  <LoadingOverlay visible={loading} />
                  {driverLicenceUrl &&
                    driverLicenseFile?.type.includes('image') && (
                      <Image
                        priority
                        src={driverLicenceUrl}
                        alt="avatar"
                        className="h-[161px] w-[210px] object-cover"
                        width={210}
                        height={161}
                      />
                    )}
                  {driverLicenceUrl &&
                    driverLicenseFile?.type.includes('pdf') && (
                      <ThemeIcon variant="light" color="blue" size={'xl'}>
                        <IconPdf size={64} />
                      </ThemeIcon>
                    )}
                  <IconX
                    className="absolute right-2 top-2 cursor-pointer rounded-full bg-white p-1"
                    onClick={
                      loading ? undefined : () => setDriverLicenseFile(null)
                    }
                  />
                </Box>
              )}

              <Stack align="flex-start" justify="flex-end" gap={4}>
                <Text fz={'sm'} c={'dimmed'}>
                  {t('files.driverLicence.disclaimer')}
                </Text>
                <Group justify="center">
                  {!driverLicenceUrl && (
                    <FileButton
                      onChange={setDriverLicenseFile}
                      accept="image/*,application/pdf"
                    >
                      {(props) => (
                        <Button variant="light" {...props} disabled={loading}>
                          {t('files.driverLicence.label')}
                        </Button>
                      )}
                    </FileButton>
                  )}
                  {driverLicenceUrl && (
                    <Button
                      onClick={() => setDriverLicenseFile(null)}
                      color="red"
                      rightSection={<IconX />}
                      disabled={loading}
                    >
                      {t('files.driverLicence.remove')}
                    </Button>
                  )}
                </Group>
              </Stack>
            </div>
          </Stack>
          <Divider />
          <Group justify="flex-start">
            <Button type="submit" loading={loading}>
              {loading ? t('button.loading') : t('button.label')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  )
}
