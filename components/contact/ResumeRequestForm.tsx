'use client'

import { useState, FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { sendResumeEmail, initEmailJS } from '@/lib/services/emailjs'
import { FORM_LIMITS } from '@/lib/constants'

interface FormData {
  name: string
  email: string
}

interface FormErrors {
  name?: string
  email?: string
}

// Initialize EmailJS on component mount
if (typeof window !== 'undefined') {
  initEmailJS()
}

export function ResumeRequestForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  /**
   * Validate form inputs
   */
  function validateForm(): boolean {
    const newErrors: FormErrors = {}

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.length < FORM_LIMITS.NAME.MIN) {
      newErrors.name = `Name must be at least ${FORM_LIMITS.NAME.MIN} characters`
    } else if (formData.name.length > FORM_LIMITS.NAME.MAX) {
      newErrors.name = `Name must be under ${FORM_LIMITS.NAME.MAX} characters`
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    } else if (formData.email.length > FORM_LIMITS.EMAIL.MAX) {
      newErrors.email = `Email must be under ${FORM_LIMITS.EMAIL.MAX} characters`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Handle form submission
   */
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Reset status
    setSubmitStatus('idle')
    setSubmitMessage('')

    // Validate
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await sendResumeEmail({
        toName: formData.name,
        toEmail: formData.email
      })

      if (response.success) {
        setSubmitStatus('success')
        setSubmitMessage(response.message)
        // Reset form
        setFormData({ name: '', email: '' })
      } else {
        setSubmitStatus('error')
        setSubmitMessage(response.message)
      }
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Handle input changes
   */
  function handleChange(field: keyof FormData, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={isSubmitting}
              className={`
                w-full px-4 py-2.5 rounded-md
                bg-surface-2 border
                text-foreground placeholder-text-muted
                focus:outline-none focus:ring-2 focus:ring-accent-gold/50 focus:border-accent-gold
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
                ${errors.name ? 'border-red-500' : 'border-border'}
              `}
              placeholder="Your full name"
              aria-invalid={errors.name ? 'true' : 'false'}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p id="name-error" className="mt-1.5 text-sm text-red-500">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              disabled={isSubmitting}
              className={`
                w-full px-4 py-2.5 rounded-md
                bg-surface-2 border
                text-foreground placeholder-text-muted
                focus:outline-none focus:ring-2 focus:ring-accent-gold/50 focus:border-accent-gold
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
                ${errors.email ? 'border-red-500' : 'border-border'}
              `}
              placeholder="your.email@example.com"
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="mt-1.5 text-sm text-red-500">
                {errors.email}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Sending Resume...' : 'Send My Resume'}
          </Button>

          {/* Success/Error Messages */}
          {submitStatus === 'success' && (
            <div
              className="p-4 rounded-md bg-green-900/20 border border-green-700 text-green-400"
              role="alert"
            >
              {submitMessage}
            </div>
          )}

          {submitStatus === 'error' && (
            <div
              className="p-4 rounded-md bg-red-900/20 border border-red-700 text-red-400"
              role="alert"
            >
              {submitMessage}
            </div>
          )}
        </form>
      </CardBody>
    </Card>
  )
}
