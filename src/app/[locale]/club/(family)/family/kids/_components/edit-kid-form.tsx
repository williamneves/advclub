'use client'

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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { api } from '@/trpc/react'
import { toast } from 'sonner'
import { sexEnumSchema } from '@/server/db/schemas'
import { useRouter } from 'next/navigation'
import { type KidsSelect } from '@/server/db/schemas/kids'

const editKidSchema = (t: (key: string) => string) =>
  z.object({
    firstName: z.string().min(1, t('firstName.error')),
    lastName: z.string().min(1, t('lastName.error')),
    alias: z.string().optional(),
    phoneNumber: z.string().min(4, t('phoneNumber.error')),
    sex: sexEnumSchema,
  })

type EditKidFormData = z.infer<ReturnType<typeof editKidSchema>>

interface EditKidFormProps {
  kid: KidsSelect
}

export function EditKidForm({ kid }: EditKidFormProps) {
  const router = useRouter()
  const t = useTranslations('edit_kid_form')
  const schema = editKidSchema(t)

  const form = useForm<EditKidFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: kid.firstName,
      lastName: kid.lastName,
      alias: kid.alias ?? '',
      phoneNumber: kid.phoneNumber,
      sex: kid.sex ?? '',
    },
  })

  const utils = api.useUtils()
  const updateKid = api.club.kids.updateKid.useMutation({
    onSettled: async () => {
      await utils.club.kids.getKidsByLoggedInFamily.invalidate()
      await utils.club.families.getLoggedInFamily.invalidate()
    },
  })

  const onSubmit = async (data: EditKidFormData) => {
    try {
      await updateKid.mutateAsync({ id: kid.id, data: { ...data } })
      toast.success(t('toast.success'))
      router.push(`/club/family/kids`)
    } catch (error) {
      console.error('Error updating kid:', error)
      toast.error(t('toast.error'))
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex space-x-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{t('firstName.label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('firstName.placeholder')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{t('lastName.label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('lastName.placeholder')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="alias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('alias.label')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('alias.placeholder')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('phoneNumber.label')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('phoneNumber.placeholder')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('sex.label')}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      {['male', 'female', 'other'].map((sex) => (
                        <FormItem
                          key={sex}
                          className="flex items-center space-x-2"
                        >
                          <FormControl>
                            <RadioGroupItem value={sex} />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {t(`sex.options.${sex}`)}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
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
