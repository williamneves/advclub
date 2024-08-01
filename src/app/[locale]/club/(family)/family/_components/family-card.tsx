'use client'

import { Fragment, useState } from 'react'
import { UpdateFamilyForm } from './update-family-form'
import { useTranslations } from 'next-intl'
import { Card, Stack, Text, Title, Button } from '@mantine/core'
import { IconEdit } from '@tabler/icons-react'
import { api } from '@/trpc/react'
import { useRouter } from 'next/navigation'

export function FamilyCard() {
  const router = useRouter()
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const t = useTranslations('family_card')

  const [familyData] = api.club.families.getLoggedInFamily.useSuspenseQuery()

  const family = familyData[0]

  if (!family) {
    router.push('/club/family/new')
    return null
  }

  return (
    <Fragment>
      <Card withBorder>
        <Stack>
          <Title order={3}>{t('welcome', { familyName: family.name })}</Title>
          <Stack gap={2}>
            <Text>
              <b>{t('email')}</b>: {family.email}
            </Text>
            <Text>
              <b>{t('phone')}</b>:{' '}
              {family.phoneNumber.replace(
                /(\d{3})(\d{3})(\d{4})/,
                '($1) $2-$3',
              )}
            </Text>
            {family.streetAddress && (
              <Text>
                <b>{t('address')}</b>: {family.streetAddress}, {family.city?.toUpperCase()}, {family.state?.toUpperCase()}, {family.zipCode}
              </Text>
            )}
          </Stack>
          <div>
            <Button onClick={() => setUpdateModalOpen(true)} className="mt-4" rightSection={<IconEdit stroke={1.5} />}>
              {t('update_button')}
            </Button>
          </div>
        </Stack>
      </Card>
      <UpdateFamilyForm
        isOpen={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        initialData={{
          name: family.name,
          phoneNumber: family.phoneNumber,
          email: family.email,
          streetAddress: family.streetAddress,
          city: family.city,
          state: family.state,
          zipCode: family.zipCode,
        }}
      />
    </Fragment>
  )
}
