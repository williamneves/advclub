'use client'

import { api } from '@/trpc/react'
import { useRouter } from 'next/navigation'
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
import { createClient } from '@/utils/supabase/client'
import { getLastName } from '@/utils/stringUtils'

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
  const supabase = createClient()
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

  const handleSubmit = async (values: NewFamilyFormData) => {
    const data = schema.parse(values)
    try {
      // Aqui você faria a chamada para a API para criar a família
      await createFamily.mutateAsync({
        name: data.familyName,
        phoneNumber: data.familyPhone,
        email: data.familyEmail,
        streetAddress: data.streetAddress,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
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
    supabase.auth
      .getUser()
      .then(({ data: { user } }) => {
        if (user) {
          form.setFieldValue(
            'familyName',
            getLastName(user.user_metadata?.name) ?? '',
          )
          form.setFieldValue('familyEmail', user.email ?? '')
          form.setFieldValue(
            'familyPhone',
            user.phone ?? user.user_metadata?.phone ?? '',
          )
        }
      })
      .catch((error) => {
        console.error('Erro ao obter usuário:', error)
      })
  }, [])

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
                data={[
                  {
                    group: 'Local',
                    items: [
                      {
                        label: 'Florida',
                        value: 'FL',
                      },
                    ],
                  },
                  {
                    group: 'Nacional',
                    items: states
                      .filter((state) => state.abbreviation !== 'FL')
                      .map((state) => ({
                        label: `${state.name}`,
                        value: state.abbreviation,
                      })),
                  },
                ]}
                placeholder={t('state.placeholder')}
                label={t('state.label')}
                {...form.getInputProps('state')}
                autoComplete="off"
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
