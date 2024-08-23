import { notFound, redirect } from 'next/navigation'
import { MedicalConsentForm } from '../_components/medical-consent-form-component'
import { api, HydrateClient } from '@/trpc/server'

export default async function MembershipApplicationFormPage({
  params,
}: {
  params: { mode: ['new' | 'edit' | 'view', string?] }
}) {
  if (params.mode[0] === 'new') {
    return <MedicalConsentForm mode={params.mode[0]} formId={undefined} />
  }

  if (params.mode[0] === 'view' || params.mode[0] === 'edit') {
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
    if (!form || form.slug !== 'medical-consent') {
      redirect('/404')
    }

    // Prefetch the form
    void api.club.forms.getFormByID.prefetch({
      id: parseInt(params.mode[1]),
    })

    return (
      <HydrateClient>
        <MedicalConsentForm
          mode={params.mode[0]}
          formId={parseInt(params.mode[1])}
        />
      </HydrateClient>
    )
  }

  return redirect('/404')
}
