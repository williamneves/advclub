'use client'

import { Fragment, useState } from 'react'
import { UpdateFamilyForm } from './update-family-form'
import { useTranslations } from 'next-intl'
import { Card, Stack, Text, Title, Button } from '@mantine/core'
import { IconEdit } from '@tabler/icons-react'
import { api, RouterOutputs } from '@/trpc/react'
import { useRouter } from 'next/navigation'
import { capitalizeWords } from '@/utils/stringUtils'

export function FamilyCard({
  initialData,
}: {
  initialData: RouterOutputs['club']['families']['getLoggedInFamily']
}) {
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const t = useTranslations('family_card')

  const [family] = api.club.families.getLoggedInFamily.useSuspenseQuery(
    undefined,
    {
      initialData,
    },
  )

  return (
    <Fragment>
      <Card withBorder>
        <Stack>
          <Stack gap={0}>
            <Text className="text-md font-semibold">{t('welcome')}</Text>
            <Title order={3}>
              {t('welcome2', { familyName: family?.name ?? '' })}
            </Title>
          </Stack>
          <Stack gap={2}>
            <Text>
              <b>{t('email')}</b>: {family?.email ?? ''}
            </Text>
            <Text>
              <b>{t('phone')}</b>:{' '}
              {family?.phoneNumber.replace(
                /(\d{3})(\d{3})(\d{4})/,
                '($1) $2-$3',
              )}
            </Text>
            {family?.streetAddress && (
              <Text>
                <b>{t('address')}</b>: {capitalizeWords(family.streetAddress)},{' '}
                {capitalizeWords(family.city ?? '')},{' '}
                {family.state?.toUpperCase()}, {family.zipCode}
              </Text>
            )}
          </Stack>
          <div>
            <Button
              onClick={() => setUpdateModalOpen(true)}
              className="mt-4"
              rightSection={<IconEdit stroke={1.5} />}
            >
              {t('update_button')}
            </Button>
          </div>
        </Stack>
      </Card>
      <UpdateFamilyForm
        isOpen={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        initialData={{
          name: family?.name ?? '',
          phoneNumber: family?.phoneNumber ?? '',
          email: family?.email ?? '',
          streetAddress: family?.streetAddress ?? '',
          city: family?.city ?? '',
          state: family?.state ?? '',
          zipCode: family?.zipCode ?? '',
        }}
      />
    </Fragment>
  )
}
