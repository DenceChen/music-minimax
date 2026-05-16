'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import ReactMarkdown from 'react-markdown'
import WavePlayer from '@/components/player/WavePlayer'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

// Helper: Remove think section from AI response
function stripThinkSection(content: string): string {
  // Match and remove <start_of_think>...</think> blocks
  return content.replace(/<start_of_think>[\s\S]*?<\/think>/gi, '')
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .trim()
}

interface Message {
  id?: string
  role: 'user' | 'assistant'
  content: string
}

interface ChatSession {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messages: Message[]
}

interface SongResult {
  taskId: string
  musicUrl: string
}

export default function ChatPage() {
  const { data: session } = useSession()
  const locale = useLocale()
  const t = useTranslations('chat')
  const tCommon = useTranslations('common')
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showLyrics, setShowLyrics] = useState(false)
  const [currentLyrics, setCurrentLyrics] = useState('')
  const [currentSong, setCurrentSong] = useState<SongResult | null>(null)
  const [songError, setSongError] = useState<string | null>(null)
  const [isDebouncing, setIsDebouncing] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; sessionId: string | null; title: string }>({
    open: false,
    sessionId: null,
    title: ''
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastSubmitRef = useRef<number>(0)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load sessions on mount
  useEffect(() => {
    if (session?.user?.id) {
      loadSessions()
    }
  }, [session?.user?.id])

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/chat/sessions')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSessions(data.data.sessions || [])
        }
      }
    } catch (error) {
      console.error('Failed to load sessions:', error)
    }
  }

  // Generate short title from first user message
  const generateTitleFromMessage = (content: string): string => {
    const cleaned = content.replace(/[^一-龥a-zA-Z0-9\s]/g, '').trim()
    const words = cleaned.split(/\s+/).slice(0, 6)
    const title = words.join(' ')
    return title.length > 20 ? title.substring(0, 20) + '...' : title || '新对话'
  }

  // Update session title in sidebar and database
  const updateSessionTitle = async (sessionId: string, title: string) => {
    try {
      await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      })
      // Update local state
      setSessions(prev => prev.map(s =>
        s.id === sessionId ? { ...s, title } : s
      ))
    } catch (error) {
      console.error('Failed to update session title:', error)
    }
  }

  const createNewSession = async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '' })
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const newSession = data.data.session
          setSessions(prev => [newSession, ...prev])
          setCurrentSessionId(newSession.id)
          setMessages([])
          setInput('')
          setShowLyrics(false)
          setCurrentSong(null)
          return newSession.id
        }
      }
      return null
    } catch (error) {
      console.error('Failed to create session:', error)
      return null
    }
  }

  const loadSession = (session: ChatSession) => {
    // Guard: ensure session exists and has messages
    if (!session?.id) return
    console.log('[Chat] Loading session:', session.id, 'messages count:', session.messages?.length || 0)
    setCurrentSessionId(session.id)
    // Defensive: ensure session.messages exists before mapping
    setMessages(session.messages?.map(m => ({ id: m.id, role: m.role as 'user' | 'assistant', content: m.content })) || [])
    setShowLyrics(false)
    setCurrentSong(null)
  }

  const deleteSession = async () => {
    if (!deleteDialog.sessionId) return
    try {
      const response = await fetch(`/api/chat/sessions/${deleteDialog.sessionId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setSessions(prev => prev.filter(s => s.id !== deleteDialog.sessionId))
        if (currentSessionId === deleteDialog.sessionId) {
          setCurrentSessionId(null)
          setMessages([])
        }
      }
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
    setDeleteDialog({ open: false, sessionId: null, title: '' })
  }

  const saveMessage = async (role: 'user' | 'assistant', content: string) => {
    if (!currentSessionId) return
    try {
      await fetch(`/api/chat/sessions/${currentSessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, content })
      })
    } catch (error) {
      console.error('Failed to save message:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const now = Date.now()
    if (now - lastSubmitRef.current < 1000) return
    lastSubmitRef.current = now
    setIsDebouncing(true)
    setTimeout(() => setIsDebouncing(false), 1000)

    if (!input.trim() || isLoading) return

    // Create session if needed
    let sessionId = currentSessionId
    if (!sessionId) {
      sessionId = await createNewSession()
      if (!sessionId) return
    }

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)
    setSongError(null)

    // Update session title after first user message
    const title = generateTitleFromMessage(userMessage)
    updateSessionTitle(sessionId, title)

    try {
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          locale, // Pass locale for language-aware AI responses
        }),
      })

      if (!chatResponse.ok) {
        const data = await chatResponse.json()
        throw new Error(data.error || 'Chat request failed')
      }

      const chatData = await chatResponse.json()
      if (!chatData.success) {
        throw new Error(chatData.error || 'Chat failed')
      }

      const assistantMessage = chatData.data?.choices?.[0]?.message?.content || tCommon('error')

      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }])
      saveMessage('user', userMessage)
      saveMessage('assistant', assistantMessage)

      if (userMessage.toLowerCase().includes('song') || userMessage.toLowerCase().includes('音乐') || userMessage.toLowerCase().includes('歌曲')) {
        const lyricsResponse = await fetch('/api/lyrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: userMessage, locale }),
        })

        if (lyricsResponse.ok) {
          const lyricsData = await lyricsResponse.json()
          if (lyricsData.success) {
            setCurrentLyrics(lyricsData.data.lyrics)
            setShowLyrics(true)
          }
        }
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: error instanceof Error ? error.message : tCommon('error') },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateSong = async () => {
    if (!currentLyrics || !session?.user?.id) return

    setIsLoading(true)
    setSongError(null)
    setCurrentSong(null)

    try {
      const response = await fetch('/api/music/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: messages[messages.length - 1]?.content || '',
          lyrics: currentLyrics,
          userId: session.user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate song')
      }

      setCurrentSong({
        taskId: data.data.taskId,
        musicUrl: data.data.musicUrl,
      })
      setShowLyrics(false)
    } catch (error) {
      setSongError(error instanceof Error ? error.message : tCommon('error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar - hidden on mobile */}
      <div
        className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden border-r flex flex-col hidden md:flex`}
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'rgba(254, 243, 226, 0.06)'
        }}
      >
        <div className="p-4 border-b" style={{ borderColor: 'rgba(254, 243, 226, 0.06)' }}>
          <button
            onClick={createNewSession}
            className="w-full generate-btn py-3 text-base"
          >
            + {t('newChat')}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="p-4 text-center" style={{ color: 'var(--text-muted)' }}>
              <p className="text-sm">{t('noSessions')}</p>
              <p className="text-xs mt-1">{t('noSessionsHint')}</p>
            </div>
          ) : (
            <div className="py-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`group relative px-4 py-3 cursor-pointer transition-colors ${
                    currentSessionId === session.id
                      ? 'bg-white/10'
                      : 'hover:bg-white/5'
                  }`}
                  onClick={() => loadSession(session)}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm truncate pr-2"
                      style={{
                        color: currentSessionId === session.id
                          ? 'var(--text-primary)'
                          : 'var(--text-secondary)'
                      }}
                    >
                      {session.title || '新对话'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteDialog({
                          open: true,
                          sessionId: session.id,
                          title: session.title || '新对话'
                        })
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-opacity"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {new Date(session.updatedAt).toLocaleDateString('zh-CN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Chat Header */}
        <div
          className="flex items-center gap-4 p-4 border-b"
          style={{
            background: 'var(--bg-secondary)',
            borderColor: 'rgba(254, 243, 226, 0.06)'
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
            {currentSessionId
              ? sessions.find(s => s.id === currentSessionId)?.title || t('newChat')
              : t('selectOrStartChat')}
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          {messages.length === 0 && !currentSessionId ? (
            <div className="welcome-premium">
              <div className="welcome-glow" />
              <div className="welcome-icon-premium" />
              <h1 className="welcome-title-premium">{tCommon('welcome')}</h1>
              <p className="welcome-subtitle-premium">{tCommon('welcomeSubtitle')}</p>
              <div className="welcome-features">
                <div className="welcome-feature">
                  <svg className="welcome-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </svg>
                  <span>{t('featureLyrics')}</span>
                </div>
                <div className="welcome-feature">
                  <svg className="welcome-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
                  </svg>
                  <span>{t('featureMusic')}</span>
                </div>
                <div className="welcome-feature">
                  <svg className="welcome-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                  <span>{t('featureCloud')}</span>
                </div>
              </div>
              {/* Quick Start Prompts - Lazy Mode */}
              <div className="quick-prompts">
                <p className="quick-prompts-title">{t('quickPromptsTitle')}</p>
                <div className="quick-prompts-grid">
                  <button
                    className="quick-prompt-btn"
                    onClick={() => {
                      setInput('生成一首关于爱情的抒情歌曲')
                      handleSubmit({ preventDefault: () => {} } as React.FormEvent)
                    }}
                    disabled={isLoading}
                  >
                    💕 {locale === 'zh' ? '爱情' : locale === 'ja' ? '恋愛' : 'Love'}
                  </button>
                  <button
                    className="quick-prompt-btn"
                    onClick={() => {
                      setInput('生成一首关于春天的歌曲')
                      handleSubmit({ preventDefault: () => {} } as React.FormEvent)
                    }}
                    disabled={isLoading}
                  >
                    🌸 {locale === 'zh' ? '春天' : locale === 'ja' ? '春' : 'Spring'}
                  </button>
                  <button
                    className="quick-prompt-btn"
                    onClick={() => {
                      setInput('生成一首关于夜晚的抒情歌曲')
                      handleSubmit({ preventDefault: () => {} } as React.FormEvent)
                    }}
                    disabled={isLoading}
                  >
                    🌙 {locale === 'zh' ? '夜晚' : locale === 'ja' ? '夜' : 'Night'}
                  </button>
                  <button
                    className="quick-prompt-btn"
                    onClick={() => {
                      setInput('生成一首轻快的夏日歌曲')
                      handleSubmit({ preventDefault: () => {} } as React.FormEvent)
                    }}
                    disabled={isLoading}
                  >
                    ☀️ {locale === 'zh' ? '夏日' : locale === 'ja' ? '夏' : 'Summer'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={message.id || index}
                  className={`message ${message.role === 'user' ? 'message-user' : 'message-assistant'}`}
                >
                  <div className="message-avatar">
                    {message.role === 'user' ? 'U' : 'AI'}
                  </div>
                  <div className="message-content">
                    <div className="message-bubble markdown-content">
                      {message.role === 'assistant' ? (
                        <ReactMarkdown>{stripThinkSection(message.content)}</ReactMarkdown>
                      ) : (
                        message.content
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="message message-assistant">
                  <div className="message-avatar">AI</div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Lyrics Display */}
        {showLyrics && currentLyrics && (
          <div
            className="border-t p-4"
            style={{
              background: 'rgba(15, 10, 21, 0.5)',
              borderColor: 'rgba(254, 243, 226, 0.06)'
            }}
          >
            <div className="max-w-3xl mx-auto">
              <div className="flex justify-between items-center mb-3">
                <h3 className="section-title">{t('generatedLyrics')}</h3>
                <button
                  onClick={() => setShowLyrics(false)}
                  className="p-1 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <pre
                className="lyrics-input font-mono text-sm whitespace-pre-wrap p-4 rounded-lg"
                style={{
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}
              >
                {currentLyrics}
              </pre>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleGenerateSong}
                  disabled={isLoading}
                  className="generate-btn"
                >
                  {isLoading ? t('generatingSong') : `🎵 ${t('generateSong')}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Current Song Player */}
        {currentSong && currentSong.musicUrl && (
          <div
            className="border-t p-4"
            style={{
              background: 'rgba(15, 10, 21, 0.5)',
              borderColor: 'rgba(254, 243, 226, 0.06)'
            }}
          >
            <div className="max-w-3xl mx-auto">
              <h3 className="player-title">{t('yourSongReady')}</h3>
              <WavePlayer url={currentSong.musicUrl} />
            </div>
          </div>
        )}

        {/* Song Generation Failed */}
        {songError && (
          <div
            className="border-t p-4"
            style={{ background: 'rgba(239, 68, 68, 0.1)' }}
          >
            <div className="max-w-3xl mx-auto">
              <p style={{ color: 'var(--error)' }}>{songError}</p>
              <button
                onClick={() => setSongError(null)}
                className="mt-2 px-4 py-2 rounded-lg transition-all hover:opacity-90"
                style={{ background: 'var(--error)', color: 'white' }}
              >
                {tCommon('retry')}
              </button>
            </div>
          </div>
        )}

        {/* Input Form */}
        <div
          className="p-4 border-t"
          style={{
            background: 'var(--bg-secondary)',
            borderColor: 'rgba(254, 243, 226, 0.06)'
          }}
        >
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="input-wrapper">
              <textarea
                className="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('placeholder')}
                disabled={isLoading}
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim() || isDebouncing}
                className="send-btn"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        title={t('deleteSession')}
        message={t('confirmDeleteSession', { title: deleteDialog.title })}
        confirmText={t('deleteSession')}
        cancelText={tCommon('cancel')}
        destructive
        onConfirm={deleteSession}
        onCancel={() => setDeleteDialog({ open: false, sessionId: null, title: '' })}
      />
    </div>
  )
}
