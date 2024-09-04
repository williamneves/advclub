'use client'

import { useForm, zodResolver } from '@mantine/form'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { api } from '@/trpc/react'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconDeviceFloppy, IconX } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { Button } from '@mantine/core'
import { getMemberFormSchema, type MemberFormData } from './form-types'
import { membersSchema } from '@/server/db/schemas'
import { MemberFormInputFields } from './member-form-fields'

export const CreateMember = ({
  mode,
  memberId,
}: {
  memberId?: number
  mode: 'new' | 'edit'
}) => {
  const t = useTranslations('member_form')
  const router = useRouter()
  const schema = getMemberFormSchema(t)

  const [loading, setLoading] = useState(false)
  const [authId, setAuthId] = useState('')

  const member = api.club.members.getMemberById.useQuery(
    {
      id: memberId ?? 0,
    },
    {
      enabled: !!memberId && mode === 'edit',
    },
  )

  const form = useForm<MemberFormData>({
    initialValues: {
      firstName: '',
      lastName: '',
      type: 'admin',
      sex: '',
      phone: '',
      email: '',
      avatar: '',
    },
    mode: 'uncontrolled',
    validate: zodResolver(schema),
    enhanceGetInputProps: () => ({
      disabled: createMember.isPending || loading,
    }),
  })

  const utils = api.useUtils()
  const createMember = api.club.members.createMember.useMutation({
    onSuccess: async () => {
      await utils.club.members.getMemberByAuthId.invalidate()
    },
  })

  const updateMember = api.club.members.updateMember.useMutation({
    onSuccess: async () => {
      await utils.club.members.getMemberById.invalidate(
        {
          id: memberId ?? 0,
        },
        {
          exact: false,
        },
      )
      await utils.club.members.getMemberByAuthId.invalidate()
    },
  })

  useEffect(() => {
    setAuthId(form.values.authId ? form.values.authId : '')
  }, [form.values.authId])

  const handleCreateMember = async (data: MemberFormData) => {
    try {
      setLoading(true)

      const values = membersSchema.insert.parse(data)

      await createMember.mutateAsync({
        ...values,
      })

      await updateMember.mutateAsync({
        id: Number(authId),
        data: {
          ...values,
        },
      })

      notifications.show({
        message: t('toast.success'),
        icon: <IconCheck />,
        color: 'teal',
      })
      form.reset()
      router.push(`/club/members/member`)
    } catch (error) {
      console.error('Error creating member:', error)
      notifications.show({
        message: t('toast.error'),
        icon: <IconX />,
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateMember = async (data: MemberFormData) => {
    if (!memberId) {
      throw new Error('Member not found')
    }

    try {
      setLoading(true)

      const values = membersSchema.update.parse(data)

      await updateMember.mutateAsync({
        id: memberId,
        data: {
          ...values,
        },
      })

      notifications.show({
        message: t('toast.success'),
        icon: <IconCheck />,
        color: 'teal',
      })
      form.reset()
      router.push(`/club/members/member`)
    } catch (error) {
      console.error('Error creating member:', error)
      notifications.show({
        message: t('toast.error'),
        icon: <IconX />,
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleErrors = (errors: typeof form.errors) => {
    console.log(errors)
  }

  const handleSubmit = async (data: MemberFormData) => {
    if (mode === 'new') {
      return handleCreateMember(data)
    } else {
      return handleUpdateMember(data)
    }
  }

  const users = api.club.members.getAllAuthUsers.useQuery().data

  const userOptions = users?.data.users.map((user) => ({
    value: user.id,
    label: `${user.email}`,
  }))

  useEffect(() => {
    if (member.status === 'success' && member.data) {
      form.initialize({
        firstName: member.data.firstName ?? '',
        lastName: member.data.lastName ?? '',
        type: member.data.type,
        sex: member.data.sex,
        phone: member.data.phone ?? '',
        email: member.data.email,
        avatar: member.data.avatar ?? '',
      })
    }
  }, [member.status, member.data])

  return (
    <form
      onSubmit={form.onSubmit(handleSubmit, handleErrors)}
      className="mb-20 flex flex-col gap-4"
    >
      <MemberFormInputFields
        mode={mode}
        form={form}
        loading={loading}
        users={userOptions ?? []}
      />
      <div className="flex justify-end">
        <Button
          rightSection={<IconDeviceFloppy size={20} />}
          type="submit"
          loading={loading}
        >
          {mode === 'new' ? t('button.label') : t('edit_button.label')}
        </Button>
      </div>
    </form>
  )
}
