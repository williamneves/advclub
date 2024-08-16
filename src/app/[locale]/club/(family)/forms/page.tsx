// Show a button to create each form

import { Card, UnstyledButton, Text, Title, Stack, SimpleGrid } from "@mantine/core"
import { FORM_TYPES_ARRAY, FORM_TYPES_ARRAY_WITH_LABELS } from "./_components/consts"
import Link from "next/link"
import { useTranslations } from "next-intl"

// Show a list of childrens, with each form inside with status and link to see/edit/delete

export default function Forms() {
  const t = useTranslations('forms_page')

  return (
    <Stack>
      <Title order={1}>{t('title')}</Title>
      <Text>{t('description')}</Text>
      <SimpleGrid cols={{base: 2, md: 3}}>
        <FormTypeButtonBlocks />
      </SimpleGrid>
    </Stack>
  )
}

function FormTypeButtonBlocks() {
  const t = useTranslations("forms_page")
  return FORM_TYPES_ARRAY_WITH_LABELS.map((formType) => {
    const value = Object.values(formType)[0]
    const key = Object.keys(formType)[0]
    return (
      <UnstyledButton component={Link} href={`/club/forms/${key}`} key={key} className="group">
        <Card withBorder p="md" radius="md" shadow="sm" w="100%" className="flex h-full flex-col items-center justify-center group-hover:bg-gray-100 transition-colors">
          <Title order={4} ta="center">{value}</Title>
          <Text size="sm" ta="center">{t("forms_buttons.click_to_new")}</Text>
        </Card>
      </UnstyledButton>
    )
  })
}