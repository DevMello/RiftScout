import { Metadata } from 'next'
import PrivacyPolicyContent from '@/components/privacy-policy'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Our commitment to protecting your privacy',
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyContent />
}

