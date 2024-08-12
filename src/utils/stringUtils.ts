// get last name from user
export const getLastName = (name?: string) => {
  if (!name) return ''
  // Return the last word of the name
  return name.split(' ')[name.split(' ').length - 1]
}

// Format US phone number
export const formatPhoneNumber = (phoneNumber?: string) => {
  if (!phoneNumber) return phoneNumber
  return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
}

export const capitalizeWords = (str: string) => {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
