'use client'

import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { api } from '@/trpc/react'
import { notifications } from '@mantine/notifications'
import { useRouter } from 'next/navigation'
import {
  Stack,
  TextInput,
  Button,
  Group,
  Radio,
  Card,
  Title,
  Text,
  Input,
  SimpleGrid,
  Divider,
  Badge,
  Box,
  FileButton,
  LoadingOverlay,
  ThemeIcon,
  Flex,
  Alert,
  Textarea,
} from '@mantine/core'
import { DateInput } from '@mantine/dates'
import Image from 'next/image'
import {
  IconArrowLeft,
  IconCheck,
  IconCircle,
  IconCirclePlus,
  IconGenderFemale,
  IconGenderMale,
  IconPhoto,
  IconPhotoUp,
  IconPlus,
  IconX,
} from '@tabler/icons-react'
import { sexEnumSchema } from '@/server/db/schemas'
import { useMemo, useState } from 'react'
import { useUploadAvatar } from '@/lib/useUploadFiles'

import { PatternFormat } from 'react-number-format'
import { cn } from '@/lib/utils'

const createKidSchema = (t: (key: string) => string) =>
  z
    .object({
      firstName: z.string().min(1, t('firstName.error')),
      lastName: z.string().min(1, t('lastName.error')),
      alias: z.string().optional(),
      height: z.string().optional(),
      weight: z.string().optional(),
      sex: sexEnumSchema,
      birthDate: z.coerce.string().transform((value) => new Date(value).toISOString()),
      notes: z.string().optional()
    })
    .refine((data) => data.sex !== '', {
      path: ['sex'],
      message: t('sex.error'),
    })

type NewKidFormData = z.infer<ReturnType<typeof createKidSchema>>

type NewKidFormProps = {
  familyId: number
  familyUUID: string
}

export function NewKidForm({ familyId, familyUUID }: NewKidFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const t = useTranslations('kid_form')
  const schema = createKidSchema(t)

  const form = useForm<NewKidFormData>({
    initialValues: {
      firstName: '',
      lastName: '',
      alias: '',
      height: '',
      weight: '',
      sex: '',
      birthDate: '',
      notes:  ''
    },
    validate: zodResolver(schema),
    enhanceGetInputProps: () => ({
      disabled: createKid.isPending || loading,
    }),
  })

  const utils = api.useUtils()
  const createKid = api.club.kids.createKid.useMutation({
    onSuccess: async () => {
      await utils.club.kids.getKidsByLoggedInFamily.invalidate()
    },
  })

  const updateKid = api.club.kids.updateKid.useMutation({
    onSuccess: async () => {
      await utils.club.kids.getKidsByLoggedInFamily.invalidate()
    },
  })

  const { avatarFile, setAvatarFile, uploadAvatar } = useUploadAvatar()

  const handleSubmit = async (data: NewKidFormData) => {
    try {
      setLoading(true)

      // Revalidate form
      const values = schema.parse(data)


      // Create kid and get the id
      const kid = await createKid.mutateAsync({
        ...values,
        familyId,
      })
      const kidId = kid[0]?.id

      if (!kidId) {
        throw new Error('Kid not created')
      }

      // Upload the avatar
      let avatarUrl: string | null = null
      if (avatarFile) {
        avatarUrl = await uploadAvatar(familyUUID, kidId)
        if (!avatarUrl) {
          throw new Error('Avatar not uploaded')
        }
      }

      // Update kid with the avatar
      await updateKid.mutateAsync({
        id: kidId,
        data: {
          avatar: avatarUrl ?? '',
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
      console.error('Error creating kid:', error)
      notifications.show({
        message: t('toast.error'),
        icon: <IconX />,
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleError = (errors: typeof form.errors) => {
    console.log(errors)
  }

  const avatarUrl = useMemo(() => {
    if (!avatarFile) return null
    return URL.createObjectURL(avatarFile)
  }, [avatarFile])

  return (
    <Card withBorder w={'100%'}>
      <form onSubmit={form.onSubmit(handleSubmit, handleError)}>
        <Stack>
          <Title order={3}>{t('title')}</Title>
          <Alert>{t('description')}</Alert>
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
                        onClick={() => setAvatarFile(null)}
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
                        onClick={() => setAvatarFile(null)}
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
            />
            <TextInput
              label={t('lastName.label')}
              placeholder={t('lastName.placeholder')}
              {...form.getInputProps('lastName')}
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
          <Group justify="flex-start" wrap='nowrap'>
            <Button
              variant="light"
              leftSection={<IconArrowLeft size={22} />}
              color="gray"
              disabled={loading}
              onClick={() => router.back()}
            >
              {t('button.cancel')}
            </Button>
            <Button
              type="submit"
              loading={loading}
            >
              {loading ? t('button.loading') : t('button.label')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  )
}
