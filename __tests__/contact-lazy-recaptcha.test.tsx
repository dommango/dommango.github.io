import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

// next/dynamic just needs to resolve the loader eagerly for this test —
// no need to exercise Next's real chunk-splitting machinery under vitest.
// Neither mock forwards the component's ref — the submit flow's
// `recaptchaRef.current?.reset()` isn't exercised by this test.
vi.mock('next/dynamic', () => ({
  __esModule: true,
  default: (loader: () => Promise<{ default: React.ComponentType<unknown> }>) =>
    function DynamicStub(props: object) {
      const [Comp, setComp] = React.useState<React.ComponentType<unknown> | null>(null)
      React.useEffect(() => {
        loader().then((mod) => setComp(() => mod.default))
      }, [])
      if (!Comp) return null
      return React.createElement(Comp, props)
    },
}))

vi.mock('react-google-recaptcha', () => {
  function ReCAPTCHAStub(props: { sitekey: string }) {
    return React.createElement('div', { 'data-testid': 'recaptcha', 'data-sitekey': props.sitekey })
  }
  return { __esModule: true, default: ReCAPTCHAStub }
})

describe('Contact form reCAPTCHA', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('NEXT_PUBLIC_RECAPTCHA_SITE_KEY', 'test-site-key')
  })

  it('does not mount reCAPTCHA until the visitor interacts with the form', async () => {
    const { Contact } = await import('@/components/landing/Contact')
    render(React.createElement(Contact))

    expect(screen.queryByTestId('recaptcha')).not.toBeInTheDocument()

    fireEvent.focus(screen.getByLabelText('Name'))

    expect(await screen.findByTestId('recaptcha')).toBeInTheDocument()
  })
})
