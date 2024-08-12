'use client'

import { useForm, zodResolver } from '@mantine/form'
import { ParentFormInputFields } from './parent-form-input-fields'
import { getParentFormSchema, ParentFormData } from './form-types'
import { useUploadAvatar, useUploadDriverLicense } from '@/lib/useUploadFiles'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import loading from '@/app/[locale]/loading'
import { parentsGuardiansType, sexEnumSchema } from '@/server/db/schemas'
import { useTranslations } from 'next-intl'
import { api } from '@/trpc/react'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconDeviceFloppy, IconX } from '@tabler/icons-react'
import router from 'next/router'
import { useRouter } from 'next/navigation'
import { Button } from '@mantine/core'

export const CreateParent = ({
  isFirstParent,
  familyId,
  familyUUID,
  mode,
  parentId,
}: {
  isFirstParent: boolean
  familyId: number
  familyUUID: string
  parentId?: number
  mode: 'new' | 'edit'
}) => {
  const t = useTranslations('parent_form')
  const router = useRouter()
  const schema = getParentFormSchema(t)

  const [loading, setLoading] = useState(false)

  const parent = api.club.parents.getParentById.useQuery(
    {
      id: parentId ?? 0,
    },
    {
      enabled: !!parentId && mode === 'edit',
    },
  )

  const form = useForm<ParentFormData>({
    initialValues: {
      firstName: '',
      lastName: '',
      type: 'parent',
      sex: '',
      birthDate: null,
      phone: '',
      email: '',
      main: mode === 'new' ? isFirstParent : false,
      allowToPickUp: mode === 'new' ? isFirstParent : false,
      allowToAssignSignatures: mode === 'new' ? isFirstParent : false,
      useFamilyAddress: false,
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
      avatar: '',
      driverLicense: '',
    },
    validate: zodResolver(schema),
    enhanceGetInputProps: () => ({
      disabled: createParent.isPending || loading,
    }),
  })

  const utils = api.useUtils()
  const createParent = api.club.parents.createParent.useMutation({
    onSuccess: async () => {
      await utils.club.parents.getParentsByLoggedInFamily.invalidate()
      await utils.club.families.getLoggedInFamily.invalidate()
    },
  })

  const updateParent = api.club.parents.updateParent.useMutation({
    onSuccess: async () => {
      await utils.club.parents.getParentById.invalidate(
        {
          id: parentId ?? 0,
        },
        {
          exact: false,
        },
      )
      await utils.club.parents.getParentsByLoggedInFamily.invalidate()
      await utils.club.families.getLoggedInFamily.invalidate()
    },
  })

  const { avatarFile, setAvatarFile, uploadAvatar } = useUploadAvatar()

  const { uploadDriverLicense, driverLicenseFile, setDriverLicenseFile } =
    useUploadDriverLicense()

  const driverLicenceUrl = driverLicenseFile
    ? URL.createObjectURL(driverLicenseFile)
    : (parent.data?.driverLicense ?? undefined)

  const avatarUrl = avatarFile
    ? URL.createObjectURL(avatarFile)
    : (parent.data?.avatar ?? undefined)

  const handleCreateParent = async (data: ParentFormData) => {
    // return console.log(data)
    // If pickup is active, parent need to have avatar and driver licence
    if (data.allowToPickUp) {
      if (!avatarFile) {
        form.setFieldError('allowToPickUp', t('permissions.pickup.error'))
        return
      }
      if (!driverLicenseFile) {
        form.setFieldError('allowToPickUp', t('permissions.pickup.error'))
        return
      }
    }

    try {
      setLoading(true)

      // Revalidate form
      const values = schema.parse(data)

      // Create parent and get the id
      const parent = await createParent.mutateAsync({
        ...values,
        familyId,
      })
      const parentId = parent[0]?.id

      if (!parentId) {
        throw new Error('Parent not created')
      }

      // Upload the files
      let avatarUrl: string | null = null
      let driverLicenceUrl: string | null = null
      if (avatarFile) {
        avatarUrl = await uploadAvatar(familyUUID, parentId)
        if (!avatarUrl) {
          throw new Error('Avatar not uploaded')
        }
      }
      if (driverLicenseFile) {
        driverLicenceUrl = await uploadDriverLicense(familyUUID, parentId)
        if (!driverLicenceUrl) {
          throw new Error('Driver licence not uploaded')
        }
      }

      // Update parent with the files
      await updateParent.mutateAsync({
        id: parentId,
        data: {
          avatar: avatarUrl ?? '',
          driverLicense: driverLicenceUrl ?? '',
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

  const handleUpdateParent = async (data: ParentFormData) => {

    if (!parentId) {
      throw new Error('Parent not found')
    }

    // return console.log(data)
    // If pickup is active, parent need to have avatar and driver licence
    if (data.allowToPickUp) {
      if (!avatarFile && !data.avatar) {
        form.setFieldError('allowToPickUp', t('permissions.pickup.error'))
        return
      }
      if (!driverLicenseFile && !data.driverLicense) {
        form.setFieldError('allowToPickUp', t('permissions.pickup.error'))
        return
      }
    }

    try {
      setLoading(true)

      // Revalidate form
      const values = schema.parse(data)

      // Update avatar and driver licence
      // Upload the files
      let avatarUrl = values.avatar
      let driverLicenceUrl = values.driverLicense
      if (avatarFile) {
        avatarUrl = await uploadAvatar(familyUUID, parentId)
        if (!avatarUrl) {
          throw new Error('Avatar not uploaded')
        }
      }
      if (driverLicenseFile) {
        driverLicenceUrl = await uploadDriverLicense(familyUUID, parentId)
        if (!driverLicenceUrl) {
          throw new Error('Driver licence not uploaded')
        }
      }

      // Create parent and get the id
      await updateParent.mutateAsync({
        id: parentId,
        data: {
          ...values,
          avatar: avatarUrl ?? values.avatar ?? '',
          driverLicense: driverLicenceUrl ?? values.driverLicense ?? '',
        },
      })

      // Update parent with the files
      await updateParent.mutateAsync({
        id: parentId,
        data: {
          avatar: avatarUrl ?? '',
          driverLicense: driverLicenceUrl ?? '',
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

  const handleSubmit = async (data: ParentFormData) => {
    if (mode === 'new') {
      return handleCreateParent(data)
    } else {
      return handleUpdateParent(data)
    }
  }

  useEffect(() => {
    if (parent.status === 'success' && parent.data) {
      form.initialize({
        firstName: parent.data.firstName,
        lastName: parent.data.lastName,
        type: parent.data.type,
        sex: parent.data.sex,
        birthDate: parent.data.birthDate ?? '',
        phone: parent.data.phone,
        email: parent.data.email,
        main: !!parent.data.main,
        allowToPickUp: !!parent.data.allowToPickUp,
        allowToAssignSignatures: !!parent.data.allowToAssignSignatures,
        useFamilyAddress: !!parent.data.useFamilyAddress,
        streetAddress: parent.data.streetAddress ?? '',
        city: parent.data.city ?? '',
        state: parent.data.state ?? '',
        zipCode: parent.data.zipCode ?? '',
        avatar: parent.data.avatar ?? '',
        driverLicense: parent.data.driverLicense ?? '',
      })
    }
  }, [parent.status, parent.data])

  return (
    <form
      onSubmit={form.onSubmit(handleSubmit, handleErrors)}
      className="mb-20 flex flex-col gap-4"
    >
      <ParentFormInputFields
        mode={mode}
        form={form}
        isFirstParent={isFirstParent}
        loading={loading}
        profilePicture={{
          src: avatarUrl,
          onChange: setAvatarFile,
          onRemove: () => setAvatarFile(null),
          isLoading: loading,
        }}
        driverLicense={{
          src: driverLicenceUrl,
          onChange: setDriverLicenseFile,
          onRemove: () => setDriverLicenseFile(null),
          isLoading: loading,
          file: driverLicenseFile,
        }}
      />
      <div className="flex justify-end">
        <Button rightSection={<IconDeviceFloppy size={20} />} type="submit" loading={loading}>
          {mode === 'new' ? t('button.label') : t('edit_button.label')}
        </Button>
      </div>
    </form>
  )
}
