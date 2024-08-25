'use client'

import { createClient } from '@/utils/supabase/client'
import { useForm } from '@mantine/form'
import { z } from 'zod'
import { zodResolver } from 'mantine-form-zod-resolver'
import {
  Anchor,
  Button,
  Card,
  Divider,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  IconBrandFacebook,
  IconBrandGoogle,
  IconLock,
  IconMail,
} from '@tabler/icons-react'
import { getBaseUrl } from '@/trpc/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Logo } from '@/components/logo'

export default function Login() {
  const router = useRouter()
  const supabase = createClient()
  const t = useTranslations('login')

  const [loading, setLoading] = useState(false)

  const schema = z.object({
    email: z.string().email(t('errors.email')).describe('Email').default(''),
    password: z
      .string()
      .min(6, t('errors.password'))
      .describe('Password')
      .default(''),
  })

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: zodResolver(schema),
    enhanceGetInputProps: () => ({
      disabled: loading,
    }),
  })

  const handleSubmit = async (values: z.infer<typeof schema>) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        console.error(error)
      }

      if (data) {
        router.push('/club/family')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getBaseUrl() + '/auth/callback?next=/club/family',
      },
    })
  }

  const handleFacebookLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: getBaseUrl() + '/auth/callback?next=/club/family',
      },
    })
  }

  return (
    <form
      className="flex h-screen flex-col items-center justify-center gap-8 bg-mtn-gray-0 px-4"
      onSubmit={form.onSubmit(handleSubmit)}
    >
      <Logo />
      <Stack className="w-full max-w-[420px]" gap={10}>
        <Card withBorder>
          <Stack>
            <Stack gap={6}>
              <Title order={3}>{t('login_welcome')}!</Title>
              <Text fz="sm">{t('login_welcome_description')}</Text>
            </Stack>
            <Divider label={t('divider_social').toUpperCase()} />
            <Group grow>
              <Button
                variant="outline"
                color="red"
                bg={'red.0'}
                onClick={handleGoogleLogin}
              >
                <IconBrandGoogle />
              </Button>
              <Button
                variant="outline"
                color="blue"
                bg={'blue.0'}
                onClick={handleFacebookLogin}
              >
                <IconBrandFacebook />
              </Button>
            </Group>
            <Divider label={t('divider_email').toUpperCase()} />
            <TextInput
              leftSection={<IconMail size={18} />}
              label={t('email')}
              {...form.getInputProps('email')}
            />
            <PasswordInput
              leftSection={<IconLock size={18} />}
              label={t('password')}
              {...form.getInputProps('password')}
            />
            <Button type="submit" loading={loading}>
              {t('login')}
            </Button>
          </Stack>
        </Card>
        <Anchor component={Link} href="/register" fz="sm" ta={'right'}>
          {t('signup_bottom_login')}
        </Anchor>
      </Stack>
    </form>
  )
}
