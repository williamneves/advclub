// import { useRouter } from 'next/navigation'
import { type KidFormData } from './form-types'
import { type UseFormReturnType } from '@mantine/form'
import { useTranslations } from 'next-intl'
import {
  Card,
  CardSection,
  Title,
  Text,
  Input,
  Radio,
  SimpleGrid,
  Stack,
  TextInput,
  Group,
  Badge,
  Divider,
  Fieldset,
  Flex,
  Box,
  FileButton,
  Button,
  LoadingOverlay,
} from '@mantine/core'
// import loading from '@/app/[locale]/loading'
import { PatternFormat } from 'react-number-format'
import { cn } from '@/lib/utils'
import NextImage from 'next/image'
import AVATAR_PLACEHOLDER from '@/assets/images/avatar-placeholder.jpg'
import { IconCalendar, IconPhone } from '@tabler/icons-react'

import { DateInput } from '@mantine/dates'

import { pdfjs } from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export const KidFormInputFields = ({
  form,
  mode,
  loading,
  isFirstKid,
  profilePicture,
}: {
  form: UseFormReturnType<KidFormData>
  mode: 'new' | 'edit'
  loading: boolean
  isFirstKid: boolean
  profilePicture: {
    isLoading: boolean
    src?: string
    onChange: (file: File | null) => void
    onRemove: () => void
  }
}) => {
  //   const router = useRouter()
  const t = useTranslations('kid_form')

  return (
    <Card withBorder>
      <CardSection
        p={'md'}
        pb={'xs'}
        mb={'xs'}
        className="border-0 border-b border-solid border-mtn-default-border"
      >
        <Title order={3}>{mode === 'new' ? t('title') : t('edit_title')}</Title>
        <Text>{mode === 'new' ? t('description') : t('edit_description')}</Text>
      </CardSection>
      <Stack>
        {/* avatar */}
        <Flex>
          <Fieldset
            legend={
              <Badge size="sm" variant="outline" radius={'sm'} color="blue">
                {t('profile_picture.label')}
              </Badge>
            }
            classNames={{
              legend: 'ml-10',
              root: 'flex flex-col items-center gap-2 pb-2',
            }}
          >
            <Text c={'dimmed'} fz={'sm'}>
              {t('profile_picture.disclaimer')}
            </Text>

            <FileButton onChange={profilePicture.onChange} accept="image/*">
              {(props) => (
                <Box
                  onClick={props.onClick}
                  className="relative h-[180px] w-[180px] overflow-hidden rounded-md border border-solid border-gray-300"
                >
                  <LoadingOverlay visible={loading} />
                  <NextImage
                    src={profilePicture.src ?? AVATAR_PLACEHOLDER}
                    alt="Profile Picture"
                    className="cursor-pointer object-contain transition-all hover:scale-105"
                    width={180}
                    height={180}
                  />
                </Box>
              )}
            </FileButton>
            <FileButton onChange={profilePicture.onChange} accept="image/*">
              {(props) => (
                <Button
                  loading={loading}
                  fullWidth
                  color={profilePicture.src ? 'red' : 'blue'}
                  variant={profilePicture.src ? 'light' : 'outline'}
                  onClick={props.onClick}
                >
                  {profilePicture.src
                    ? t('profile_picture.buttonWithFile')
                    : t('profile_picture.buttonNoFile')}
                </Button>
              )}
            </FileButton>
          </Fieldset>
        </Flex>

        <Divider
          label={
            <Badge size="sm" variant="outline" radius={'sm'} color="blue">
              {t('divider.personal_info')}
            </Badge>
          }
          labelPosition="left"
        />

        <SimpleGrid cols={{ base: 1, sm: 2 }} verticalSpacing={'xs'}>
          {/* First Name */}
          <TextInput
            label={t('firstName.label')}
            placeholder={t('firstName.placeholder')}
            {...form.getInputProps('firstName')}
          />
          {/* Last Name */}
          <TextInput
            label={t('lastName.label')}
            placeholder={t('lastName.placeholder')}
            {...form.getInputProps('lastName')}
          />
          {/* Sex */}
          <Radio.Group label={t('sex.label')} {...form.getInputProps('sex')}>
            <Group grow gap={6}>
              {['male', 'female'].map((sex) => (
                <Radio
                  key={sex}
                  value={sex}
                  label={t(`sex.options.${sex}`)}
                  disabled={loading}
                  color={sex === 'male' ? 'blue' : 'pink'}
                  className={cn(
                    'flex h-[36px] items-center justify-start rounded-md border border-solid border-gray-300 px-4',
                    {
                      'bg-blue-100': sex === 'male',
                      'bg-pink-100': sex === 'female',
                      'border-blue-300': sex === 'male',
                      'border-pink-300': sex === 'female',
                    },
                  )}
                />
              ))}
            </Group>
          </Radio.Group>

          {/* birthDate */}
          <DateInput
            valueFormat="DD/MM/YYYY"
            leftSection={<IconCalendar size={16} />}
            label={t('birthDate.label')}
            placeholder={t('birthDate.placeholder')}
            {...form.getInputProps('birthDate')}
            value={new Date(form.getInputProps('birthDate').value)}
          />
          {/* Alias */}
          <TextInput
            label={t('alias.label')}
            placeholder={t('alias.placeholder')}
            {...form.getInputProps('alias')}
          />
          {/* phoneNumber */}
          <Input.Wrapper
            label={t('phoneNumber.label')}
            error={form.errors.phoneNumber}
          >
            <Input
              leftSection={<IconPhone size={16} />}
              placeholder={t('phoneNumber.placeholder')}
              component={PatternFormat}
              mask={'_'}
              format={'(###) ###-####'}
              {...form.getInputProps('phoneNumber')}
            />
          </Input.Wrapper>
        </SimpleGrid>
        {/* notes */}
        <TextInput
          label={t('notes.label')}
          placeholder={t('notes.placeholder')}
          {...form.getInputProps('notes')}
        />
      </Stack>
    </Card>
  )
}