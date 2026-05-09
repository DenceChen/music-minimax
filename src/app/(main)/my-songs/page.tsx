'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import WavePlayer from '@/components/player/WavePlayer'
import Link from 'next/link'

interface Song {
  id: string
  status: string
  prompt: string
  lyrics?: string
  musicUrl?: string
  error?: string
  createdAt: string
}

export default function MySongsPage() {
  const { data: session } = useSession()
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchSongs = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch(`/api/songs?userId=${session.user.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSongs(data.data.songs)
        }
      }
    } catch (error) {
      console.error('Error fetching songs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSongs()
  }, [session?.user?.id])

  const handleDelete = async (songId: string) => {
    if (!session?.user?.id || deletingId) return

    setDeletingId(songId)
    try {
      const response = await fetch(`/api/songs/${songId}?userId=${session.user.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSongs((prev) => prev.filter((s) => s.id !== songId))
        }
      }
    } catch (error) {
      console.error('Error deleting song:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleRegenerate = async (songId: string) => {
    if (!session?.user?.id) return

    try {
      const response = await fetch(`/api/songs/${songId}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Update the song in the list with new musicUrl
          setSongs((prev) =>
            prev.map((s) =>
              s.id === songId
                ? { ...s, status: 'done', musicUrl: data.data.musicUrl, error: undefined }
                : s
            )
          )
        }
      }
    } catch (error) {
      console.error('Error regenerating song:', error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-2 text-gray-600">Loading songs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Songs</h1>
        <Link
          href="/chat"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create New Song
        </Link>
      </div>

      {songs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <p className="mt-4 text-gray-600">No songs yet</p>
          <p className="text-sm text-gray-500 mt-1">Start by creating your first song in the Chat page.</p>
          <Link
            href="/chat"
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Song
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {songs.map((song) => (
            <div key={song.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm text-gray-500">
                    {new Date(song.createdAt).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-gray-700 mt-1 line-clamp-2">{song.prompt}</p>
                </div>

                <div className="flex items-center space-x-2">
                  {song.status === 'done' && (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                      Ready
                    </span>
                  )}
                  {song.status === 'failed' && (
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                      Failed
                    </span>
                  )}
                </div>
              </div>

              {song.lyrics && (
                <details className="mb-3">
                  <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">
                    View Lyrics
                  </summary>
                  <pre className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded border whitespace-pre-wrap">
                    {song.lyrics}
                  </pre>
                </details>
              )}

              {song.status === 'done' && song.musicUrl && (
                <WavePlayer url={song.musicUrl} />
              )}

              {song.status === 'failed' && (
                <div className="text-red-600 text-sm mb-2">
                  Error: {song.error || 'Failed to generate'}
                </div>
              )}

              <div className="flex justify-end space-x-2 mt-3">
                {song.status === 'failed' && (
                  <button
                    onClick={() => handleRegenerate(song.id)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Retry
                  </button>
                )}
                <button
                  onClick={() => handleDelete(song.id)}
                  disabled={deletingId === song.id}
                  className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 disabled:opacity-50"
                >
                  {deletingId === song.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
