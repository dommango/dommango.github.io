import { Section } from '@/components/ui/Section'
import { ResumeRequestForm } from '@/components/contact/ResumeRequestForm'

export const metadata = {
  title: 'Contact - Request Resume',
  description: 'Request my resume and get in touch'
}

export default function ContactPage() {
  return (
    <Section>
      <div className="container mx-auto px-6 lg:px-8 max-w-2xl">
        <div className="mb-16 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Request My Resume
          </h1>
          <p className="text-text-secondary max-w-xl mx-auto">
            Interested in working together? Enter your details below and I'll send
            my resume directly to your inbox.
          </p>
        </div>

        <ResumeRequestForm />

        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-text-muted text-sm">
            Prefer to reach out directly?{' '}
            <a
              href="mailto:dommangonon@gmail.com"
              className="text-accent-gold hover:text-accent-gold-bright underline"
            >
              Email me
            </a>
          </p>
        </div>
      </div>
    </Section>
  )
}
