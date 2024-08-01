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

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import states from 'states-us'
import { Separator } from '@/components/ui/separator'
import { api } from '@/trpc/react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// Definindo o esquema de validação
const createFamilySchema = (t: (key: string) => string) =>
  z
    .object({
      familyName: z.string().min(1, t('name.error')),
      familyPhone: z.string().min(4, t('phone.error')),
      familyEmail: z.string().email(t('email.error')),
      streetAddress: z.string(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string(),
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
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
    },
  })

  const utils = api.useUtils()
  const createFamily = api.club.families.createFamily.useMutation({
    onSettled: async () => {
      await utils.club.families.getLoggedInFamily.invalidate()
    },
  })

  const onSubmit = async (data: NewFamilyFormData) => {
    try {
      // Aqui você faria a chamada para a API para criar a família
      await createFamily.mutateAsync({
        name: data.familyName,
        phoneNumber: data.familyPhone,
        email: data.familyEmail,
      })
      toast.success(t('toast.success'))
      form.reset()
      router.refresh()
      router.push('/club/family')
    } catch (error) {
      console.error('Erro ao criar família:', error)
      toast.error(t('toast.error'))
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-2">
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription className="text-md text-gray-700">
          {t('welcome_message')}
        </CardDescription>
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
            <Separator />
            <FormField
              control={form.control}
              name="streetAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('streetAddress.label')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('streetAddress.placeholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('city.label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('city.placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('state.label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('state.placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('zipCode.label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('zipCode.placeholder')} {...field} />
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
