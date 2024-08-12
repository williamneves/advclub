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
  Divider,
  Group,
  Button,
  Box,
  LoadingOverlay,
  Image,
  Alert,
  Flex,
  ThemeIcon,
  Radio,
  Textarea,
} from '@mantine/core'
import { IconPhotoUp, IconX } from '@tabler/icons-react'
import { FileButton } from '@mantine/core'
import { useUploadAvatar } from '@/lib/useUploadFiles'
import { api, type RouterOutputs } from '@/trpc/react'
import { z } from 'zod'
import { sexEnumSchema } from '@/server/db/schemas'
import { zodResolver } from 'mantine-form-zod-resolver'
import { useRouter } from 'next/navigation'
import { notifications } from '@mantine/notifications'
import { cn } from '@/lib/utils'
import { DateInput, DateInputProps } from '@mantine/dates'
import dayjs from 'dayjs'
import { deleteFileByUrl } from '@/utils/supabase/uploads'

const editKidSchema = (t: (key: string) => string) =>
  z
    .object({
      firstName: z.string().min(1, t('firstName.error')),
      lastName: z.string().min(1, t('lastName.error')),
      avatar: z.string().optional(),
      alias: z.string().optional(),
      height: z.string().optional(),
      weight: z.string().optional(),
      sex: sexEnumSchema,
      birthDate: z.coerce
        .string()
        .transform((value) => new Date(value).toISOString()),
      notes: z.string().optional(),
    })
    .refine((data) => data.sex !== '', {
      path: ['sex'],
      message: t('sex.error'),
    })

type EditKidFormData = z.infer<ReturnType<typeof editKidSchema>>

type EditKidFormProps = {
  kidId: string
}

export function EditKidForm({ kidId }: EditKidFormProps) {
  const router = useRouter()
  const t = useTranslations('kid_form')
  const schema = editKidSchema(t)
  const [loading, setLoading] = useState(false)

  const [kid] = api.club.kids.getKidById.useSuspenseQuery({
    id: parseInt(kidId),
  })

  const form = useForm<EditKidFormData>({
    initialValues: {
      firstName: kid?.firstName ?? '',
      lastName: kid?.lastName ?? '',
      alias: kid?.alias ?? '',
      height: kid?.height ?? '',
      weight: kid?.weight ?? '',
      sex: kid?.sex ?? '',
      avatar: kid?.avatar ?? '',
      birthDate: kid?.birthDate ?? '',
    },
    validate: zodResolver(schema),
    enhanceGetInputProps: () => ({
      disabled: loading,
    }),
  })

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
      setLoading(true)
      let avatarFileUrl = kid?.avatar ?? ''

      // If avatar file changed, upload new avatar
      if (avatarFile) {
        const newAvatarUrl = await uploadAvatar(
          kid?.family.uuid ?? '',
          kid?.id ?? 0,
        )
        if (newAvatarUrl) {
          avatarFileUrl = newAvatarUrl

          // Delete old avatar
          if (kid?.avatar && newAvatarUrl !== kid.avatar) {
            await deleteFileByUrl(kid.avatar)
          }
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
          height: data.height ?? kid?.height,
          weight: data.weight ?? kid?.weight,
          sex: data.sex ?? kid?.sex,
          avatar: avatarFileUrl ?? kid?.avatar ?? '',
          birthDate: data.birthDate ?? kid?.birthDate,
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
          <Alert>{t('edit_description')}</Alert>
          <Divider />
          <Flex>
            <Stack gap={8}>
              <div className="flex flex-shrink flex-col gap-4">
                {!avatarUrl ? (
                  <FileButton onChange={setAvatarFile} accept="image/*">
                    {(props) => (
                      <Card
                        onClick={props.onClick}
                        withBorder
                        shadow="md"
                        className="align-center flex h-[168px] w-[168px] cursor-pointer flex-col items-center justify-center gap-2 rounded-md"
                      >
                        <ThemeIcon size={64} variant="light" color="gray">
                          <IconPhotoUp size={44} stroke={1.5} />
                        </ThemeIcon>
                        <Text fz={'sm'} c={'dimmed'} ta={'center'}>
                          {t('files.avatar.placeholder').toLocaleUpperCase()}
                        </Text>
                      </Card>
                    )}
                  </FileButton>
                ) : (
                  <Card
                    withBorder
                    shadow="md"
                    className="relative h-[168px] w-[168px]"
                  >
                    <LoadingOverlay visible={loading} />
                    <Card.Section>
                      <Image
                        src={avatarUrl}
                        alt="avatar"
                        className="h-[168px] w-[168px] object-cover"
                        width={168}
                        height={168}
                      />
                      <IconX
                        stroke={2}
                        color="white"
                        className="shadow-md absolute right-2 top-2 cursor-pointer rounded-full border border-solid border-white bg-red-500 p-1 shadow-mtn-md ring-2 ring-red-500 transition-all ease-in-out hover:scale-110"
                        onClick={handleRemoveAvatar}
                      />
                    </Card.Section>
                  </Card>
                )}
              </div>
              <Stack align="flex-start" justify="center">
                <Flex direction={'column'} w={'100%'} gap={4}>
                  <Group justify="center">
                    {!avatarUrl && (
                      <FileButton onChange={setAvatarFile} accept="image/*">
                        {(props) => (
                          <Button w={'100%'} {...props} disabled={loading}>
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
                  <Text fz={'xs'} c={'dimmed'} ta={'center'}>
                    {t('files.avatar.accept')}
                  </Text>
                </Flex>
              </Stack>
            </Stack>
          </Flex>
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
            <DateInput
              valueFormat="MM/DD/YYYY"
              label={t('birthDate.label')}
              placeholder={t('birthDate.placeholder')}
              {...form.getInputProps('birthDate')}
              value={new Date(form.getInputProps('birthDate').value)}
            />
            <Radio.Group label={t('sex.label')} {...form.getInputProps('sex')}>
              <Group align="center" gap={12} grow>
                {['male', 'female'].map((sex) => (
                  <Radio
                    iconColor={'white'}
                    color={sex === 'male' ? 'blue' : 'pink'}
                    className={cn(
                      'flex h-[36px] items-center justify-start rounded-md border border-solid border-gray-300 px-4',
                      {
                        'bg-blue-100': sex === 'male',
                        'bg-pink-100': sex === 'female',
                        'border-blue-300': sex === 'male',
                        'border-pink-300': sex === 'female',
                      },
                    )}
                    key={sex}
                    value={sex}
                    label={t(`sex.options.${sex}`)}
                    disabled={loading}
                  />
                ))}
              </Group>
            </Radio.Group>
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
          </SimpleGrid>

          <Textarea
            autosize
            minRows={3}
            maxRows={7}
            label={t('notes.label')}
            placeholder={t('notes.placeholder')}
            {...form.getInputProps('notes')}
          />
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

const dateParser: DateInputProps['dateParser'] = (input) => {
  console.log(input)

  return dayjs(input, 'DD/MM/YYYY').toDate()
}
