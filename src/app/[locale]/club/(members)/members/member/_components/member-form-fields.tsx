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
  UnstyledButton,
  Select,
} from '@mantine/core'
import { memberTypeEnum } from '@/server/db/schemas'
import { PatternFormat } from 'react-number-format'
import { cn } from '@/lib/utils'
import { IconMail, IconPhone } from '@tabler/icons-react'
import { type MemberFormData } from './form-types'

export const MemberFormInputFields = ({
  form,
  mode,
  loading,
  users,
}: {
  form: UseFormReturnType<MemberFormData>
  mode: 'new' | 'edit'
  loading: boolean
  users: { label: string; value: string }[]
}) => {
  const t = useTranslations('member_form')

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
        <Divider
          label={
            <Badge size="sm" variant="outline" radius={'sm'} color="blue">
              {t('divider.user')}
            </Badge>
          }
          labelPosition="left"
        />
        <Select
          searchable
          data={users}
          label={t('user_label')}
          placeholder={t('user_placeholder')}
          {...form.getInputProps('authId')}
          key={form.key('authId')}
        />
        <Divider
          label={
            <Badge size="sm" variant="outline" radius={'sm'} color="blue">
              {t('divider.type')}
            </Badge>
          }
          labelPosition="left"
        />
        <div className="flex flex-wrap gap-2">
          {memberTypeEnum.options.map((type) => (
            <MemberTypeRadioComponent
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
      </Stack>
    </Card>
  )
}

const MemberTypeRadioComponent = ({
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
  const t = useTranslations('member_form')

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
