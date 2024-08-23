'use client'

import { createClient } from '@/utils/supabase/client'
import { useForm } from '@mantine/form'
import { z } from 'zod'
import { zodResolver } from 'mantine-form-zod-resolver'
import {
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
import { IconBrandFacebook, IconBrandGoogle, IconLock, IconMail } from '@tabler/icons-react'
import { getBaseUrl } from '@/trpc/react'

const schema = z.object({
  email: z.string().email('Email is required').describe('Email').default(''),
  password: z
    .string()
    .min(4, 'Password must be at least 4 characters')
    .describe('Password')
    .default(''),
})

export default function Login() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
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
      className="flex h-screen flex-col items-center justify-center bg-mtn-gray-0"
      onSubmit={form.onSubmit(handleSubmit)}
    >
      <Card withBorder miw={{ base: 300, sm: 400, md: 500 }} p={{ base: 'sm', sm: 'md' }}>
        <Stack>
          <Stack gap={6}>
            <Title order={3}>Welcome Back</Title>
            <Text fz="sm">Sign in to your account to continue</Text>
          </Stack>
          <Divider label={'Social'} />
          <Group grow>
            <Button color="red" onClick={handleGoogleLogin}>
              <IconBrandGoogle />
            </Button>
            <Button color="blue" onClick={handleFacebookLogin}>
              <IconBrandFacebook />
            </Button>
          </Group>
          <Divider label={'Email'} />
          <TextInput leftSection={<IconMail size={18} />} label="Email" {...form.getInputProps('email')} />
          <PasswordInput leftSection={<IconLock size={18} />} label="Password" {...form.getInputProps('password')} />
          <Button type="submit">Login</Button>
        </Stack>
      </Card>
    </form>
  )
}
