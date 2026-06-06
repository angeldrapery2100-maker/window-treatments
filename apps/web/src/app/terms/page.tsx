import type { Metadata } from 'next'
import Link from 'next/link'
import LegalPage, { LegalSection } from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'SMS Terms & Conditions',
  description:
    'Angel Drapery, Inc SMS Terms & Conditions — program description, message frequency, rates, how to opt out (STOP), help (HELP), carrier disclaimer, and privacy.',
  alternates: { canonical: '/terms' },
  robots: { index: true, follow: true },
}

export default function TermsPage() {
  return (
    <LegalPage title="SMS Terms & Conditions" subtitle="Angel Drapery, Inc · Last updated: June 6, 2026">
      <p className="leading-relaxed mb-2">
        These SMS Terms &amp; Conditions govern the text messaging program operated by Angel Drapery, Inc
        (&ldquo;Angel Drapery&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). By providing your
        phone number and consenting to receive text messages from us, you agree to these terms.
      </p>

      <LegalSection heading="Program Description">
        <p>
          When you contact Angel Drapery and opt in, we may send you text messages related to your inquiry, including
          appointment scheduling links, project and repair intake forms, quote and order status follow-ups,
          appointment confirmations, and responses to your customer service questions. This is a customer care
          program, not a marketing program.
        </p>
      </LegalSection>

      <LegalSection heading="How to Opt In">
        <p>
          You opt in by providing your phone number to Angel Drapery and agreeing to receive text messages — either
          verbally when you call us, or by submitting a form on our website and checking the box to agree to receive
          text messages.
        </p>
      </LegalSection>

      <LegalSection heading="Message Frequency">
        <p>Message frequency varies and depends on your interactions with us.</p>
      </LegalSection>

      <LegalSection heading="Cost">
        <p>
          Message and data rates may apply, depending on your mobile carrier and plan. Angel Drapery does not charge
          for the text messages, but your carrier&rsquo;s standard rates apply.
        </p>
      </LegalSection>

      <LegalSection heading="How to Opt Out">
        <p>
          You can cancel the SMS service at any time by replying <strong>STOP</strong> to any message. After you send
          STOP, we will send a confirmation message and then stop sending you text messages. To rejoin, reply START or
          contact us again.
        </p>
      </LegalSection>

      <LegalSection heading="Help">
        <p>
          For help, reply <strong>HELP</strong> to any message, or contact us at{' '}
          <a href="mailto:admin@angel-drapery.com" className="font-medium underline underline-offset-2 hover:text-gray-900">
            admin@angel-drapery.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection heading="Carriers">
        <p>
          Carriers are not liable for delayed or undelivered messages. Message delivery is subject to effective
          transmission by your mobile carrier and is not guaranteed.
        </p>
      </LegalSection>

      <LegalSection heading="Privacy">
        <p>
          Your information is handled in accordance with our{' '}
          <Link href="/privacy" className="font-medium underline underline-offset-2 hover:text-gray-900">
            Privacy Policy
          </Link>
          . We do not sell, rent, or share your mobile phone number or SMS opt-in information with any third party for
          their marketing purposes.
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
