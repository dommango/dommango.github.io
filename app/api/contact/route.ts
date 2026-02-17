import { NextRequest, NextResponse } from 'next/server'

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

interface ContactResponse {
  success: boolean
  message: string
  data?: ContactFormData
  errors?: Record<string, string>
}

/**
 * Validate contact form data
 */
function validateContactForm(data: unknown): {
  valid: boolean
  errors: Record<string, string>
  data?: ContactFormData
} {
  const errors: Record<string, string> = {}

  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      errors: { form: 'Invalid form data' }
    }
  }

  const form = data as Record<string, unknown>

  // Validate name
  if (!form.name || typeof form.name !== 'string' || form.name.trim().length === 0) {
    errors.name = 'Name is required'
  } else if (form.name.length > 100) {
    errors.name = 'Name must be under 100 characters'
  }

  // Validate email
  if (!form.email || typeof form.email !== 'string' || form.email.trim().length === 0) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address'
  }

  // Validate subject
  if (!form.subject || typeof form.subject !== 'string' || form.subject.trim().length === 0) {
    errors.subject = 'Subject is required'
  } else if (form.subject.length > 200) {
    errors.subject = 'Subject must be under 200 characters'
  }

  // Validate message
  if (!form.message || typeof form.message !== 'string' || form.message.trim().length === 0) {
    errors.message = 'Message is required'
  } else if (form.message.length > 5000) {
    errors.message = 'Message must be under 5000 characters'
  }

  if (Object.keys(errors).length > 0) {
    return {
      valid: false,
      errors
    }
  }

  return {
    valid: true,
    errors: {},
    data: {
      name: form.name as string,
      email: form.email as string,
      subject: form.subject as string,
      message: form.message as string
    }
  }
}

/**
 * POST /api/contact
 * Handle contact form submissions
 */
export async function POST(request: NextRequest): Promise<NextResponse<ContactResponse>> {
  // Check request method
  if (request.method !== 'POST') {
    return NextResponse.json(
      {
        success: false,
        message: 'Method not allowed'
      },
      { status: 405 }
    )
  }

  try {
    const body = await request.json()

    // Validate form data
    const validation = validateContactForm(body)

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        },
        { status: 400 }
      )
    }

    const contactData = validation.data!

    // TODO: Send email or save to database
    // Example: await sendEmail(contactData)
    // Example: await db.contactMessages.create(contactData)

    console.log('Contact form submission:', contactData)

    return NextResponse.json(
      {
        success: true,
        message: 'Message received! I\'ll get back to you soon.',
        data: contactData
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while processing your message'
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/contact
 * Handle CORS preflight
 */
export async function OPTIONS(): Promise<NextResponse> {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    }
  )
}
