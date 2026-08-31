// Fails the deploy build when a NEXT_PUBLIC_* value the site needs is missing.
// Local builds don't run this (see deploy.yml), so `npm run build` still works
// without a .env.local.
const REQUIRED = [
  'NEXT_PUBLIC_EMAILJS_SERVICE_ID',
  'NEXT_PUBLIC_EMAILJS_TEMPLATE_ID',
  'NEXT_PUBLIC_EMAILJS_PUBLIC_KEY',
  'NEXT_PUBLIC_GOATCOUNTER_SITE',
]

const missing = REQUIRED.filter((k) => !process.env[k])
if (missing.length > 0) {
  console.error(`[env] missing required build env: ${missing.join(', ')}`)
  console.error('[env] set them with `gh secret set <NAME>` — see docs/plans/01-reconnect-live-plumbing.md')
  process.exit(1)
}
console.log('[env] all required build env present')
