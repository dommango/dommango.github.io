'use client'

import Link from 'next/link'
import { useState } from 'react'
import { clsx } from 'clsx'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Career', href: '/career' },
  { name: 'Skills', href: '/skills' },
  { name: 'Education', href: '/education' },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <nav className="container mx-auto flex items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo/Home Link */}
        <Link
          href="/"
          className="text-xl font-bold text-accent-gold hover:text-accent-gold-hover"
        >
          DM
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-10">
          {navigation.map(item => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-text-secondary hover:text-foreground relative group"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-gold group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-text-secondary hover:text-foreground hover:bg-surface-2"
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>
      </nav>

      {/* Mobile Navigation */}
      <div
        className={clsx(
          'md:hidden border-t border-border bg-surface-1 overflow-hidden transition-all duration-300',
          isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="container mx-auto space-y-1 px-6 py-4">
          {navigation.map(item => (
            <Link
              key={item.name}
              href={item.href}
              className="block rounded-lg px-4 py-3 text-base font-medium text-text-secondary hover:text-foreground hover:bg-surface-2"
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}
