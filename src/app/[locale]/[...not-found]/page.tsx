'use client'

import {
  Image,
  Container,
  Title,
  Text,
  Button,
  SimpleGrid,
} from '@mantine/core'
import IMAGE_404 from '@/assets/images/IMAGE_404.svg'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

export default function NotFoundImage() {
  const t = useTranslations('not_found')
  const router = useRouter()

  return (
    <Container className={'py-28'}>
      <SimpleGrid spacing={{ base: 40, sm: 80 }} cols={{ base: 1, sm: 2 }}>
        <Image
          src={IMAGE_404.src}
          className={'min-w-full'}
          alt="Not Found"
          hiddenFrom="sm"
        />
        <div>
          <Title
            className={'mb-mtn-md text-[32px] font-extrabold md:text-[36px]'}
          >
            {t('title')}
          </Title>
          <Text c="dimmed" size="lg">
            {t('description')}
          </Text>
          <Button onClick={() => router.back()} variant="outline" size="md" mt="xl" className={'max-w-full'}>
            {t('button')}
          </Button>
        </div>
        <Image
          src={IMAGE_404.src}
          className={'max-w-[48rem]'}
          alt="Not Found"
          visibleFrom="sm"
        />
      </SimpleGrid>
    </Container>
  )
}
