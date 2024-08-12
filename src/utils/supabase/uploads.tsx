import { createClient } from './client'

const DEFAULT_BUCKET = 'default'
export async function uploadFile(
  file: File,
  {
    pathToSave,
    bucket = DEFAULT_BUCKET,
    upsert = true,
  }: { pathToSave?: string; bucket?: string; upsert?: boolean },
) {
  const supabaseClient = createClient()

  const fileExt = file.name.split('.').pop()

  try {
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .upload(`${pathToSave ?? file.name}.${fileExt}`, file, {
        cacheControl: '3600',
        upsert,
      })

    if (error) {
      // Handle specific error cases if needed
      throw new Error(`Error uploading file: ${error.message}`)
    }

    return data
  } catch (err) {
    // Handle general upload errors
    console.error('Error uploading file:', err)
    throw err
  }
}

export function getFileUrl(path: string) {
  const supabaseClient = createClient()

  const { data } = supabaseClient.storage
    .from(DEFAULT_BUCKET)
    .getPublicUrl(path)

  return data.publicUrl
}

export async function uploadAvatar(
  file: File,
  familyUUID: string,
  avatarUserId: string | number,
  withTimestamp = true,
) {
  try {
    let pathToSave = `avatar/${familyUUID}-${avatarUserId}-avatar`

    if (withTimestamp) {
      pathToSave = `${pathToSave}-${new Date().getTime()}`
    }

    const { path } = await uploadFile(file, {
      pathToSave,
      bucket: DEFAULT_BUCKET,
    })

    const url = getFileUrl(path)
    return url
  } catch (err) {
    console.error('Error uploading avatar:', err)
    throw err
  }
}

export async function uploadDriverLicense(
  file: File,
  familyUUID: string,
  driverLicenseUserId: string | number,
  withTimestamp = true,
) {
  try {
    let pathToSave = `driver-license/${familyUUID}-${driverLicenseUserId}-driver-license`

    if (withTimestamp) {
      pathToSave = `${pathToSave}-${new Date().getTime()}`
    }

    const { path } = await uploadFile(file, {
      pathToSave,
      bucket: DEFAULT_BUCKET,
    })

    const url = getFileUrl(path)
    return url
  } catch (err) {
    console.error('Error uploading driver license:', err)
    throw err
  }
}

export async function uploadFamilyPhoto(
  file: File,
  familyUUID: string,
  withTimestamp = true,
) {
  try {
    let pathToSave = `family-photo/${familyUUID}-family-photo`

    if (withTimestamp) {
      pathToSave = `${pathToSave}-${new Date().getTime()}`
    }

    const { path } = await uploadFile(file, {
      pathToSave,
      bucket: DEFAULT_BUCKET,
    })

    const url = getFileUrl(path)

    return url
  } catch (err) {
    console.error('Error uploading family photo:', err)
    throw err
  }
}

export async function uploadGeneralFile(
  file: File,
  fileName: string,
  withTimestamp = true,
) {
  // Timestamp the file name to prevent overwriting

  try {
    let pathToSave = `general/${fileName}`

    if (withTimestamp) {
      pathToSave = `${pathToSave}-${new Date().getTime()}`
    }

    const { path } = await uploadFile(file, {
      pathToSave,
      bucket: DEFAULT_BUCKET,
    })

    const url = getFileUrl(path)

    return url
  } catch (err) {
    console.error('Error uploading general file:', err)
    throw err
  }
}

export async function deleteFileByUrl(url: string) {
  const DEFAULT_URL = `public/${DEFAULT_BUCKET}/`

  // Split the URL by the DEFAULT_URL string
  const urlParts = url.split(DEFAULT_URL)

  // If the URL contains the DEFAULT_URL, urlParts[1] will be the path
  const path = urlParts.length > 1 ? urlParts[1]! : url

  const supabaseClient = createClient()

  const { error } = await supabaseClient.storage
    .from(DEFAULT_BUCKET)
    .remove([path])

  if (error) {
    console.error('Error deleting file:', error)
    throw error
  }
}
