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
} from '@mantine/core'
import Image from 'next/image'
import { IconCheck, IconX } from '@tabler/icons-react'
import { sexEnumSchema } from '@/server/db/schemas'
import { useMemo, useState } from 'react'
import { useUploadAvatar } from '@/lib/useUploadFiles'

import { PatternFormat } from 'react-number-format'

const createKidSchema = (t: (key: string) => string) =>
  z
    .object({
      firstName: z.string().min(1, t('firstName.error')),
      lastName: z.string().min(1, t('lastName.error')),
      alias: z.string().optional(),
      phoneNumber: z
        .string()
        .min(4, t('phoneNumber.error'))
        .transform((value) => value.replace(/\D/g, '')),
      height: z.string().optional(),
      weight: z.string().optional(),
      sex: sexEnumSchema,
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
      phoneNumber: '',
      height: '',
      weight: '',
      sex: '',
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

  const avatarUrl = useMemo(() => {
    if (!avatarFile) return null
    return URL.createObjectURL(avatarFile)
  }, [avatarFile])

  return (
    <Card withBorder w={'100%'}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Title order={3}>{t('title')}</Title>
          <Text>{t('description')}</Text>

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
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
            <TextInput
              label={t('alias.label')}
              placeholder={t('alias.placeholder')}
              {...form.getInputProps('alias')}
            />
            <Input.Wrapper
              label={t('phoneNumber.label')}
              error={form.errors.phoneNumber}
            >
              <Input
                placeholder={t('phoneNumber.placeholder')}
                component={PatternFormat}
                mask={'_'}
                format={'(###) ###-####'}
                {...form.getInputProps('phoneNumber')}
              />
            </Input.Wrapper>
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
          <Divider
            label={
              <Badge size="sm" variant="outline" radius={'sm'} color="blue">
                {t('files.divider')}
              </Badge>
            }
            labelPosition="left"
          />

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
