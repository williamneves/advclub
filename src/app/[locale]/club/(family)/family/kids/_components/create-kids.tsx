'use client'

import { useForm, zodResolver } from '@mantine/form'
import { useUploadAvatar } from '@/lib/useUploadFiles'
import { useEffect, useState } from 'react'
// import { z } from 'zod'
// import loading from '@/app/[locale]/loading'
// import { parentsGuardiansType, sexEnumSchema } from '@/server/db/schemas'
import { useTranslations } from 'next-intl'
import { api } from '@/trpc/react'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconDeviceFloppy, IconX } from '@tabler/icons-react'
// import router from 'next/router'
import { useRouter } from 'next/navigation'
import { Button } from '@mantine/core'
import { getKidFormSchema, type KidFormData } from './form-types'
import { KidFormInputFields } from './kid-form-fields'

export const CreateKids = ({
  isFirstKid,
  familyId,
  familyUUID,
  mode,
  kidId,
}: {
  isFirstKid: boolean
  familyId: number
  familyUUID: string
  kidId?: number
  mode: 'new' | 'edit'
}) => {
  const t = useTranslations('kid_form')
  const router = useRouter()
  const schema = getKidFormSchema(t)

  const [loading, setLoading] = useState(false)

  const kid = api.club.kids.getKidById.useQuery(
    {
      id: kidId ?? 0,
    },
    {
      enabled: !!kidId && mode === 'edit',
    },
  )

  const form = useForm<KidFormData>({
    initialValues: {
      firstName: '',
      lastName: '',
      sex: '',
      birthDate: '12/01/2000',
      phoneNumber: '',
      avatar: '',
      alias: '',
      height: '',
      weight: '',
      notes: '',
    },
    validate: zodResolver(schema),
    enhanceGetInputProps: () => ({
      disabled: createKid.isPending || loading,
    }),
  })

  const utils = api.useUtils()
  const createKid = api.club.kids.createKid.useMutation({
    onSuccess: async () => {
      await utils.club.kids.getKidsByLoggedInFamily.invalidate()
      await utils.club.families.getLoggedInFamily.invalidate()
    },
  })

  const updateKid = api.club.kids.updateKid.useMutation({
    onSuccess: async () => {
      await utils.club.kids.getKidById.invalidate(
        {
          id: kidId ?? 0,
        },
        {
          exact: false,
        },
      )
      //   await utils.club.kids.getKidsByFamilyId.invalidate({
      //     familyId: familyId ?? 0,
      //   })
      await utils.club.kids.getKidsByLoggedInFamily.invalidate()
      await utils.club.families.getLoggedInFamily.invalidate()
    },
  })

  const { avatarFile, setAvatarFile, uploadAvatar } = useUploadAvatar()

  const avatarUrl = avatarFile
    ? URL.createObjectURL(avatarFile)
    : (kid.data?.avatar ?? undefined)

  const handleCreateKid = async (data: KidFormData) => {
    try {
      setLoading(true)

      // Revalidate form
      const values = schema.parse(data)

      // Create kid and get the id
      const kid = await createKid.mutateAsync({
        familyId,
        ...values,
      })
      const kidId = kid[0]?.id

      if (!kidId) {
        throw new Error('Kid not created')
      }

      // Upload the files
      let avatarUrl: string | null = null
      if (avatarFile) {
        avatarUrl = await uploadAvatar(familyUUID, kidId)
        if (!avatarUrl) {
          throw new Error('Avatar not uploaded')
        }
      }

      // Update parent with the files
      await updateKid.mutateAsync({
        id: kidId,
        data: {
          avatar: avatarUrl ?? '',
        },
      })

      notifications.show({
        message: t('toast.success'),
        icon: <IconCheck />,
        color: 'teal',
      })
      form.reset()
      router.push(`/club/family`)
    } catch (error) {
      console.error('Error creating parent:', error)
      notifications.show({
        message: t('toast.error'),
        icon: <IconX />,
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateKid = async (data: KidFormData) => {
    if (!kidId) {
      throw new Error('Kid not found')
    }

    try {
      setLoading(true)

      // Revalidate form
      const values = schema.parse(data)

      // Update avatar and driver licence
      // Upload the files
      let avatarUrl = values.avatar
      if (avatarFile) {
        avatarUrl = await uploadAvatar(familyUUID, kidId)
        if (!avatarUrl) {
          throw new Error('Avatar not uploaded')
        }
      }

      // Create child and get the id
      await updateKid.mutateAsync({
        id: kidId,
        data: {
          ...values,
          avatar: avatarUrl ?? values.avatar ?? '',
        },
      })

      // Update child with the files
      await updateKid.mutateAsync({
        id: kidId,
        data: {
          avatar: avatarUrl ?? '',
        },
      })

      notifications.show({
        message: t('toast.success'),
        icon: <IconCheck />,
        color: 'teal',
      })
      form.reset()
      router.push(`/club/family`)
    } catch (error) {
      console.error('Error creating parent:', error)
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

  const handleSubmit = async (data: KidFormData) => {
    if (mode === 'new') {
      return handleCreateKid(data)
    } else {
      return handleUpdateKid(data)
    }
  }

  useEffect(() => {
    if (kid.status === 'success' && kid.data) {
      form.initialize({
        firstName: kid.data.firstName,
        lastName: kid.data.lastName,
        sex: kid.data.sex,
        birthDate: kid.data.birthDate ?? '',
        phoneNumber: kid.data.phoneNumber,
        avatar: kid.data.avatar ?? '',
      })
    }
  }, [kid.status, kid.data])

  return (
    <form
      onSubmit={form.onSubmit(handleSubmit, handleErrors)}
      className="mb-20 flex flex-col gap-4"
    >
      <KidFormInputFields
        mode={mode}
        form={form}
        isFirstKid={isFirstKid}
        loading={loading}
        profilePicture={{
          src: avatarUrl,
          onChange: setAvatarFile,
          onRemove: () => setAvatarFile(null),
          isLoading: loading,
        }}
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
