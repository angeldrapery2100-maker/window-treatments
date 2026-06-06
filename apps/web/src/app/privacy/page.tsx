import type { Metadata } from 'next'
import Link from 'next/link'
import LegalPage, { LegalSection, LegalCallout } from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Angel Drapery, Inc Privacy Policy — what information we collect, how we use it, and your choices, including our SMS / text messaging privacy practices.',
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" subtitle="Angel Drapery, Inc · Last updated: June 6, 2026">
      <p className="leading-relaxed mb-2">
        Angel Drapery, Inc (&ldquo;Angel Drapery&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;)
        respects your privacy. This Privacy Policy explains what information we collect, how we use it, and your
        choices regarding that information when you contact us, request a quote or service, or communicate with us by
        phone, text message (SMS), email, or through our website.
      </p>

      <LegalSection heading="Information We Collect">
        <p>
          We collect information you provide directly to us, including: your name, phone number, email address,
          service or project address, and details about your window-treatment project or service request (such as
          product type, window measurements, photos, and videos you choose to share). We may also collect appointment
          preferences and notes related to your inquiry.
        </p>
      </LegalSection>

      <LegalSection heading="How We Use Your Information">
        <p>
          We use your information to: respond to your inquiries; prepare and follow up on quotes and orders; schedule
          measurement and installation appointments; provide customer service and warranty/repair support; and send
          you related text messages and emails about your project or service request.
        </p>
      </LegalSection>

      <LegalSection heading="SMS / Text Messaging">
        <LegalCallout>
          We do not sell, rent, or share your mobile phone number or SMS opt-in information with any third party or
          affiliate for their marketing or promotional purposes. Mobile information collected for the purpose of
          sending text messages is used solely to communicate with you about your project, appointment, quote, order,
          or service request.
        </LegalCallout>
        <p>
          When you provide your phone number and consent to receive text messages from Angel Drapery, we may send you
          messages such as appointment links, intake forms, quote and order follow-ups, and customer service replies.
          Message frequency varies. Message and data rates may apply. You can opt out at any time by replying{' '}
          <strong>STOP</strong>, and you can reply <strong>HELP</strong> for assistance. For full messaging terms, see
          our{' '}
          <Link href="/terms" className="font-medium underline underline-offset-2 hover:text-gray-900">
            SMS Terms &amp; Conditions
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection heading="Sharing of Information">
        <p>
          We may share your information only with service providers who help us operate our business (for example,
          scheduling, payment processing, and communication platforms) and only to the extent necessary to provide
          those services. These providers are not permitted to use your information for their own marketing. We may
          also disclose information if required by law. We do not sell your personal information.
        </p>
      </LegalSection>

      <LegalSection heading="Data Retention">
        <p>
          We retain your information for as long as needed to provide our services, comply with our legal obligations,
          resolve disputes, and enforce our agreements.
        </p>
      </LegalSection>

      <LegalSection heading="Your Choices">
        <p>
          You may opt out of text messages at any time by replying STOP. You may request that we update or delete your
          personal information by contacting us using the details below.
        </p>
      </LegalSection>

      <LegalSection heading="Contact Us">
        <p>
          Angel Drapery, Inc<br />
          Email:{' '}
          <a href="mailto:admin@angel-drapery.com" className="font-medium underline underline-offset-2 hover:text-gray-900">
            admin@angel-drapery.com
          </a>
          <br />
          Website:{' '}
          <a href="https://angel-drapery.com" className="font-medium underline underline-offset-2 hover:text-gray-900">
            angel-drapery.com
          </a>
        </p>
      </LegalSection>
    </LegalPage>
  )
}
