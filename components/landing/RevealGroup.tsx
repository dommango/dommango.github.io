'use client'

// RevealGroup — a wrapper that adds `is-in` once it scrolls into view. Children
// stagger themselves in CSS via their own `--i` index. Lets server components
// (Projects) opt into the entrance without becoming client components.
import type { ReactNode } from 'react'
import { useInView } from './useInView'

export function RevealGroup({ className, children }: { className: string; children: ReactNode }) {
  const { ref, inView } = useInView<HTMLDivElement>()
  return (
    <div ref={ref} className={`${className}${inView ? ' is-in' : ''}`}>
      {children}
    </div>
  )
}
