'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import WavePlayer from '@/components/player/WavePlayer'
import Link from 'next/link'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

// Helper: Remove think section from AI response
function stripThinkSection(content: string): string {
  return content.replace(/<start_of_think>[\s\S]*?<\/think>/gi, '')
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .trim()
}

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
  const locale = useLocale()
  const { data: session } = useSession()
  const t = useTranslations('mySongs')
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; songId: string | null; prompt: string }>({
    open: false,
    songId: null,
    prompt: ''
  })
  const [playingId, setPlayingId] = useState<string | null>(null)

  const fetchSongs = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch(`/api/songs?userId=${session.user.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSongs(data.data.songs || [])
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

  const handleDelete = async () => {
    if (!deleteDialog.songId) return

    setDeletingId(deleteDialog.songId)
    try {
      const response = await fetch(`/api/songs/${deleteDialog.songId}?userId=${session?.user?.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSongs(prev => prev.filter(s => s.id !== deleteDialog.songId))
          if (playingId === deleteDialog.songId) {
            setPlayingId(null)
          }
        }
      }
    } catch (error) {
      console.error('Error deleting song:', error)
    } finally {
      setDeletingId(null)
      setDeleteDialog({ open: false, songId: null, prompt: '' })
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
          setSongs(prev =>
            prev.map(s =>
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
        <div className="glass-card p-8 text-center">
          <div className="loading-spinner mx-auto" style={{ width: 48, height: 48 }} />
          <p className="mt-4" style={{ color: 'var(--text-muted)' }}>{t('mySongs.loadingSongs')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {t('mySongs.title')}
        </h1>
        <Link
          href={`/${locale}/chat`}
          className="generate-btn"
          style={{ width: 'auto', padding: '0.625rem 1.5rem' }}
        >
          {t('mySongs.createNew')}
        </Link>
      </div>

      {songs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl" style={{
            background: 'var(--bg-tertiary)'
          }}>
            🎵
          </div>
          <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
            {t('mySongs.noSongs')}
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            {t('mySongs.startCreating')}
          </p>
          <Link
            href={`/${locale}/chat`}
            className="inline-block mt-6 generate-btn"
            style={{ width: 'auto', padding: '0.75rem 2rem' }}
          >
            {t('mySongs.createSong')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {songs.map((song) => (
            <div
              key={song.id}
              className={`glass-card p-4 transition-all ${playingId === song.id ? 'ring-2' : ''}`}
              style={playingId === song.id ? { ringColor: 'var(--accent-primary)' } : {}}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {new Date(song.createdAt).toLocaleDateString(locale === 'zh' ? 'zh-CN' : locale === 'ja' ? 'ja-JP' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="mt-1 truncate pr-4" style={{ color: 'var(--text-primary)' }}>{song.prompt}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {song.status === 'done' && (
                    <span className="px-2 py-1 text-xs font-medium rounded" style={{
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: 'var(--success)'
                    }}>
                      {t('mySongs.ready')}
                    </span>
                  )}
                  {song.status === 'failed' && (
                    <span className="px-2 py-1 text-xs font-medium rounded" style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: 'var(--error)'
                    }}>
                      {t('mySongs.failed')}
                    </span>
                  )}
                </div>
              </div>

              {song.lyrics && (
                <details className="mb-3">
                  <summary className="text-sm cursor-pointer hover:opacity-80" style={{ color: 'var(--accent-primary)' }}>
                    {t('mySongs.viewLyrics')}
                  </summary>
                  <pre className="mt-2 text-sm p-3 rounded border whitespace-pre-wrap" style={{
                    background: 'var(--bg-input)',
                    color: 'var(--text-secondary)',
                    borderColor: 'rgba(254, 243, 226, 0.1)'
                  }}>
                    {stripThinkSection(song.lyrics)}
                  </pre>
                </details>
              )}

              {song.status === 'done' && song.musicUrl && (
                <div className="mb-3">
                  <WavePlayer
                    url={song.musicUrl}
                    onEnded={() => setPlayingId(null)}
                  />
                </div>
              )}

              {song.status === 'failed' && song.error && (
                <div className="text-sm mb-2" style={{ color: 'var(--error)' }}>
                  {t('mySongs.errorLabel')}: {song.error}
                </div>
              )}

              <div className="flex justify-end gap-2 mt-3">
                {song.status === 'failed' && (
                  <button
                    onClick={() => handleRegenerate(song.id)}
                    className="secondary-btn"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    {t('mySongs.regenerate')}
                  </button>
                )}
                <button
                  onClick={() => setDeleteDialog({
                    open: true,
                    songId: song.id,
                    prompt: song.prompt
                  })}
                  disabled={deletingId === song.id}
                  className="px-3 py-1 text-sm rounded-lg border transition-all hover:opacity-90"
                  style={{
                    borderColor: 'var(--error)',
                    color: 'var(--error)',
                    background: 'transparent'
                  }}
                >
                  {deletingId === song.id ? t('mySongs.deleting') : t('mySongs.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        title={t('mySongs.confirmDelete')}
        message={t('mySongs.confirmDeleteMessage', { prompt: deleteDialog.prompt })}
        confirmText={t('mySongs.delete')}
        cancelText={t('common.cancel')}
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, songId: null, prompt: '' })}
      />
    </div>
  )
}
