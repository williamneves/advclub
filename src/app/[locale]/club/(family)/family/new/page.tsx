'use client'

import { api } from '@/trpc/react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'
import {
  Button,
  Card,
  Center,
  Divider,
  Flex,
  Input,
  Loader,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { z } from 'zod'
import { useTranslations } from 'next-intl'

import { PatternFormat } from 'react-number-format'
import states from 'states-us'
import { notifications } from '@mantine/notifications'
import { IconPlus, IconX } from '@tabler/icons-react'

const createFamilySchema = (t: (key: string) => string) =>
  z.object({
    familyName: z.string().min(1, t('name.error')),
    familyPhone: z
      .string()
      .min(4, t('phone.error'))
      .transform((v) => v.replace(/\D/g, '')),
    familyEmail: z.string().email(t('email.error')),
    streetAddress: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
  })
type NewFamilyFormData = z.infer<ReturnType<typeof createFamilySchema>>

export default function NewFamilyPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const t = useTranslations('new_family_form')

  const schema = createFamilySchema(t)
  const form = useForm<NewFamilyFormData>({
    initialValues: {
      familyName: '',
      familyPhone: '',
      familyEmail: '',
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
    },
    validate: zodResolver(schema),
    enhanceGetInputProps: () => ({
      disabled: createFamily.isPending,
    }),
  })
  const utils = api.useUtils()
  const createFamily = api.club.families.createFamily.useMutation({
    onSettled: async () => {
      await utils.club.families.getLoggedInFamily.invalidate()
    },
  })

  const family = api.club.families.getLoggedInFamily.useQuery()

  const handleSubmit = async (data: NewFamilyFormData) => {
    try {
      // Aqui você faria a chamada para a API para criar a família
      await createFamily.mutateAsync({
        name: data.familyName,
        phoneNumber: data.familyPhone,
        email: data.familyEmail,
      })
      form.reset()
      router.push('/club/family')
    } catch (error) {
      console.error('Erro ao criar família:', error)
      notifications.show({
        message: t('toast.error'),
        icon: <IconX className="size-5" />,
        color: 'red',
      })
    }
  }

  useEffect(() => {
    if (user?.lastName) {
      form.setFieldValue('familyName', user.lastName)
    }
    if (user?.primaryEmailAddress) {
      form.setFieldValue('familyEmail', user.primaryEmailAddress.emailAddress)
    }
    if (user?.primaryPhoneNumber) {
      // remove international prefix with +1 or +55 and let just the number
      const phoneNumber = user.primaryPhoneNumber.phoneNumber.replace("+55", "").replace("+1", "")
      form.setFieldValue('familyPhone', phoneNumber)
    }
  }, [user?.primaryEmailAddress, user?.primaryPhoneNumber])

  if (family.isLoading || !isLoaded) {
    return (
      <Center h={'100vh'} w={'100%'}>
        <Loader />
      </Center>
    )
  }

  if (family.data?.length) {
    router.push('/club/family')
  }

  return (
    <Card withBorder>
      <Stack gap={6} mb={8}>
        <Title order={2}>{t('title')}</Title>
        <Text fw={500}>{t('welcome_message')}</Text>
        <Text fw={400} c={'gray.8'}>
          {t('disclaimer')}
        </Text>
        <Divider mb={'md'} />
        <Text fz="sm" c="dimmed">
          {t('description')}
        </Text>
      </Stack>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Stack gap={6}>
            <TextInput
              placeholder={t('name.placeholder')}
              label={t('name.label')}
              {...form.getInputProps('familyName')}
            />
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <Input.Wrapper label={t('phone.label')}>
                <Input
                  placeholder={t('phone.placeholder')}
                  component={PatternFormat}
                  mask={'_'}
                  format={'(###) ###-####'}
                  {...form.getInputProps('familyPhone')}
                />
              </Input.Wrapper>

              <TextInput
                placeholder={t('email.placeholder')}
                label={t('email.label')}
                {...form.getInputProps('familyEmail')}
              />
            </SimpleGrid>
          </Stack>
          <Stack gap={6}>
            <Divider label={t('address_label')} />
            <TextInput
              placeholder={t('streetAddress.placeholder')}
              label={t('streetAddress.label')}
              {...form.getInputProps('streetAddress')}
            />
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
              <TextInput
                placeholder={t('city.placeholder')}
                label={t('city.label')}
                {...form.getInputProps('city')}
              />
              <Select
                searchable
                data={states.map((state) => ({
                  label: `${state.name}`,
                  value: state.abbreviation,
                }))}
                placeholder={t('state.placeholder')}
                label={t('state.label')}
                {...form.getInputProps('state')}
              />
              <Input.Wrapper label={t('zipCode.label')}>
                <Input
                  placeholder={t('zipCode.placeholder')}
                  component={PatternFormat}
                  mask={'_'}
                  format={'#####'}
                  {...form.getInputProps('zipCode')}
                />
              </Input.Wrapper>
            </SimpleGrid>
          </Stack>
          <Divider />
          <Flex justify="flex-end">
            <Button
              type="submit"
              loading={createFamily.isPending}
              rightSection={<IconPlus stroke={1.5} />}
            >
              {t('button.label')}
            </Button>
          </Flex>
        </Stack>
      </form>
    </Card>
  )
}
