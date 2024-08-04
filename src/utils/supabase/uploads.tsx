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
        cacheControl: '0',
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

  const { data } = supabaseClient.storage.from(DEFAULT_BUCKET).getPublicUrl(path)

  return data.publicUrl
}

export async function uploadAvatar(
  file: File,
  familyUUID: string,
  avatarUserId: string | number,
) {
  try {
    const { path } = await uploadFile(file, {
      pathToSave: `avatar/${familyUUID}-${avatarUserId}-avatar`,
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
) {
  try {
    const { path } = await uploadFile(file, {
      pathToSave: `driver-license/${familyUUID}-${driverLicenseUserId}-driver-license`,
      bucket: DEFAULT_BUCKET,
    })

    const url = getFileUrl(path)
    return url
  } catch (err) {
    console.error('Error uploading driver license:', err)
    throw err
  }
}

export async function uploadFamilyPhoto(file: File, familyUUID: string) {
  try {
    const { path } = await uploadFile(file, {
      pathToSave: `family-photo/${familyUUID}-family-photo`,
      bucket: DEFAULT_BUCKET,
    })

    const url = getFileUrl(path)

    return url
  } catch (err) {
    console.error('Error uploading family photo:', err)
    throw err
  }
}

export async function uploadGeneralFile(file: File, fileName: string) {
  // Timestamp the file name to prevent overwriting
 
  const timestamp = new Date().getTime()

  try {
    const { path } = await uploadFile(file, {
      pathToSave: `general/${fileName}-${timestamp}`,
      bucket: DEFAULT_BUCKET,
    })

    const url = getFileUrl(path)

    return url
  } catch (err) {
    console.error('Error uploading general file:', err)
    throw err
  }
}
