export const FORM_TYPES = {
  membershipAplication: 'membership-application',
  medicalConsent: 'medical-consent',
  mediaConsent: 'media-consent',
  codeOfConduct: 'code-conduct',
} as const

export type FormType = (typeof FORM_TYPES)[keyof typeof FORM_TYPES]

export const FORM_TYPES_LABELS = {
  [FORM_TYPES.membershipAplication]: 'Membership Application',
  [FORM_TYPES.medicalConsent]: 'Medical Consent',
  [FORM_TYPES.mediaConsent]: 'Media Consent',
  [FORM_TYPES.codeOfConduct]: 'Code of Conduct',
} as const

export type FormTypeLabel =
  (typeof FORM_TYPES_LABELS)[keyof typeof FORM_TYPES_LABELS]

export const FORM_TYPES_ARRAY = Object.values(FORM_TYPES)

export const FORM_TYPES_ARRAY_WITH_LABELS = FORM_TYPES_ARRAY.map(
  (formType) => ({
    [formType]: FORM_TYPES_LABELS[formType],
  }),
)
