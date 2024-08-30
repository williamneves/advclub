import { notFound, redirect } from 'next/navigation'
import { MediaConsent } from '../_components/media-consent-form-component'
import { api, HydrateClient } from '@/trpc/server'
import { createClient } from '@/utils/supabase/client'

export default async function MediaConsentFormPage({
  params,
}: {
  params: { mode: ['new' | 'edit' | 'view' | 'review', string?] }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const member = await api.club.members.getMemberByAuthId({
    authId: user.id,
  })

  if (!member) {
    return notFound()
  }

  if (params.mode[0] === 'new') {
    return <MediaConsent mode={params.mode[0]} formId={undefined} />
  }

  if (
    params.mode[0] === 'view' ||
    params.mode[0] === 'edit' ||
    params.mode[0] === 'review'
  ) {
    if (!params.mode[1]) {
      redirect('/404')
    }

    if (isNaN(parseInt(params.mode[1]))) {
      redirect('/404')
    }

    // Look for the form
    const form = await api.club.forms.getFormByID({
      id: parseInt(params.mode[1]),
    })

    // Check if the form is a membership application
    if (!form || form.slug !== 'media-consent') {
      redirect('/404')
    }

    // Prefetch the form
    void api.club.forms.getFormByID.prefetch({
      id: parseInt(params.mode[1]),
    })

    return (
      <HydrateClient>
        <MediaConsent mode={params.mode[0]} formId={parseInt(params.mode[1])} />
      </HydrateClient>
    )
  }

  return redirect('/404')
}
