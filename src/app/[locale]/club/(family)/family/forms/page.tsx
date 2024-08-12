'use client'

import { useTranslations } from 'next-intl'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Construction } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

// Você pode mover isso para um arquivo de configuração ou buscar do backend
const contactPeople = [
  { name: 'Simone', phone: '(516) 587-2877' },
  { name: 'Giulia', phone: '(954) 773-3199' },
]

export default function FormsPage() {
  const t = useTranslations('forms_page')

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">{t('title')}</h1>

      <Card className="w-full bg-orange-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="mr-4 h-8 w-8" />
            {t('under_construction.title')}
          </CardTitle>
          <Separator />
          <CardDescription>
            {t('under_construction.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{t('under_construction.message')}</p>
          <p className="font-semibold">
            {t('under_construction.contact_info')}
          </p>
          <ul className="mt-2 list-disc pl-5">
            {contactPeople.map((person, index) => (
              <li
                key={index}
                className="flex items-center gap-2 text-lg font-bold"
              >
                {t('under_construction.contact_template', {
                  name: person.name,
                  phone: person.phone,
                })}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
