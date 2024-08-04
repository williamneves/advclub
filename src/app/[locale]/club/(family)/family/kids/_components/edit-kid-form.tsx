'use client'

import { useState } from 'react'
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
  Divider,
  Group,
  Button,
  Box,
  LoadingOverlay,
  Image,
} from '@mantine/core'
import { IconX } from '@tabler/icons-react'
import { FileButton } from '@mantine/core'
import { useUploadAvatar } from '@/lib/useUploadFiles'
import { api, type RouterOutputs } from '@/trpc/react'
import { z } from 'zod'
import { sexEnumSchema } from '@/server/db/schemas'
import { zodResolver } from 'mantine-form-zod-resolver'
import { useRouter } from 'next/navigation'
import { notifications } from '@mantine/notifications'

const editKidSchema = (t: (key: string) => string) =>
  z.object({
    firstName: z.string().min(1, t('firstName.error')).nullish(),
    lastName: z.string().min(1, t('lastName.error')).nullish(),
    alias: z.string().optional().nullish(),
    phoneNumber: z
      .string()
      .transform((value) => value.replace(/\D/g, ''))
      .nullish(),
    height: z.string().optional().nullish(),
    weight: z.string().optional().nullish(),
    sex: sexEnumSchema.nullish(),
    avatar: z.string().nullish(),
  })

type EditKidFormData = z.infer<ReturnType<typeof editKidSchema>>

type EditKidFormProps = {
  kidId: string
}

export function EditKidForm({ kidId }: EditKidFormProps) {
  const router = useRouter()
  const t = useTranslations('kid_form')
  const schema = editKidSchema(t)

  const [kid] = api.club.kids.getKidById.useSuspenseQuery({
    id: parseInt(kidId)
  })

  const form = useForm<EditKidFormData>({
    initialValues: {
      firstName: kid?.firstName ?? '',
      lastName: kid?.lastName ?? '',
      alias: kid?.alias ?? '',
      phoneNumber: kid?.phoneNumber ?? '',
      height: kid?.height ?? '',
      weight: kid?.weight ?? '',
      sex: kid?.sex ?? '',
      avatar: kid?.avatar ?? '',
    },
    validate: zodResolver(schema),
    enhanceGetInputProps: () => ({
      disabled: loading,
    }),
  })
  const [loading, setLoading] = useState(false)

  const utils = api.useUtils()

  const updateKid = api.club.kids.updateKid.useMutation({
    onSuccess: async () => {
      await utils.club.kids.getKidsByLoggedInFamily.invalidate()
      await utils.club.kids.getKidById.invalidate(
        {
          id: parseInt(kidId),
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

  const handleSubmit = async (values: typeof form.values) => {
    const data = editKidSchema(t).parse(values)
    try {
      let avatarFileUrl = kid?.avatar ?? ''

      // If avatar file changed, upload new avatar
      if (avatarFile) {
        const newAvatarUrl = await uploadAvatar(kid?.family.uuid ?? '', kid?.id ?? 0)
        if (newAvatarUrl) {
          avatarFileUrl = newAvatarUrl
        }
      }

      // Update kid with new data
      await updateKid.mutateAsync({
        id: parseInt(kidId),
        data: {
          ...data,
          firstName: data.firstName ?? kid?.firstName,
          lastName: data.lastName ?? kid?.lastName,
          alias: data.alias ?? kid?.alias,
          phoneNumber: data.phoneNumber ?? kid?.phoneNumber,
          height: data.height ?? kid?.height,
          weight: data.weight ?? kid?.weight,
          sex: data.sex ?? kid?.sex,
          avatar: avatarFileUrl ?? kid?.avatar ?? '',
        },
      })

      form.setValues({
        ...form.values,
        avatar: avatarFileUrl,
      })

      form.reset()

      notifications.show({
        message: t('edit_toast.success'),
        color: 'teal',
      })
      router.push(`/club/family/kids`)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

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
            <TextInput
              label={t('alias.label')}
              placeholder={t('alias.placeholder')}
              {...form.getInputProps('alias')}
            />
            <TextInput
              label={t('phoneNumber.label')}
              placeholder={t('phoneNumber.placeholder')}
              {...form.getInputProps('phoneNumber')}
              required
            />
            <TextInput
              label={t('height.label')}
              placeholder={t('height.placeholder')}
              {...form.getInputProps('height')}
            />
            <TextInput
              label={t('weight.label')}
              placeholder={t('weight.placeholder')}
              {...form.getInputProps('weight')}
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
          </SimpleGrid>

          <Divider label={t('files.divider')} labelPosition="left" />

          <Stack>
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
