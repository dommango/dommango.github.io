/**
 * AI Chat Service
 * Handles communication with the AI chat API
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatResponse {
  success: boolean
  message?: string
  error?: string
}

// Context about Dom that the AI should know
export const DOM_CONTEXT = `You are Dom Mangonon's personal AI assistant on his portfolio website. You help visitors learn about Dom's background, experience, and interests.

## About Dom
- Full name: Dominic "Dom" Mangonon
- Current role: Senior Vice President at Citi (Finance/Technology)
- Location: Based in the United States
- Website: dommango.github.io

## Career Highlights
- Strong background in financial technology and enterprise software
- Experience with data analytics, process automation, and digital transformation
- Has worked across multiple industries with focus on finance sector
- Leadership experience managing teams and cross-functional projects

## Technical Skills
- Languages: TypeScript, JavaScript, Python, SQL
- Frontend: React, Next.js, Tailwind CSS
- Backend: Node.js, APIs, databases
- Tools: Git, cloud platforms, data visualization

## Travel & Personal Interests
- Avid traveler who has visited 52 countries across 5 continents
- Notable regions: Extensive travel in Asia, Europe, and the Americas
- Interested in exploring different cultures and cuisines
- Travel philosophy: believes in immersive experiences over tourist attractions

## Career Goals
- Continuing to grow in technology leadership roles
- Building innovative solutions at the intersection of finance and technology
- Mentoring the next generation of tech professionals
- Contributing to open source and the developer community

## Website Tech Stack
- Built with Next.js 16 and React 19
- TypeScript with strict mode
- Tailwind CSS 4 for styling
- Static site export deployed to GitHub Pages
- Content managed via Markdown with gray-matter

## Response Guidelines
- Be friendly, professional, and helpful
- Keep responses concise (2-3 sentences for simple questions)
- If asked about specific details you don't know, suggest checking the relevant page on the website
- Never make up specific numbers, dates, or facts - say "I'd recommend checking with Dom directly" for specifics
- You can encourage visitors to use the contact form to reach out
`

/**
 * Send a message to the AI chat API
 */
export async function sendChatMessage(
  messages: ChatMessage[]
): Promise<ChatResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL

  // If no API configured, return a helpful message
  if (!apiUrl) {
    return {
      success: true,
      message: getOfflineResponse(messages[messages.length - 1]?.content || '')
    }
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: DOM_CONTEXT },
          ...messages
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      message: data.message || data.content || data.choices?.[0]?.message?.content
    }
  } catch (error) {
    console.error('Chat API error:', error)
    return {
      success: false,
      error: 'Sorry, I encountered an error. Please try again.'
    }
  }
}

/**
 * Provide offline responses when API is not configured
 */
function getOfflineResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase()

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hi there! I'm Dom's AI assistant. I can tell you about his career, skills, travel experiences, and this website. What would you like to know?"
  }

  if (lowerMessage.includes('career') || lowerMessage.includes('work') || lowerMessage.includes('job')) {
    return "Dom is a Senior Vice President at Citi, working at the intersection of finance and technology. He has experience in data analytics, process automation, and digital transformation. Check out the Career page for more details!"
  }

  if (lowerMessage.includes('skill') || lowerMessage.includes('tech') || lowerMessage.includes('programming')) {
    return "Dom works with TypeScript, React, Next.js, Python, and SQL among other technologies. He's experienced in both frontend and backend development. Visit the Skills page to see the full list!"
  }

  if (lowerMessage.includes('travel') || lowerMessage.includes('countr') || lowerMessage.includes('visit')) {
    return "Dom has traveled to 52 countries across 5 continents! He's explored extensively in Asia, Europe, and the Americas. Check out the Travel page to see the interactive map of his adventures."
  }

  if (lowerMessage.includes('contact') || lowerMessage.includes('resume') || lowerMessage.includes('hire') || lowerMessage.includes('email')) {
    return "You can request Dom's resume through the Contact page - just enter your name and email, and it'll be sent right to you. You can also reach out via the contact form there."
  }

  if (lowerMessage.includes('website') || lowerMessage.includes('built') || lowerMessage.includes('stack')) {
    return "This portfolio is built with Next.js 16, React 19, TypeScript, and Tailwind CSS. It's statically exported and deployed to GitHub Pages. Dom built it himself to showcase his work and travels."
  }

  if (lowerMessage.includes('education') || lowerMessage.includes('degree') || lowerMessage.includes('school')) {
    return "You can find details about Dom's educational background on the Education page. It covers his academic journey and certifications."
  }

  return "I can help you learn about Dom's career, technical skills, travel adventures, or this website. Feel free to ask me anything, or explore the navigation above to dive into specific topics!"
}
