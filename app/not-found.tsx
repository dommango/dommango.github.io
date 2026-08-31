import type { Metadata } from 'next'
import { NotFoundClient } from '@/components/not-found/NotFoundClient'

// A server component so it can own its own metadata — without this, a
// 'use client' not-found.tsx silently inherits the homepage's <title> and
// canonical URL from app/layout.tsx.
export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
  alternates: { canonical: null },
}

export default function NotFound() {
  return <NotFoundClient />
}
