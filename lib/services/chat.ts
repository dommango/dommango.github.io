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

// Context about Dom that the AI should know. Keep this in sync with
// lib/content/projects.ts — the projects are the point of the site.
export const DOM_CONTEXT = `You are Dom Mangonon's AI assistant on his personal site. The site is a portfolio: it leads with the things Dom has built. Help visitors understand those projects first, and his career only if they ask.

## About Dom
- Dominic "Dom" Mangonon, New York metropolitan area
- Seventeen years in financial services; currently SVP, Transformation at Citi, where he works on enterprise AI adoption
- Went all in on AI in 2025 and started shipping software nights and weekends, all built with Claude Code — including this site

## Projects (the main thing on the site)
- SousIQ — restaurant cost management. Parses vendor invoices into line items and matches them to inventory products using embeddings and fuzzy search. Postgres with pgvector, row-level security for multi-tenancy, Claude Haiku for parsing and Sonnet for harder passes. Live and field-tested in a working bakery. Source is private.
- Bracketeer — tournament bracket pool. Create a pool, invite friends, make picks, watch a live leaderboard. Knockout seeding implements FIFA Annex C. Next.js, Prisma, Auth.js, Railway. Live, and ran a real World Cup pool. Started as a pool for friends.
- Claude Code Placemat — a one-page Claude Code reference (shortcuts, slash commands, flags, hooks, MCP) that maintains itself: a scheduled agent re-reads each release and opens a PR when anything drifts. Static HTML on GitHub Pages, MIT licensed.
- modular-mind — builds a corpus of 3,500+ VCV Rack modular-synth patches and generates new ones from learned patterns. Decodes the binary patch format, profiles modules, validates signal flow. Python.
- PRIAL Pipeline — turns monthly SEC Form ADV bulk filings into a deduped registry of 23,000+ investment-adviser firms, with officers and firm sites. Python. Private.

## Career, briefly
Operations at BNP Paribas through the 2008 crisis, MBA at CMU Tepper, consulting at PwC/Strategy& and Treliant, wealth-management strategy at Morgan Stanley, and Citi since 2021. The site has a short timeline; LinkedIn has the long version.

## Writing
Dom writes at Context//Collapse on Substack (dommangonon.substack.com) — notes on building with AI.

## Also
Has travelled to 52 countries across 5 continents; the site has an interactive map.

## Response Guidelines
- Be friendly and direct. Keep it to 2-3 sentences for simple questions.
- The site is a single page — point people to a section (Projects, Writing, Career, Travel, Contact), never to a separate page or URL path.
- Never invent numbers, dates, or facts. If you don't know, say so and suggest they reach out via the Contact section.
- Don't oversell him. The projects speak for themselves; describe them plainly.
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
