'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useTranslations } from 'next-intl'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { api } from '@/trpc/react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'


// Definindo o esquema de validação
const createFamilySchema = (t: (key: string) => string) =>
  z.object({
    familyName: z.string().min(1, t('name.error')),
    familyPhone: z.string().min(4, t('phone.error')),
    familyEmail: z.string().email(t('email.error')),
  })

type NewFamilyFormData = z.infer<ReturnType<typeof createFamilySchema>>

export function NewFamilyForm() {
  const router = useRouter()
  const t = useTranslations('new_family_form')

  const schema = createFamilySchema(t)

  const form = useForm<NewFamilyFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      familyName: '',
      familyPhone: '',
      familyEmail: '',
    },
  })

  const createFamily = api.club.families.createFamily.useMutation({})

  const onSubmit = async (data: NewFamilyFormData) => {
    try {
      // Aqui você faria a chamada para a API para criar a família
      console.log('Dados do formulário:', data)
      const family = await createFamily.mutateAsync({
        name: data.familyName,
        phoneNumber: data.familyPhone,
        email: data.familyEmail,
      })
      console.log(family)
      toast.success(t('toast.success'))
      form.reset()
      router.push('/club/family')
    } catch (error) {
      console.error('Erro ao criar família:', error)
      toast.error(t('toast.error'))
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader className="space-y-2">
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription className="text-md text-gray-500">
          {t('disclaimer')}
        </CardDescription>
        <div className="flex flex-col space-y-4">
          <Separator />
          <CardDescription className="text-sm">
            {t('description')}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="familyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('name.label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('name.placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
              <FormField
                control={form.control}
                name="familyPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('phone.label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('phone.placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
            />
            <FormField
              control={form.control}
              name="familyEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email.label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('email.placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? t('button.loading')
                : t('button.label')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
