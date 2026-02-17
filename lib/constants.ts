/**
 * Application-wide constants
 */

// Site metadata
export const SITE_NAME = 'Personal Portfolio'
export const SITE_DESCRIPTION = 'My professional portfolio and career journey'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

// Navigation links
export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Career', href: '/career' },
  { label: 'Skills', href: '/skills' },
  { label: 'Education', href: '/education' },
  { label: 'Contact', href: '/contact' }
] as const

// Social media links
export const SOCIAL_LINKS = {
  github: 'https://github.com/yourusername',
  linkedin: 'https://linkedin.com/in/yourusername',
  twitter: 'https://twitter.com/yourusername',
  email: 'you@example.com'
} as const

// Skills categories
export const SKILL_CATEGORIES = {
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  DEVOPS: 'DevOps',
  TOOLS: 'Tools & Services'
} as const

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 100

// Form validation
export const FORM_LIMITS = {
  NAME: {
    MIN: 2,
    MAX: 100
  },
  EMAIL: {
    MAX: 254 // RFC 5321
  },
  SUBJECT: {
    MIN: 5,
    MAX: 200
  },
  MESSAGE: {
    MIN: 10,
    MAX: 5000
  }
} as const

// Time formats
export const DATE_FORMAT = 'MMM d, yyyy'
export const DATE_TIME_FORMAT = 'MMM d, yyyy h:mm a'

// Animation durations (ms)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 800
} as const

// Content cache time
export const CACHE_TIME = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000 // 24 hours
} as const

// Color palette
export const COLORS = {
  PRIMARY: '#3b82f6', // blue-600
  SECONDARY: '#8b5cf6', // violet-600
  SUCCESS: '#10b981', // emerald-600
  ERROR: '#ef4444', // red-500
  WARNING: '#f59e0b', // amber-500
  MUTED: '#6b7280' // gray-500
} as const

// Typography
export const TYPOGRAPHY = {
  HEADING_1: 'text-4xl md:text-5xl font-bold',
  HEADING_2: 'text-3xl md:text-4xl font-bold',
  HEADING_3: 'text-2xl md:text-3xl font-bold',
  BODY_LARGE: 'text-lg',
  BODY_DEFAULT: 'text-base',
  BODY_SMALL: 'text-sm',
  CAPTION: 'text-xs'
} as const

// Spacing scale
export const SPACING = {
  XS: '0.25rem', // 4px
  SM: '0.5rem', // 8px
  MD: '1rem', // 16px
  LG: '1.5rem', // 24px
  XL: '2rem', // 32px
  '2XL': '3rem', // 48px
  '3XL': '4rem' // 64px
} as const

// Z-index scale
export const Z_INDEX = {
  BASE: 0,
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070
} as const

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const
