// get last name from user
export const getLastName = (name?: string) => {
  if (!name) return ''
  // Return the last word of the name
  return name.split(' ')[name.split(' ').length - 1]
}