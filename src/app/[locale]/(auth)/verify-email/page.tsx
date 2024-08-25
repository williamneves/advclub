'use client'

import { Logo } from '@/components/logo'
import { createClient } from '@/utils/supabase/client'
import { Stack, Card, Title, Text, Button } from '@mantine/core'
import { notifications } from '@mantine/notifications'

import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function VerifyEmail() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const t = useTranslations('verify-email')
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleResendEmail = async () => {
    if (!email) return
    setLoading(true)
    const { data, error } = await supabase.auth.resend({
      email: email,
      type: 'signup',
    })

    if (error) {
      notifications.show({
        title: 'Error',
        message: error.message,
        color: 'red',
      })
      console.error(error)
    }

    if (data) {
      notifications.show({
        title: t('email_sent'),
        message: t('email_sent_description'),
        color: 'green',
      })
    }
    setEmailSent(true)
    setLoading(false)
  }
  return (
    <form className="flex h-screen flex-col items-center justify-center gap-8 bg-mtn-gray-0 px-4">
      <Logo />
      <Stack className="w-full max-w-[420px]" gap={10}>
        <Card
          withBorder
          className="flex flex-col items-start justify-center gap-4"
        >
          <Title order={3}>{t('waiting_for_validation')}!</Title>
          <Text>{t('waiting_for_validation_description')}</Text>
          <Text fz="sm">{t('if_not_received')}</Text>
          <Button
            variant="outline"
            w={'100%'}
            onClick={handleResendEmail}
            color="blue"
            loading={loading}
          >
            {t('resend_email')}
          </Button>
          {emailSent && (
            <Text fz="sm" c={'green'}>
              {t('email_re-sent_description')}
            </Text>
          )}
        </Card>
      </Stack>
    </form>
  )
}
