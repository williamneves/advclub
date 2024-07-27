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
import { api } from '@/trpc/react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useEffect } from 'react'

// Definindo o esquema de validação
const updateFamilySchema = (t: (key: string) => string) =>
  z.object({
    familyName: z.string().min(1, t('name.error')),
    familyPhone: z.coerce.string().min(4, t('phone.error')),
    familyEmail: z.string().email(t('email.error')),
  })

type UpdateFamilyData = z.infer<ReturnType<typeof updateFamilySchema>>

type UpdateFamilyProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  initialData: UpdateFamilyData
}

export function UpdateFamilyForm({
  isOpen,
  onOpenChange,
  initialData,
}: UpdateFamilyProps) {
  const t = useTranslations('update_family_form')

  const schema = updateFamilySchema(t)

  const form = useForm<UpdateFamilyData>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  })

  const utils = api.useUtils()
  const updateFamily = api.club.families.updateLoggedInFamily.useMutation({
    onSettled: async () => {
      await utils.club.families.getLoggedInFamily.invalidate()
    },
  })
  useEffect(() => {
    form.reset(initialData)
  }, [form, initialData])

  const onSubmit = async (data: UpdateFamilyData) => {
    try {
      await updateFamily.mutateAsync({
        name: data.familyName,
        phoneNumber: data.familyPhone,
        email: data.familyEmail,
      })
      toast.success(t('toast.success'))
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Erro ao atualizar família:', error)
      toast.error(t('toast.error'))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
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
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? t('button.loading')
                  : t('button.label')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
