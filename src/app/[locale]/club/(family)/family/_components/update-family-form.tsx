import { useForm } from '@mantine/form'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { api } from '@/trpc/react'
import { useEffect } from 'react'
import { Modal, Stack, TextInput, Input, Select, Button, SimpleGrid, Group, Divider } from '@mantine/core'
import { zodResolver } from 'mantine-form-zod-resolver'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconX } from '@tabler/icons-react'
import states from "states-us"
import { PatternFormat } from 'react-number-format'


// Definindo o esquema de validação
const updateFamilySchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t('name.error')),
    phoneNumber: z.coerce.string().min(4, t('phone.error')),
    email: z.string().email(t('email.error')),
    streetAddress: z.string().nullish(),
    city: z.string().nullish(),
    state: z.string().nullish(),
    zipCode: z.string().nullish(),
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
    initialValues: initialData,
    validate: zodResolver(schema),
    enhanceGetInputProps: () => ({
      disabled: updateFamily.isPending,
    }),
  })

  const utils = api.useUtils()
  const updateFamily = api.club.families.updateLoggedInFamily.useMutation({
    onSettled: async () => {
      await utils.club.families.getLoggedInFamily.invalidate()
      await utils.club.parents.getParentsByLoggedInFamily.invalidate()
    },
  })

  useEffect(() => {
    form.setInitialValues(initialData)
    form.reset()
  }, [initialData, isOpen])

  const handleSubmit = async (values: UpdateFamilyData) => {
    try {
      const data = schema.parse(values)
      await updateFamily.mutateAsync({
        name: data.name,
        phoneNumber: data.phoneNumber,
        email: data.email,
        streetAddress: data.streetAddress,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
      })
      notifications.show({
        message: t('toast.success'),
        icon: <IconCheck />,
        color: 'teal',
      })
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Erro ao atualizar família:', error)
      notifications.show({
        message: t('toast.error'),
        icon: <IconX   />,
        color: 'red',
        autoClose: false
      })
    }
  }

  return (
    <Modal
      opened={isOpen}
      onClose={() => onOpenChange(false)}
      title={t('title')}
      classNames={{
        header: 'border-solid border-0 border-b border-mtn-default-border shadow-md min-h-[48px] py-0 mb-2'
      }}
      
    >
      <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-6">
        <Stack>

          <Stack gap={6}>
            <TextInput
              label={t('name.label')}
              placeholder={t('name.placeholder')}
              {...form.getInputProps('name')}
            />
            <Input.Wrapper label={t('phone.label')}>
              <Input
                placeholder={t('phone.placeholder')}
                component={PatternFormat}
                mask={'_'}
                format={'(###) ###-####'}
                {...form.getInputProps('phoneNumber')}
              />
            </Input.Wrapper>
            <TextInput
              label={t('email.label')}
              placeholder={t('email.placeholder')}
              {...form.getInputProps('email')}
            />
          </Stack>
          <Stack gap={6}>
            <TextInput
              placeholder={t('streetAddress.placeholder')}
              label={t('streetAddress.label')}
              {...form.getInputProps('streetAddress')}
            />
            <SimpleGrid cols={{ base: 1, md: 2 }} verticalSpacing={6}>
              <TextInput
                placeholder={t('city.placeholder')}
                label={t('city.label')}
                {...form.getInputProps('city')}
              />
              <Select
                searchable
                data={states.map((state) => ({
                  label: `${state.name}`,
                  value: state.abbreviation,
                }))}
                placeholder={t('state.placeholder')}
                label={t('state.label')}
                {...form.getInputProps('state')}
              />
              <Input.Wrapper label={t('zipCode.label')}>
                <Input
                  placeholder={t('zipCode.placeholder')}
                  component={PatternFormat}
                  mask={'_'}
                  format={'#####'}
                  {...form.getInputProps('zipCode')}
                />
              </Input.Wrapper>
            </SimpleGrid>
          </Stack>
          <Divider />
          <Group justify='flex-end' grow>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateFamily.isPending}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" loading={updateFamily.isPending}>
              {updateFamily.isPending ? t('button.loading') : t('button.label')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
