import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { FamilySelect } from '@/server/db/schemas'
import { Fragment, useState } from 'react'
import { UpdateFamilyForm } from './update-family-form'

type FamilyCardProps = {
  family: FamilySelect    
}

export function FamilyCard({ family }: FamilyCardProps) {
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  return (
    <Fragment>
      <Card>
      <CardHeader>
        <CardTitle>Seja bem-vindo, {family.name}!</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Email: {family.email}</p>
        <p>Telefone: {family.phoneNumber}</p>
        <Button onClick={() => setUpdateModalOpen(true)} className="mt-4">
          Atualizar Dados
        </Button>
        </CardContent>
      </Card>
      <UpdateFamilyForm 
        isOpen={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        initialData={{
          familyName: family.name,
          familyPhone: family.phoneNumber,
          familyEmail: family.email
        }}
      />
    </Fragment>
  )
}