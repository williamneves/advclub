import { useRouter } from 'next/navigation'
import { getParentFormSchema, type ParentFormData } from './form-types'
import { type UseFormReturnType } from '@mantine/form'
import { useTranslations } from 'next-intl'
import {
  Card,
  CardSection,
  Image,
  Title,
  Text,
  Input,
  Radio,
  SimpleGrid,
  Stack,
  TextInput,
  Group,
  CheckIcon,
  Checkbox,
  Alert,
  Badge,
  Divider,
  Fieldset,
  Flex,
  Box,
  FileButton,
  Button,
  ThemeIcon,
  Paper,
  UnstyledButton,
  Avatar,
  Select,
  Collapse,
  Autocomplete,
  LoadingOverlay,
} from '@mantine/core'
import loading from '@/app/[locale]/loading'
import { parentsGuardiansType } from '@/server/db/schemas'
import { PatternFormat } from 'react-number-format'
import { cn } from '@/lib/utils'
import NextImage from 'next/image'
import AVATAR_PLACEHOLDER from '@/assets/images/avatar-placeholder.jpg'
import DRIVER_LICENSE_PLACEHOLDER from '@/assets/images/driver-licence-placeholder.jpg'
import {
  IconCalendar,
  IconFileTypePdf,
  IconMail,
  IconPhone,
} from '@tabler/icons-react'

import states from 'states-us'

import GUARDIAN_PLACEHOLDER from '@/assets/images/guardian.png'
import RELATIVE_PLACEHOLDER from '@/assets/images/relative.png'
import PARENT_PLACEHOLDER from '@/assets/images/parent.png'
import { DateInput, DatePickerInput, DatesProvider } from '@mantine/dates'

export const ParentFormInputFields = ({
  form,
  mode,
  loading,
  isFirstParent,
  profilePicture,
  driverLicense,
}: {
  form: UseFormReturnType<ParentFormData>
  mode: 'new' | 'edit'
  loading: boolean
  isFirstParent: boolean
  profilePicture: {
    isLoading: boolean
    src?: string
    onChange: (file: File | null) => void
    onRemove: () => void
  }
  driverLicense: {
    isLoading: boolean
    src?: string
    file: File | null
    onChange: (file: File | null) => void
    onRemove: () => void
  }
}) => {
  const router = useRouter()
  const t = useTranslations('parent_form')
  const isPdf =
    driverLicense.file?.type.includes('pdf') ??
    driverLicense.src?.includes('pdf')

  return (
    <Card withBorder>
      <CardSection
        p={'md'}
        pb={'xs'}
        mb={'xs'}
        className="border-0 border-b border-solid border-mtn-default-border"
      >
        {/* Header */}
        <Title order={3}>{mode === 'new' ? t('title') : t('edit_title')}</Title>
        <Text>{mode === 'new' ? t('description') : t('edit_description')}</Text>
      </CardSection>
      {/* Profile Pic */}
      {/* Personal Info */}
      <Stack>
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
                    alt="Profile Picture"
                    src={profilePicture.src ?? AVATAR_PLACEHOLDER}
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
              {t('divider.type')}
            </Badge>
          }
          labelPosition="left"
        />
        <Checkbox
          label={t('main.label')}
          {...form.getInputProps('main', { type: 'checkbox' })}
          description={t('main.description')}
          disabled={loading || isFirstParent}
          key={form.key('main')}
        />
        <div className="flex flex-wrap gap-2">
          {parentsGuardiansType.options.map((type) => (
            <ParentTypeRadioComponent
              checked={form.getValues().type === type}
              onChange={() => form.setFieldValue('type', type)}
              disabled={loading}
              type={type}
              key={type}
            />
          ))}
        </div>

        <Divider
          label={
            <Badge size="sm" variant="outline" radius={'sm'} color="blue">
              {t('divider.personal_info')}
            </Badge>
          }
          labelPosition="left"
        />
        <SimpleGrid cols={{ base: 1, sm: 2 }} verticalSpacing={'xs'}>
          <TextInput
            label={t('firstName.label')}
            placeholder={t('firstName.placeholder')}
            {...form.getInputProps('firstName')}
            key={form.key('firstName')}
          />
          <TextInput
            label={t('lastName.label')}
            placeholder={t('lastName.placeholder')}
            {...form.getInputProps('lastName')}
            key={form.key('lastName')}
          />
          <Radio.Group
            label={t('sex.label')}
            {...form.getInputProps('sex')}
            key={form.key('sex')}
          >
            <Group grow gap={6}>
              <Radio
                value="male"
                label={t(`sex.options.male`)}
                disabled={loading}
                color="blue"
                className={cn(
                  'flex h-[36px] items-center justify-start rounded-md border border-solid border-gray-300 px-4',
                  {
                    'bg-blue-100': true,
                    'border-blue-300': true,
                  },
                )}
              />
              <Radio
                value="female"
                label={t(`sex.options.female`)}
                disabled={loading}
                color="pink"
                className={cn(
                  'flex h-[36px] items-center justify-start rounded-md border border-solid border-gray-300 px-4',
                  {
                    'bg-pink-100': true,
                    'border-pink-300': true,
                  },
                )}
              />
            </Group>
          </Radio.Group>
          <DatesProvider settings={{ locale: 'en', timezone: 'UTC', firstDayOfWeek: 0  }}>
            <DatePickerInput
              leftSection={<IconCalendar size={16} />}
              defaultLevel="decade"
              label={t('birthDate.label')}
              placeholder={t('birthDate.placeholder')}
              {...form.getInputProps('birthDate')}
              key={form.key('birthDate')}
            />
          </DatesProvider>
          <Input.Wrapper label={t('phone.label')} error={form.errors.phone}>
            <Input
              leftSection={<IconPhone size={16} />}
              placeholder={t('phone.placeholder')}
              component={PatternFormat}
              mask={'_'}
              format={'(###) ###-####'}
              {...form.getInputProps('phone')}
              key={form.key('phone')}
            />
          </Input.Wrapper>

          <TextInput
            leftSection={<IconMail size={16} />}
            label={t('email.label')}
            placeholder={t('email.placeholder')}
            {...form.getInputProps('email')}
            key={form.key('email')}
          />
        </SimpleGrid>
        <Divider
          label={
            <Badge size="sm" variant="outline" radius={'sm'} color="blue">
              {t('divider.address')}
            </Badge>
          }
          labelPosition="left"
        />
        <Checkbox
          label={t('family_address.label')}
          description={t('family_address.description')}
          {...form.getInputProps('useFamilyAddress', { type: 'checkbox' })}
          key={form.key('useFamilyAddress')}
        />
        <Collapse in={!form.getValues().useFamilyAddress}>
          <Stack gap={6}>
            <TextInput
              placeholder={t('streetAddress.placeholder')}
              label={t('streetAddress.label')}
              {...form.getInputProps('streetAddress')}
              disabled={form.getValues().useFamilyAddress || loading}
              key={form.key('streetAddress')}
            />
            <SimpleGrid cols={{ base: 1, md: 2 }} verticalSpacing={6}>
              <TextInput
                placeholder={t('city.placeholder')}
                label={t('city.label')}
                {...form.getInputProps('city')}
                disabled={form.getValues().useFamilyAddress || loading}
                key={form.key('city')}
              />
              <Select
                data={[
                  {
                    group: 'Local',
                    items: [
                      {
                        label: 'Florida',
                        value: 'FL',
                      },
                    ],
                  },
                  {
                    group: 'Nacional',
                    items: states
                      .filter((state) => state.abbreviation !== 'FL')
                      .map((state) => ({
                        label: `${state.name}`,
                        value: state.abbreviation,
                      })),
                  },
                ]}
                placeholder={t('state.placeholder')}
                label={t('state.label')}
                {...form.getInputProps('state')}
                disabled={form.getValues().useFamilyAddress || loading}
                key={form.key('state')}
              />
              <Input.Wrapper label={t('zipCode.label')}>
                <Input
                  placeholder={t('zipCode.placeholder')}
                  component={PatternFormat}
                  mask={'_'}
                  format={'#####'}
                  {...form.getInputProps('zipCode')}
                  disabled={form.getValues().useFamilyAddress || loading}
                  key={form.key('zipCode')}
                />
              </Input.Wrapper>
            </SimpleGrid>
          </Stack>
        </Collapse>
        <Divider
          label={
            <Badge size="sm" variant="outline" radius={'sm'} color="blue">
              {t('divider.permissions')}
            </Badge>
          }
          labelPosition="left"
        />
        {isFirstParent && (
          <Alert title={t('permissions.firstParentAlert.title')} color="blue">
            {t('permissions.firstParentAlert.description')}
          </Alert>
        )}
        <Checkbox
          label={t('permissions.pickup.label')}
          description={t('permissions.pickup.description')}
          {...form.getInputProps('allowToPickUp', { type: 'checkbox' })}
          disabled={isFirstParent}
          key={form.key('allowToPickUp')}
        />
        <Checkbox
          label={t('permissions.sign_document.label')}
          description={t('permissions.sign_document.description')}
          {...form.getInputProps('allowToAssignSignatures', {
            type: 'checkbox',
          })}
          disabled={isFirstParent}
          key={form.key('allowToAssignSignatures')}
        />
        <Divider
          label={
            <Badge size="sm" variant="outline" radius={'sm'} color="blue">
              {t('divider.documents')}
            </Badge>
          }
          labelPosition="left"
        />
        <Flex>
          <Fieldset
            legend={
              <Badge size="sm" variant="outline" radius={'sm'} color="blue">
                {t('driverLicence.label')}
              </Badge>
            }
            classNames={{
              root: 'flex flex-col items-center gap-2 pb-2',
            }}
          >
            <Text c={'dimmed'} fz={'sm'}>
              {t('driverLicence.disclaimer')}
            </Text>

            <FileButton
              onChange={driverLicense.onChange}
              accept="image/*,application/pdf"
            >
              {(props) => (
                <Box
                  onClick={props.onClick}
                  className="relative h-[220px] w-[300px] overflow-hidden rounded-md border border-solid border-gray-300"
                >
                  <LoadingOverlay visible={loading} />
                  {isPdf ? (
                    <Box className="flex h-full w-full cursor-pointer items-center justify-center bg-gray-100">
                      <iframe onClick={props.onClick} src={driverLicense.src} />
                    </Box>
                  ) : (
                    <NextImage
                      alt="Profile Picture"
                      src={driverLicense.src ?? DRIVER_LICENSE_PLACEHOLDER}
                      className="cursor-pointer object-contain transition-all hover:scale-105"
                      width={300}
                      height={220}
                    />
                  )}
                </Box>
              )}
            </FileButton>
            <FileButton
              onChange={driverLicense.onChange}
              accept="image/*,application/pdf"
            >
              {(props) => (
                <Button
                  loading={loading}
                  fullWidth
                  color={driverLicense.src ? 'red' : 'blue'}
                  variant={driverLicense.src ? 'light' : 'outline'}
                  onClick={props.onClick}
                >
                  {driverLicense.src
                    ? t('driverLicence.buttonWithFile')
                    : t('driverLicence.buttonNoFile')}
                </Button>
              )}
            </FileButton>
          </Fieldset>
        </Flex>
      </Stack>
      {/* Permissions */}
      {/* Documents */}
      {/* Actions */}
    </Card>
  )
}

const ParentTypeRadioComponent = ({
  checked,
  onChange,
  disabled,
  type,
}: {
  checked: boolean
  onChange: () => void
  disabled: boolean
  type: string
}) => {
  const t = useTranslations('parent_form')
  const src =
    type === 'parent'
      ? PARENT_PLACEHOLDER.src
      : type === 'guardian'
        ? GUARDIAN_PLACEHOLDER.src
        : RELATIVE_PLACEHOLDER.src
  return (
    <UnstyledButton
      disabled={disabled}
      onClick={onChange}
      className={cn(
        'flex-grow rounded-md border border-solid border-mtn-default-border px-2',
        {
          'bg-mtn-primary-0': checked,
        },
      )}
    >
      <Group justify="center" className="p-2">
        <div
          className={cn(
            'size-[32px] overflow-hidden rounded-md border border-solid border-mtn-default-border shadow-sm',
            {
              'grayscale filter': !checked,
            },
          )}
        >
          <Image src={src} alt={type} width={32} height={32} />
        </div>
        <Stack gap={0}>
          <Text>{t(`type.options.${type}`)}</Text>
        </Stack>
        <Radio
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          tabIndex={-1}
          styles={{ radio: { cursor: 'pointer' } }}
        />
      </Group>
    </UnstyledButton>
  )
}
