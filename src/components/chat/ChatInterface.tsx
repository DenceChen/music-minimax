'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import WavePlayer from '@/components/player/WavePlayer'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface SongResult {
  taskId: string
  musicUrl: string
}

export default function ChatPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showLyrics, setShowLyrics] = useState(false)
  const [currentLyrics, setCurrentLyrics] = useState('')
  const [currentSong, setCurrentSong] = useState<SongResult | null>(null)
  const [songError, setSongError] = useState<string | null>(null)
  const [isDebouncing, setIsDebouncing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastSubmitRef = useRef<number>(0)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Debounce: 1 second cooldown
    const now = Date.now()
    if (now - lastSubmitRef.current < 1000) return
    lastSubmitRef.current = now
    setIsDebouncing(true)
    setTimeout(() => setIsDebouncing(false), 1000)

    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)
    setSongError(null)

    try {
      // Call chat API
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
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

      const assistantMessage = chatData.data?.choices?.[0]?.message?.content || 'Sorry, I could not understand that.'

      setMessages((prev) => [...prev, { role: 'assistant', content: assistantMessage }])

      // If user wants to generate a song, automatically generate lyrics
      if (userMessage.toLowerCase().includes('song') || userMessage.toLowerCase().includes('音乐')) {
        const lyricsResponse = await fetch('/api/lyrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: userMessage }),
        })

        if (lyricsResponse.ok) {
          const lyricsData = await lyricsResponse.json()
          if (lyricsData.success) {
            setCurrentLyrics(lyricsData.data.lyrics)
            setShowLyrics(true)
            setMessages((prev) => [
              ...prev,
              { role: 'assistant', content: 'I\'ve generated some lyrics for you. Click "Generate Song" to create the music!' },
            ])
          }
        }
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: error instanceof Error ? error.message : 'Sorry, an error occurred. Please try again.' },
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
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Your song is ready! Scroll down to play it!' },
      ])
    } catch (error) {
      setSongError(error instanceof Error ? error.message : 'Failed to generate song. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p className="text-lg">Welcome to Music MiniMax!</p>
              <p className="text-sm mt-2">Tell me what kind of song you want to create.</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}}`}
            >
              <div
                className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Lyrics Display */}
        {showLyrics && currentLyrics && (
          <div className="border-t p-4 bg-blue-50">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">Generated Lyrics:</h3>
              <button
                onClick={() => setShowLyrics(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <pre className="text-sm text-gray-600 whitespace-pre-wrap bg-white p-3 rounded border max-h-40 overflow-y-auto">
              {currentLyrics}
            </pre>
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleGenerateSong}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Generating...' : 'Generate Song'}
              </button>
            </div>
          </div>
        )}

        {/* Current Song Player */}
        {currentSong && currentSong.musicUrl && (
          <div className="border-t p-4 bg-green-50">
            <h3 className="font-semibold text-gray-700 mb-3">Your Song is Ready!</h3>
            <WavePlayer url={currentSong.musicUrl} />
          </div>
        )}

        {/* Song Generation Failed */}
        {songError && (
          <div className="border-t p-4 bg-red-50">
            <p className="text-red-600">{songError}</p>
            <button
              onClick={() => setSongError(null)}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Input Form */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell me what kind of song you want to create..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim() || isDebouncing}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDebouncing ? 'Please wait...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
