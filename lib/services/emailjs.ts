import emailjs from '@emailjs/browser'

export interface ContactMessageParams {
  fromName: string
  fromEmail: string
  message: string
}

export interface EmailResponse {
  success: boolean
  message: string
}

/**
 * Initialize EmailJS with public key
 */
export function initEmailJS(): void {
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

  if (!publicKey) {
    console.error('EmailJS public key not configured')
    return
  }

  emailjs.init(publicKey)
}

/**
 * Send a general contact message via EmailJS.
 * Uses NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID when configured, otherwise
 * falls back to NEXT_PUBLIC_EMAILJS_TEMPLATE_ID so the message still reaches
 * the inbox.
 */
export async function sendContactEmail({
  fromName,
  fromEmail,
  message
}: ContactMessageParams): Promise<EmailResponse> {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
  const templateId =
    process.env.NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID ||
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID

  if (!serviceId || !templateId) {
    return {
      success: false,
      message: 'Email service not configured'
    }
  }

  try {
    const response = await emailjs.send(
      serviceId,
      templateId,
      {
        from_name: fromName,
        from_email: fromEmail,
        to_name: fromName,
        to_email: fromEmail,
        reply_to: fromEmail,
        message
      }
    )

    if (response.status === 200) {
      return {
        success: true,
        message: 'Message sent. I read everything — talk soon.'
      }
    }

    return {
      success: false,
      message: 'Failed to send message. Please try again.'
    }
  } catch (error) {
    console.error('EmailJS error:', error)

    return {
      success: false,
      message: error instanceof Error
        ? `Email error: ${error.message}`
        : 'An unexpected error occurred'
    }
  }
}
