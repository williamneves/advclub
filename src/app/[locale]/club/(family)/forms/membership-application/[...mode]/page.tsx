import { redirect } from 'next/navigation'
import { MembershipApplicationForm } from '../_components/membership-application-form-component'
import { api, HydrateClient } from '@/trpc/server'

export default async function MembershipApplicationFormPage({
  params,
}: {
  params: { mode: ['new' | 'edit' | 'view' | 'review', string?] }
}) {
  if (params.mode[0] === 'new') {
    return (
      <MembershipApplicationForm mode={params.mode[0]} formId={undefined} />
    )
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
    if (!form || form.slug !== 'membership-application') {
      redirect('/404')
    }

    // Prefetch the form
    void api.club.forms.getFormByID.prefetch({
      id: parseInt(params.mode[1]),
    })

    return (
      <HydrateClient>
        <MembershipApplicationForm
          mode={params.mode[0]}
          formId={parseInt(params.mode[1])}
        />
      </HydrateClient>
    )
  }

  return redirect('/404')
}
