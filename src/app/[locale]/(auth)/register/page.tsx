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
  TextInput,
  Title,
} from '@mantine/core'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const schema = z.object({
  email: z.string().email('Email is required').describe('Email').default(''),
  password: z
    .string()
    .min(4, 'Password must be at least 4 characters')
    .describe('Password')
    .default(''),
  confirmPassword: z.string().min(4, 'Password must be at least 4 characters').describe('Confirm Password').default(''),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
})

export default function Login() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
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
        console.log(data)
        router.push('/club/')
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
        redirectTo: 'http://localhost:3000/auth/callback',
      },
    })
  }

  const handleFacebookLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
    })
  }

  return (
    <form
      className="flex h-screen flex-col items-center justify-center bg-mtn-gray-0"
      onSubmit={form.onSubmit(handleSubmit)}
    >
      <Card withBorder>
        <Stack>
          <Title order={3}>Welcome to Adv Club</Title>
          <Divider />
          <Group grow>
            <Button color="red" onClick={handleGoogleLogin}>
              Google
            </Button>
            <Button color="blue" onClick={handleFacebookLogin}>
              
            </Button>
          </Group>
          <TextInput label="Email" {...form.getInputProps('email')} />
          <PasswordInput label="Password" {...form.getInputProps('password')} />
          <PasswordInput label="Confirm Password" {...form.getInputProps('password')} />
          <Button type="submit">Login</Button>
        </Stack>
      </Card>
    </form>
  )
}
