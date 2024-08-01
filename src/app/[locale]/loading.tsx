import { Center, Loader } from '@mantine/core'


export default function Loading() {
  return (
    <Center h={'100vh'} w={'100%'}>
      <Loader type="bars" />
    </Center>
  )
}
