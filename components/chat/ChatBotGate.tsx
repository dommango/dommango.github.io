'use client'

import dynamic from 'next/dynamic'

// Lazy so layout.tsx (a server component) never pulls ChatBot — and the
// stale offline answers baked into lib/services/chat.ts — into the shipped
// bundle at all while chat is unconfigured. The dynamic import only fires
// once this component actually renders <ChatBot/>, which `enabled` gates.
const ChatBot = dynamic(() => import('./ChatBot').then((m) => m.ChatBot), { ssr: false })

export function ChatBotGate({ enabled }: { enabled: boolean }) {
  if (!enabled) return null
  return <ChatBot />
}
