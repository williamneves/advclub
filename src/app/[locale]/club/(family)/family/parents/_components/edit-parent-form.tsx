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
import {
  parentsGuardiansType,
  type ParentsSelect,
} from '@/server/db/schemas/parents'
import { useRouter } from 'next/navigation'

const editParentSchema = (t: (key: string) => string) =>
  z.object({
    firstName: z.string().min(1, t('firstName.error')),
    lastName: z.string().min(1, t('lastName.error')),
    type: parentsGuardiansType,
    sex: z.enum(['male', 'female', 'other']),
    phone: z.string().min(4, t('phone.error')),
    email: z.string().email(t('email.error')),
    main: z.boolean().default(false),
  })

type EditParentFormData = z.infer<ReturnType<typeof editParentSchema>>

interface EditParentFormProps {
  parent: ParentsSelect
}

export function EditParentForm({ parent }: EditParentFormProps) {
  const router = useRouter()
  const t = useTranslations('edit_parent_form')
  const schema = editParentSchema(t)

  const form = useForm<EditParentFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: parent.firstName ?? '',
      lastName: parent.lastName ?? '',
      type: parent.type,
      // @ts-expect-error type is not assignable to ParentsSelect['sex']
      sex: parent.sex ?? '',
      phone: parent.phone ?? '',
      email: parent.email ?? '',
      main: parent.main ?? false,
    },
  })

  const utils = api.useUtils()
  const updateParent = api.club.parents.updateParent.useMutation({
    onSuccess: async () => {
      await utils.club.parents.getParentsByLoggedInFamily.invalidate()
    },
  })

  const onSubmit = async (data: EditParentFormData) => {
    try {
      await updateParent.mutateAsync({
        id: parent.id,
        data: {
          ...data,
          sex: data.sex as ParentsSelect['sex'],
        },
      })
      toast.success(t('toast.success'))

      router.push(`/club/family/parents`)
    } catch (error) {
      console.error('Error updating parent:', error)
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
            <div className="flex gap-x-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{t('firstName.label')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('type.label')}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      {parentsGuardiansType.options.map((type) => (
                        <FormItem
                          key={type}
                          className="flex items-center space-x-2"
                        >
                          <FormControl>
                            <RadioGroupItem value={type} />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {t(`type.options.${type}`)}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
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
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('phone.label')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email.label')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
