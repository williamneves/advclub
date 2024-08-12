'use client'

import { useEffect, useState } from 'react'
import { useForm } from '@mantine/form'
import { useTranslations } from 'next-intl'

import {
  Card,
  Stack,
  Title,
  Text,
  SimpleGrid,
  TextInput,
  Select,
  Checkbox,
  Divider,
  Group,
  Button,
  Box,
  LoadingOverlay,
  Image,
  ThemeIcon,
  Alert,
} from '@mantine/core'
import { IconX, IconPdf, IconCheck } from '@tabler/icons-react'
import { FileButton } from '@mantine/core'
import { useUploadAvatar, useUploadDriverLicense } from '@/lib/useUploadFiles'
import { api, type RouterOutputs } from '@/trpc/react'
import { z } from 'zod'
import { parentsGuardiansType } from '@/server/db/schemas'
import { zodResolver } from 'mantine-form-zod-resolver'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { notifications } from '@mantine/notifications'
import { deleteFileByUrl } from '@/utils/supabase/uploads'

export const getParentFormSchema = (t: (key: string) => string) =>
  z
    .object({
      firstName: z.string().min(1, t('firstName.error')).nullish(),
      lastName: z.string().min(1, t('lastName.error')).nullish(),
      type: parentsGuardiansType,
      sex: z.enum(['male', 'female', '']).nullish(),
      // remove all non-digit characters
      phone: z
        .string()
        .transform((value) => value.replace(/\D/g, ''))
        .nullish(),
      email: z.string().email().nullish(),
      allowToPickUp: z.boolean().default(false).nullish(),
      allowToAssignSignatures: z.boolean().default(false).nullish(),
      main: z.boolean().default(false).nullish(),
      avatar: z.string().nullish(),
      driverLicense: z.string().nullish(),
    })
    .refine((data) => data.sex !== '', {
      path: ['sex'],
      message: t('sex.error'),
    })

export type EditParentFormData = z.infer<ReturnType<typeof getParentFormSchema>>

export type EditParentFormProps = {
  parent: NonNullable<RouterOutputs['club']['parents']['getParentById']>
}

export function EditParentForm({ parent }: EditParentFormProps) {
  const router = useRouter()
  const t = useTranslations('parent_form')
  const schema = getParentFormSchema(t)
  const form = useForm<EditParentFormData>({
    initialValues: {
      firstName: parent.firstName,
      lastName: parent.lastName,
      type: parent.type,
      sex: parent.sex,
      phone: parent.phone,
      email: parent.email,
      allowToPickUp: parent.allowToPickUp,
      allowToAssignSignatures: parent.allowToAssignSignatures,
      main: parent.main,
      avatar: parent.avatar,
      driverLicense: parent.driverLicense,
    },
    validate: zodResolver(schema),
    enhanceGetInputProps: () => ({
      disabled: loading,
    }),
  })
  const [loading, setLoading] = useState(false)

  const utils = api.useUtils()

  const updateParent = api.club.parents.updateParent.useMutation({
    onSuccess: async () => {
      await utils.club.parents.getParentsByLoggedInFamily.invalidate()
      await utils.club.families.getLoggedInFamily.invalidate()
      await utils.club.parents.getParentById.invalidate(
        {
          id: parent.id,
        },
        {
          exact: false,
        },
      )
    },
  })

  const { uploadAvatar, avatarFile, setAvatarFile } = useUploadAvatar()

  const handleRemoveAvatar = () => {
    form.setFieldValue('avatar', '')
    setAvatarFile(null)
  }

  const { uploadDriverLicense, driverLicenseFile, setDriverLicenseFile } =
    useUploadDriverLicense()

  const handleRemoveDriverLicence = () => {
    form.setFieldValue('driverLicense', '')
    setDriverLicenseFile(null)
  }

  const handleSubmit = async (values: typeof form.values) => {
    const data = getParentFormSchema(t).parse(values)
    try {
      let avatarFileUrl = parent.avatar
      let driverLicenseFileUrl = parent.driverLicense

      // If avatar file changed, upload new avatar
      if (avatarFile) {
        const newAvatarUrl = await uploadAvatar(parent.family.uuid, parent.id)
        if (newAvatarUrl) {
          avatarFileUrl = newAvatarUrl
          // Delete old avatar
          if (parent.avatar && newAvatarUrl !== parent.avatar) {
            await deleteFileByUrl(parent.avatar)
          }
        }
      }

      // If driver licence file changed, upload new driver licence
      if (driverLicenseFile) {
        const newDriverLicenceUrl = await uploadDriverLicense(
          parent.family.uuid,
          parent.id,
        )
        if (newDriverLicenceUrl) {
          driverLicenseFileUrl = newDriverLicenceUrl
          // Delete old driver licence
          if (
            parent.driverLicense &&
            newDriverLicenceUrl !== parent.driverLicense
          ) {
            await deleteFileByUrl(parent.driverLicense)
          }
        }
      }

      // Update parent with new data
      await updateParent.mutateAsync({
        id: parent.id,
        data: {
          ...data,
          avatar: avatarFileUrl,
          driverLicense: driverLicenseFileUrl,
        },
      })

      form.setValues({
        ...form.values,
        avatar: avatarFileUrl,
        driverLicense: driverLicenseFileUrl,
      })

      form.reset()

      notifications.show({
        message: t('edit_toast.success'),
        icon: <IconCheck />,
        color: 'teal',
      })
      router.push(`/club/family/parents`)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const driverLicenseUrl = driverLicenseFile
    ? URL.createObjectURL(driverLicenseFile)
    : form.getValues().driverLicense
      ? form.getValues().driverLicense
      : null

  const avatarUrl = avatarFile
    ? URL.createObjectURL(avatarFile)
    : form.getValues().avatar
      ? form.getValues().avatar
      : null

  
  return (
    <Card withBorder w={'100%'}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Title order={3}>{t('edit_title')}</Title>
          <Text>{t('edit_description')}</Text>

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput
              label={t('firstName.label')}
              placeholder={t('firstName.placeholder')}
              {...form.getInputProps('firstName')}
              required
            />
            <TextInput
              label={t('lastName.label')}
              placeholder={t('lastName.placeholder')}
              {...form.getInputProps('lastName')}
              required
            />
            <Select
              label={t('type.label')}
              data={[
                { value: 'parent', label: t('type.options.parent') },
                { value: 'guardian', label: t('type.options.guardian') },
                { value: 'relative', label: t('type.options.relative') },
              ]}
              {...form.getInputProps('type')}
              required
            />
            <Select
              label={t('sex.label')}
              data={[
                { value: 'male', label: t('sex.options.male') },
                { value: 'female', label: t('sex.options.female') },
                { value: 'other', label: t('sex.options.other') },
              ]}
              {...form.getInputProps('sex')}
              required
            />
            <TextInput
              label={t('phone.label')}
              placeholder={t('phone.placeholder')}
              {...form.getInputProps('phone')}
              required
            />
            <TextInput
              label={t('email.label')}
              placeholder={t('email.placeholder')}
              {...form.getInputProps('email')}
              required
            />
          </SimpleGrid>

          <Divider label={t('divider')} labelPosition="left" />

          <Checkbox
            label={t('permissions.pickup.label')}
            description={t('permissions.pickup.description')}
            {...form.getInputProps('allowToPickUp', { type: 'checkbox' })}
          />
          <Checkbox
            label={t('permissions.sign_document.label')}
            description={t('permissions.sign_document.description')}
            {...form.getInputProps('allowToAssignSignatures', {
              type: 'checkbox',
            })}
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
                    src={avatarUrl}
                    alt="avatar"
                    className="h-[160px] w-[160px] object-cover"
                    width={160}
                    height={160}
                  />
                  <IconX
                    className="absolute right-2 top-2 cursor-pointer rounded-full bg-white p-1"
                    onClick={handleRemoveAvatar}
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
                      onClick={handleRemoveAvatar}
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
              {!driverLicenseUrl ? (
                <Box className="align-center flex h-[161px] w-[210px] flex-col justify-center gap-2 rounded-md border-4 border-dashed border-gray-400 bg-gray-50 p-6">
                  <Text ta={'center'}>
                    {t('files.driverLicence.placeholder')}
                  </Text>
                </Box>
              ) : (
                <Box className="relative flex h-[161px] w-[210px] items-center justify-center overflow-hidden rounded-md ring-4 ring-gray-400 ring-offset-4 ring-offset-white">
                  <LoadingOverlay visible={loading} />
                  <Image
                    src={driverLicenseUrl + '?cache=false'}
                    alt="driver licence"
                    className={cn('h-[161px] w-[210px] object-cover', {
                      hidden: driverLicenseFile?.name.includes('pdf') && !driverLicenseUrl.includes('pdf'),
                    })}
                    width={210}
                    height={161}
                  />
                  <ThemeIcon
                    variant="light"
                    color="blue"
                    size={'xl'}
                    className={cn({
                      hidden: !driverLicenseFile?.name.includes('pdf') || !driverLicenseUrl.includes('pdf'),
                    })}
                  >
                    <IconPdf size={64} />
                  </ThemeIcon>
                  <IconX
                    className="absolute right-2 top-2 cursor-pointer rounded-full bg-white p-1"
                    onClick={loading ? undefined : handleRemoveDriverLicence}
                  />
                </Box>
              )}

              <Stack align="flex-start" justify="flex-end" gap={4}>
                <Text fz={'sm'} c={'dimmed'}>
                  {t('files.driverLicence.disclaimer')}
                </Text>
                <Group justify="center">
                  {!driverLicenseUrl && (
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
                  {driverLicenseUrl && (
                    <Button
                      onClick={handleRemoveDriverLicence}
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
              {loading ? t('edit_button.loading') : t('edit_button.label')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  )
}
