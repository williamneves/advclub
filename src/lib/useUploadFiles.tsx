import { useState } from 'react'
import { uploadAvatar, uploadDriverLicense } from '../utils/supabase/uploads'

interface UseUploadAvatarResult {
  uploadAvatar: (
    familyUUID: string,
    avatarUserId: string | number,
  ) => Promise<string | null>
  isUploading: boolean
  error: string | null
  avatarFile: File | null
  setAvatarFile: (file: File | null) => void
}

export function useUploadAvatar(): UseUploadAvatarResult {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const uploadAvatarFile = async (familyUUID: string, avatarUserId: string | number) => {
    if (!avatarFile) return null

    setIsUploading(true)
    setError(null)

    try {
      const url = await uploadAvatar(avatarFile, familyUUID, avatarUserId)
      return url
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else if (typeof err === 'string') {
        setError(err)
      } else {
        setError('An unknown error occurred')
      }
      return null
    } finally {
      setIsUploading(false)
    }
  }

  return { uploadAvatar: uploadAvatarFile, isUploading, error, avatarFile, setAvatarFile }
}

interface UseUploadDriverLicenseResult {
  uploadDriverLicense: (
    familyUUID: string,
    driverLicenseUserId: string | number,
  ) => Promise<string | null>
  isUploading: boolean
  error: string | null
  driverLicenseFile: File | null
  setDriverLicenseFile: (file: File | null) => void
}

export function useUploadDriverLicense(): UseUploadDriverLicenseResult {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [driverLicenseFile, setDriverLicenseFile] = useState<File | null>(null)

  const uploadDriverLicenseFile = async (
    familyUUID: string,
    driverLicenseUserId: string | number,
  ) => {
    if (!driverLicenseFile) return null

    setIsUploading(true)
    setError(null)

    try {
      const url = await uploadDriverLicense(
        driverLicenseFile,
        familyUUID,
        driverLicenseUserId,
      )
      return url
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else if (typeof err === 'string') {
        setError(err)
      } else {
        setError('An unknown error occurred')
      }
      return null
    } finally {
      setIsUploading(false)
    }
  }

  return {
    uploadDriverLicense: uploadDriverLicenseFile,
    isUploading,
    error,
    driverLicenseFile,
    setDriverLicenseFile,
  }
}
