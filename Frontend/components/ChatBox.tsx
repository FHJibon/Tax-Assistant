'use client'

import React from 'react'
import { useI18n } from '@/lib/i18n-provider'
import { useAuth } from '@/lib/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Send, User, Sparkles } from 'lucide-react'
import { taxAPI } from '@/lib/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: Date
}

interface ChatBoxProps {
  className?: string
  externalLoading?: boolean
  externalLoadingText?: string
  reloadTrigger?: number
}

export function ChatBox({ className, externalLoading, externalLoadingText, reloadTrigger }: ChatBoxProps) {
  const { t } = useI18n()
  const { user } = useAuth()
  const [messages, setMessages] = React.useState<Message[]>([])
  const [inputMessage, setInputMessage] = React.useState('')
  const [isTyping, setIsTyping] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null)
  const messagesContainerRef = React.useRef<HTMLDivElement | null>(null)

  const hasMessages = messages.length > 0

  const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
    const container = messagesContainerRef.current
    if (container) {
      try {
        container.scrollTo({ top: container.scrollHeight, behavior })
        return
      } catch (err) {
        // ignore and fallback to anchor
      }
    }

    if (messagesEndRef.current) {
      try {
        messagesEndRef.current.scrollIntoView({ behavior, block: 'end' })
      } catch (err) {
        setTimeout(() => {
          if (container) container.scrollTop = container.scrollHeight
        }, 50)
      }
    }
  }

  // Load history on mount and when language changes; avoid tying this
  // to `isTyping` so we don't overwrite in-flight user messages.
  React.useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const { data } = await taxAPI.getHistory()
        const items = Array.isArray(data?.messages) ? data.messages : []
        if (cancelled) return
        if (items.length) {
          const mapped: Message[] = items.map((m: any, idx: number) => ({
            id: String(m.id ?? idx + 1),
            content: String(m.content ?? ''),
            sender: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
            timestamp: new Date(m.created_at || Date.now()),
          }))
          setMessages(mapped)
        }
      } catch (err) {
        // If history fails, leave messages empty and still allow new chat
      }
    }

    load()

    const handleFocus = () => {
      if (!cancelled) load()
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') handleFocus()
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelled = true
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [t, reloadTrigger])

  // When an external loading spinner is shown, ensure we scroll to bottom
  // so the summarizing bubble appears in a consistent position.
  React.useEffect(() => {
    if (externalLoading) {
      scrollToBottom('smooth')
    }
  }, [externalLoading])

  const sendChat = async (content: string) => {
    const trimmed = content.trim()
    if (!trimmed) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: trimmed,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    try {
      const { data } = await taxAPI.sendChatMessage(userMessage.content, 5)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data?.answer ?? 'No answer returned.',
        sender: 'assistant',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (err: any) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Failed to get response from assistant.',
        sender: 'assistant',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return
    const current = inputMessage
    setInputMessage('')
    await sendChat(current)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Auto-scroll to the bottom when messages update or typing state changes
  React.useEffect(() => {
    scrollToBottom('smooth')
  }, [messages, isTyping])

  const displayName = React.useMemo(() => {
    if (user?.name && user.name.trim().length > 0) return user.name.trim()
    if (user?.email) return user.email.split('@')[0]
    return ''
  }, [user])

  return (
    <Card className={`flex flex-col ${className || ''}`}>
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          className={`flex-1 p-4 md:p-6 space-y-6 min-h-0 overflow-y-auto scrollbar-hide ${
            !hasMessages && !isTyping && !externalLoading
              ? 'flex items-center justify-center'
              : ''
          }`}
        >
          {/* Greeting only when there are no messages and no loading */}
          {!hasMessages && !isTyping && !externalLoading && (
            <div className="text-center max-w-xl animate-fade-in-scale">
              <div className="inline-flex items-center justify-center mb-4 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg shadow-blue-600/30">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl md:text-2xl font-semibold mb-2">
                {displayName ? `Hello, ${displayName}.` : 'Hello.'}
              </h2>
              <p className="text-sm md:text-base text-gray-400">
                How can I help you with your tax questions today?
              </p>
            </div>
          )}
          {/* Existing messages */}
          {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                } animate-fade-in-up`}
              >
                <div
                  className={`flex items-start gap-3 max-w-[85%] md:max-w-[75%] ${
                    message.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  {/* Avatar with gradient and glow */}
                  <div
                    className={`
                      flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                      shadow-lg transition-all duration-300 hover:scale-110
                      ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-blue-500/30'
                          : 'bg-gradient-to-br from-gray-700 to-gray-800 shadow-gray-700/30'
                      }
                    `}
                  >
                    {message.sender === 'user' ? (
                      <User className="h-5 w-5 text-white relative z-10" />
                    ) : (
                      <Sparkles className="h-5 w-5 text-blue-400 relative z-10 animate-pulse" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div
                      className={`
                        relative rounded-2xl px-5 py-3.5 break-words whitespace-pre-wrap
                        ${
                          message.sender === 'user'
                            ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30'
                            : 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 text-gray-100 border border-white/5 shadow-lg hover:border-white/10'
                        }
                        transition-all duration-300 hover:scale-[1.02]
                      `}
                    >
                      {/* Message Content */}
                      {message.sender === 'assistant' ? (
                        <div className="prose prose-sm dark:prose-invert prose-p:mb-1 prose-ul:mt-1 prose-ul:mb-1 prose-li:my-0 max-w-none text-[15px] leading-relaxed relative z-10 font-medium tracking-wide">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-[15px] leading-relaxed relative z-10 font-medium tracking-wide">
                          {message.content}
                        </p>
                      )}
                    </div>

                    {/* Timestamp */}
                    <p
                      className={`text-[11px] font-medium tracking-wide px-2 ${
                        message.sender === 'user'
                          ? 'text-right text-gray-400'
                          : 'text-left text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
          ))}

          {/* Summarizing bubble behaves like a typing indicator: it appears
              *after* the latest message, at the bottom of the chat. */}
          {externalLoading && (
            <div className="flex justify-start animate-fade-in-up mt-1">
              <div className="flex items-start gap-3 max-w-[85%] md:max-w-[75%]">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shadow-lg shadow-gray-700/30">
                  <Sparkles className="h-5 w-5 text-blue-400 relative z-10 animate-pulse" />
                </div>
                <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-white/5 rounded-2xl px-5 py-3.5 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <p className="text-sm text-gray-400 font-medium">
                      {externalLoadingText || 'Summarizing uploaded document...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isTyping && (
            <div className="flex justify-start animate-fade-in-up">
              <div className="flex items-start gap-3 max-w-[85%] md:max-w-[75%]">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shadow-lg shadow-gray-700/30">
                  <Sparkles className="h-5 w-5 text-blue-400 relative z-10 animate-pulse" />
                </div>
                <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-white/5 rounded-2xl px-5 py-3.5 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <p className="text-sm text-gray-400 font-medium">Thinking...</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-white/5 p-4 md:p-5 bg-gradient-to-t from-gray-900/50 to-transparent backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center flex-1 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10 rounded-xl transition-all duration-300 focus-within:border-blue-500/50 focus-within:shadow-lg focus-within:shadow-blue-500/20 hover:border-white/20 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -translate-x-full group-focus-within:translate-x-full transition-transform duration-700"></div>
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chat.placeholder')}
                className="flex-1 bg-transparent border-none rounded-xl px-5 py-3 placeholder:text-gray-500 text-white text-[15px] font-medium focus-visible:ring-0 focus-visible:ring-offset-0 relative z-10 h-12"
                disabled={isTyping}
              />
            </div>
            <Button
              variant="ghost"
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isTyping}
              size="icon"
              className="h-12 w-12 p-0 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 hover:scale-105 transition-all duration-300 flex items-center justify-center flex-shrink-0 group/btn"
            >
              <Send className="h-5 w-5 text-white group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-300" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}