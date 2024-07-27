import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { FamilySelect } from '@/server/db/schemas'
import { Fragment, useState } from 'react'
import { UpdateFamilyForm } from './update-family-form'
import { useTranslations } from 'next-intl'

type FamilyCardProps = {
  family: FamilySelect
}

export function FamilyCard({ family }: FamilyCardProps) {
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const t = useTranslations('family_card')

  return (
    <Fragment>
      <Card>
        <CardHeader>
          <CardTitle>{t('welcome', { familyName: family.name })}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            {t('email')}: {family.email}
          </p>
          <p>
            {t('phone')}: {family.phoneNumber}
          </p>
          <Button onClick={() => setUpdateModalOpen(true)} className="mt-4">
            {t('update_button')}
          </Button>
        </CardContent>
      </Card>
      <UpdateFamilyForm
        isOpen={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        initialData={{
          familyName: family.name,
          familyPhone: family.phoneNumber,
          familyEmail: family.email,
        }}
      />
    </Fragment>
  )
}
