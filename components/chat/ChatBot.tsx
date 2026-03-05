'use client'

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react'
import { clsx } from 'clsx'
import { sendChatMessage, ChatMessage } from '@/lib/services/chat'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm Dom's AI assistant. Ask me about his career, skills, travel adventures, or this website!",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Build message history for context
      const chatHistory: ChatMessage[] = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }))
      chatHistory.push({ role: 'user', content: userMessage.content })

      const response = await sendChatMessage(chatHistory)

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.success
          ? response.message || "I'm not sure how to respond to that."
          : response.error || 'Something went wrong. Please try again.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as FormEvent)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={clsx(
          'fixed bottom-6 right-6 z-40',
          'w-14 h-14 rounded-full',
          'bg-accent-gold hover:bg-accent-gold-hover',
          'text-background font-bold text-xl',
          'shadow-lg hover:shadow-xl',
          'transition-all duration-300',
          'flex items-center justify-center',
          isOpen && 'scale-0 opacity-0'
        )}
        aria-label="Open chat assistant"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat Modal */}
      <div
        className={clsx(
          'fixed z-50 transition-all duration-300',
          'bottom-6 right-6',
          'w-[calc(100vw-3rem)] max-w-md',
          'h-[500px] max-h-[calc(100vh-6rem)]',
          'bg-surface-1 border border-border rounded-2xl shadow-2xl',
          'flex flex-col overflow-hidden',
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-gold flex items-center justify-center">
              <span className="text-background font-bold text-sm">AI</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Chat with Dom&apos;s AI</h3>
              <p className="text-xs text-text-muted">Ask me anything</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-surface-1 text-text-muted hover:text-foreground transition-colors"
            aria-label="Close chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={clsx(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={clsx(
                  'max-w-[85%] px-4 py-2.5 rounded-2xl text-sm',
                  message.role === 'user'
                    ? 'bg-accent-gold text-background rounded-br-md'
                    : 'bg-surface-2 text-foreground rounded-bl-md'
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-surface-2 px-4 py-2.5 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-surface-2">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about career, skills, travel..."
              disabled={isLoading}
              className={clsx(
                'flex-1 px-4 py-2.5 rounded-xl',
                'bg-surface-1 border border-border',
                'text-foreground placeholder-text-muted text-sm',
                'focus:outline-none focus:ring-2 focus:ring-accent-gold/50 focus:border-accent-gold',
                'disabled:opacity-50'
              )}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={clsx(
                'px-4 py-2.5 rounded-xl',
                'bg-accent-gold hover:bg-accent-gold-hover',
                'text-background font-medium text-sm',
                'transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
