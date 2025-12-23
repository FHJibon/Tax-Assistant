'use client'

import React from 'react'
import { useI18n } from '@/lib/i18n-provider'
import { useAuth } from '@/lib/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/toaster'
import { Mic, Send, Square, User, Sparkles, X, Check } from 'lucide-react'
import { speechAPI, taxAPI } from '@/lib/api'
import dynamic from 'next/dynamic'

const Markdown = dynamic(() => import('@/components/Markdown'), {
  ssr: false,
})

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
  const { toast } = useToast()
  const [messages, setMessages] = React.useState<Message[]>([])
  const [inputMessage, setInputMessage] = React.useState('')
  const [isTyping, setIsTyping] = React.useState(false)
  const [isRecording, setIsRecording] = React.useState(false)
  const [isTranscribing, setIsTranscribing] = React.useState(false)
  const [voiceTranscript, setVoiceTranscript] = React.useState<string | null>(null)
  const [soundLevel, setSoundLevel] = React.useState(0)
  const [waveSamples, setWaveSamples] = React.useState<number[]>(() => Array.from({ length: 34 }).map(() => 0))
  const recorderRef = React.useRef<MediaRecorder | null>(null)
  const streamRef = React.useRef<MediaStream | null>(null)
  const chunksRef = React.useRef<BlobPart[]>([])
  const audioCtxRef = React.useRef<AudioContext | null>(null)
  const analyserRef = React.useRef<AnalyserNode | null>(null)
  const rafRef = React.useRef<number | null>(null)
  const silenceMsRef = React.useRef<number>(0)
  const lastTsRef = React.useRef<number>(0)
  const hadAnySoundRef = React.useRef<boolean>(false)
  const smoothLevelRef = React.useRef<number>(0)
  const waveSamplesRef = React.useRef<number[]>(Array.from({ length: 34 }).map(() => 0))
  const lastWaveUpdateRef = React.useRef<number>(0)
  const cancelledRef = React.useRef<boolean>(false)
  const recordedMsRef = React.useRef<number>(0)
  const recordingStartedAtRef = React.useRef<number>(0)
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null)
  const messagesContainerRef = React.useRef<HTMLDivElement | null>(null)
  const shouldStickToBottomRef = React.useRef(true)
  const initialAutoScrollPendingRef = React.useRef(true)

  const hasMessages = messages.length > 0

  const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
    const container = messagesContainerRef.current
    if (container) {
      try {
        // Use max scroll position; some browsers clamp scrollTop.
        const top = Math.max(0, container.scrollHeight - container.clientHeight)
        container.scrollTo({ top, behavior })
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

  const animateScrollToBottom = React.useCallback((initialDurationMs: number = 700) => {
    const container = messagesContainerRef.current
    if (!container) {
      scrollToBottom('smooth')
      return
    }

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const distanceFromBottom = () =>
      container.scrollHeight - (container.scrollTop + container.clientHeight)

    const runPass = (durationMs: number, maxPasses: number, passIndex: number) => {
      const startTop = container.scrollTop
      const start = performance.now()

      const step = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs)
        const targetTop = Math.max(0, container.scrollHeight - container.clientHeight)
        const delta = targetTop - startTop

        container.scrollTop = startTop + delta * easeOutCubic(t)

        if (t < 1) {
          requestAnimationFrame(step)
          return
        }

        // If content height changed during/after the animation (Markdown), do another smooth pass.
        if (distanceFromBottom() > 6 && passIndex < maxPasses) {
          runPass(360, maxPasses, passIndex + 1)
        }
      }

      requestAnimationFrame(step)
    }

    // Skip animation if already near bottom.
    if (distanceFromBottom() < 20) {
      scrollToBottom('auto')
      return
    }

    runPass(initialDurationMs, 3, 1)
  }, [])

  const scheduleInitialScrollToBottom = React.useCallback(() => {
    // Start after two frames so the initial list paints first.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => animateScrollToBottom(780))
    })
  }, [animateScrollToBottom])

  const handleMessagesScroll = React.useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return
    const distanceFromBottom = container.scrollHeight - (container.scrollTop + container.clientHeight)
    shouldStickToBottomRef.current = distanceFromBottom < 120
  }, [])

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
          // On refresh/history load, always land at the latest message.
          shouldStickToBottomRef.current = true
          initialAutoScrollPendingRef.current = true
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
      const { data } = await taxAPI.sendChatMessage(userMessage.content, 5, 30000, voiceTranscript)
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
      setVoiceTranscript(null)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return
    if (isRecording || isTranscribing) return
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

  const cleanupRecorder = React.useCallback(() => {
    try {
      recorderRef.current?.stop()
    } catch {
      // ignore
    }
    recorderRef.current = null

    if (rafRef.current) {
      try {
        cancelAnimationFrame(rafRef.current)
      } catch {
        // ignore
      }
      rafRef.current = null
    }
    analyserRef.current = null
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close()
      } catch {
        // ignore
      }
      audioCtxRef.current = null
    }
    silenceMsRef.current = 0
    lastTsRef.current = 0
    smoothLevelRef.current = 0
    setSoundLevel(0)
    waveSamplesRef.current = Array.from({ length: 34 }).map(() => 0)
    setWaveSamples(waveSamplesRef.current)
    hadAnySoundRef.current = false
    recordedMsRef.current = 0
    recordingStartedAtRef.current = 0
    cancelledRef.current = false

    try {
      streamRef.current?.getTracks()?.forEach(t => t.stop())
    } catch {
      // ignore
    }
    streamRef.current = null
    chunksRef.current = []
    setIsRecording(false)
  }, [])

  React.useEffect(() => {
    return () => {
      cleanupRecorder()
    }
  }, [cleanupRecorder])

  const startRecording = async () => {
    if (isTyping || isTranscribing) return
    if (typeof window === 'undefined') return
    if (!navigator.mediaDevices?.getUserMedia) return

    setVoiceTranscript(null)
    chunksRef.current = []
    hadAnySoundRef.current = false
    recordedMsRef.current = 0
    recordingStartedAtRef.current = Date.now()
    cancelledRef.current = false

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream

    // Audio activity detection + waveform sampling (ChatGPT-style dotted line)
    try {
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext
      const audioCtx = new Ctx()
      audioCtxRef.current = audioCtx
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 1024
      analyser.smoothingTimeConstant = 0.8
      source.connect(analyser)
      analyserRef.current = analyser

      const data = new Uint8Array(analyser.frequencyBinCount)
      const threshold = 0.02 // conservative: treat low energy as silence
      const noiseFloor = 0.008
      const maxUseful = 0.06
      const dotCount = 34

      const tick = (ts: number) => {
        if (!analyserRef.current) return
        analyserRef.current.getByteTimeDomainData(data)
        let sum = 0
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128
          sum += v * v
        }
        const rms = Math.sqrt(sum / data.length)
        const active = rms > threshold

        // Normalize to 0..1 and smooth for nicer UI
        const raw = (rms - noiseFloor) / Math.max(1e-6, maxUseful - noiseFloor)
        const clamped = Math.min(1, Math.max(0, raw))
        const prev = smoothLevelRef.current
        const next = prev * 0.85 + clamped * 0.15
        smoothLevelRef.current = next
        setSoundLevel(next)

        // Remember if we detected any meaningful audio at all.
        if (active || next > 0.12) hadAnySoundRef.current = true

        const last = lastTsRef.current || ts
        const dt = Math.max(0, ts - last)
        lastTsRef.current = ts

        if (!active) {
          silenceMsRef.current += dt
        } else {
          silenceMsRef.current = 0
        }

        // Downsample time-domain waveform into dots (throttled for smoothness)
        const lastUpdate = lastWaveUpdateRef.current || ts
        if (ts - lastUpdate >= 40) {
          lastWaveUpdateRef.current = ts
          const step = Math.max(1, Math.floor(data.length / dotCount))
          const levels = new Array(dotCount)
          for (let i = 0; i < dotCount; i++) {
            const start = i * step
            const end = Math.min(data.length, start + step)
            let absAcc = 0
            let count = 0
            for (let j = start; j < end; j++) {
              const s = (data[j] - 128) / 128
              absAcc += Math.abs(s)
              count++
            }

            const absAvg = count ? absAcc / count : 0

            // Use the middle sample's sign so dots go both up and down.
            const midIdx = start + Math.max(0, Math.min(end - start - 1, Math.floor((end - start) / 2)))
            const mid = (data[midIdx] - 128) / 128
            const sign = mid === 0 ? 1 : Math.sign(mid)

            // Normalize and bias to look like ChatGPT's subtle waveform
            const normalized = Math.min(1, Math.max(0, (absAvg - 0.01) / 0.25))
            levels[i] = sign * normalized
          }

          // Smooth per-dot to avoid jitter
          const prevDots = waveSamplesRef.current
          const nextDots = levels.map((v, i) => prevDots[i] * 0.7 + v * 0.3)
          waveSamplesRef.current = nextDots
          setWaveSamples(nextDots)
        }

        rafRef.current = requestAnimationFrame(tick)
      }

      rafRef.current = requestAnimationFrame(tick)
    } catch {
      // If AudioContext fails, fall back to always showing dots
      setSoundLevel(0)
      waveSamplesRef.current = Array.from({ length: 34 }).map(() => 0)
      setWaveSamples(waveSamplesRef.current)
    }

    const preferredTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
    ]
    const mimeType = preferredTypes.find(t => (window as any).MediaRecorder?.isTypeSupported?.(t))

    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    recorderRef.current = recorder

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunksRef.current.push(e.data)
      }
    }

    recorder.onstop = async () => {
      setIsRecording(false)

      // If the user didn't speak (or recording was too short), don't call STT.
      // This prevents hallucinated transcripts like "thank you" on silence.
      const durationMs = recordingStartedAtRef.current ? Date.now() - recordingStartedAtRef.current : 0
      recordedMsRef.current = durationMs

      const shouldTranscribe = hadAnySoundRef.current && durationMs >= 500

      try {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        chunksRef.current = []

        const wasCancelled = cancelledRef.current
        cancelledRef.current = false
        if (wasCancelled) {
          return
        }

        if (!shouldTranscribe || blob.size < 1500) {
          // Silent or too short; just reset UI.
          return
        }

        setIsTranscribing(true)
        const { data } = await speechAPI.transcribe(blob, 'voice.webm', 120000)
        const text = String(data?.text || '').trim()
        if (text) {
          setVoiceTranscript(text)
          setInputMessage(text)
        }
      } catch (err: any) {
        // Show a clear popup when backend rejects the audio (e.g. non Bangla/English).
        const status = err?.response?.status
        if (status === 422) {
          const detail = err?.response?.data?.detail || 'Only Bangla or English speech is supported.'
          toast({
            title: 'Voice not supported',
            description: detail,
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'Voice processing failed',
            description: 'Could not process your voice input. Please try again.',
            variant: 'destructive',
          })
        }
      } finally {
        setIsTranscribing(false)
        cleanupRecorder()
      }
    }

    recorder.start(250)
    setIsRecording(true)
  }

  const stopRecording = () => {
    try {
      recorderRef.current?.stop()
    } catch {
      cleanupRecorder()
    }
  }

  const cancelRecording = () => {
    cancelledRef.current = true
    chunksRef.current = []
    setVoiceTranscript(null)
    setIsTranscribing(false)
    try {
      recorderRef.current?.stop()
    } catch {
      cleanupRecorder()
    }
  }

  const confirmRecording = () => {
    if (!isRecording) return
    // Show processing immediately; onstop will run STT.
    setIsTranscribing(true)
    stopRecording()
  }

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording()
      return
    }
    await startRecording()
  }

  // Auto-scroll when new content arrives only if the user is already near the bottom.
  React.useEffect(() => {
    if (initialAutoScrollPendingRef.current) {
      scheduleInitialScrollToBottom()
      initialAutoScrollPendingRef.current = false
      return
    }
    if (shouldStickToBottomRef.current) {
      scrollToBottom('smooth')
    }
  }, [messages, isTyping, scheduleInitialScrollToBottom])

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
          onScroll={handleMessagesScroll}
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
                        <Markdown content={message.content} />
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
            {isRecording ? (
              <>
                <div className="flex items-center flex-1 h-12 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10 rounded-full px-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent animate-pulse"></div>
                  <div className="relative z-10 flex items-center w-full gap-3">
                    <div className="flex-1 flex items-center justify-center">
                      <div className="flex items-center gap-1">
                        {waveSamples.map((v, i) => {
                          const abs = Math.min(1, Math.abs(v))
                          const amp = 14 * (abs + soundLevel * 0.15)
                          const y = -v * amp
                          const size = 2.2 + abs * 1.1
                          const opacity = 0.35 + Math.min(1, abs + soundLevel * 0.2) * 0.55
                          return (
                            <span
                              key={i}
                              className="rounded-full bg-white"
                              style={{
                                width: `${size}px`,
                                height: `${size}px`,
                                opacity,
                                transform: `translateY(${y}px)`,
                                transition: 'transform 60ms linear, opacity 120ms ease',
                              }}
                            />
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pl-2">
                      <button
                        type="button"
                        onClick={cancelRecording}
                        className="h-8 w-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-colors"
                        aria-label="Cancel voice"
                        title="Cancel"
                      >
                        <X className="h-4 w-4 text-gray-200" />
                      </button>
                      <button
                        type="button"
                        onClick={confirmRecording}
                        className="h-8 w-8 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-500 border border-white/10 shadow-lg shadow-blue-600/20 transition-all"
                        aria-label="Confirm voice"
                        title="Send"
                      >
                        <Check className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : isTranscribing ? (
              <>
                <div className="flex items-center flex-1 h-12 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10 rounded-xl px-5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent animate-pulse"></div>
                  <div className="relative z-10 flex items-center justify-center w-full gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0ms', animationDuration: '700ms' }}></span>
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '200ms', animationDuration: '700ms' }}></span>
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '400ms', animationDuration: '700ms' }}></span>
                    </div>
                    <span className="text-sm font-medium text-gray-400">Processing voice...</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center flex-1 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10 rounded-xl transition-all duration-300 focus-within:border-blue-500/50 focus-within:shadow-lg focus-within:shadow-blue-500/20 hover:border-white/20 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -translate-x-full group-focus-within:translate-x-full transition-transform duration-700"></div>
                  <Input
                    value={inputMessage}
                    onChange={(e) => {
                      setInputMessage(e.target.value)
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={t('chat.placeholder')}
                    className="flex-1 bg-transparent border-none rounded-xl px-5 py-3 placeholder:text-gray-500 text-white text-[15px] font-medium focus-visible:ring-0 focus-visible:ring-offset-0 relative z-10 h-12"
                    disabled={isTyping || isTranscribing}
                  />
                </div>

                <Button
                  variant="ghost"
                  onClick={toggleRecording}
                  disabled={isTyping || isTranscribing}
                  size="icon"
                  className="h-12 w-12 p-0 rounded-xl border bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center flex-shrink-0 group/btn"
                  aria-label="Start voice input"
                  title="Start voice input"
                >
                  <Mic className="h-5 w-5 text-gray-300 group-hover/btn:text-white transition-colors" />
                </Button>

                <Button
                  variant="ghost"
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isTyping || isTranscribing}
                  size="icon"
                  className="h-12 w-12 p-0 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 hover:scale-105 transition-all duration-300 flex items-center justify-center flex-shrink-0 group/btn"
                >
                  <Send className="h-5 w-5 text-white group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-300" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}