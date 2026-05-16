'use client'

import { useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'

interface WavePlayerProps {
  url: string
  onEnded?: () => void
}

export default function WavePlayer({ url, onEnded }: WavePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    if (!containerRef.current) return

    // Destroy previous instance
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy()
      wavesurferRef.current = null
    }

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'var(--waveform-bar)',
      progressColor: 'var(--accent-primary)',
      cursorColor: 'var(--accent-secondary)',
      barWidth: 2,
      barRadius: 3,
      cursorWidth: 1,
      height: 80,
      barGap: 2,
    })

    wavesurferRef.current = wavesurfer

    wavesurfer.on('ready', () => {
      if (isMountedRef.current) {
        setIsLoading(false)
        setDuration(wavesurfer.getDuration())
      }
    })

    wavesurfer.on('play', () => setIsPlaying(true))
    wavesurfer.on('pause', () => setIsPlaying(false))
    wavesurfer.on('finish', () => {
      setIsPlaying(false)
      onEnded?.()
    })

    wavesurfer.on('audioprocess', () => {
      setCurrentTime(wavesurfer.getCurrentTime())
    })

    wavesurfer.on('seeking', () => {
      setCurrentTime(wavesurfer.getCurrentTime())
    })

    // Load with error handling for abort
    try {
      wavesurfer.load(url)
    } catch (e) {
      // Ignore load errors during component unmount
      if (e instanceof Error && (e.name === 'AbortError' || e.message?.includes('aborted'))) {
        // Ignore - component is unmounting
      }
    }

    return () => {
      isMountedRef.current = false
      try {
        wavesurfer.destroy()
      } catch (e) {
        // Ignore AbortError and DOMException during cleanup
        if (e instanceof Error) {
          if (e.name === 'AbortError' || e.name === 'DOMException') {
            return
          }
          if (e.message?.includes('aborted') || e.message?.includes('abort')) {
            return
          }
        }
      }
    }
  }, [url, onEnded])

  const togglePlay = () => {
    wavesurferRef.current?.playPause()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="audio-wrapper">
      <div ref={containerRef} className="w-full" />

      {isLoading && (
        <div className="text-center py-3" style={{ color: 'var(--text-muted)' }}>
          <div className="loading-spinner" style={{ width: 40, height: 40, margin: '0 auto' }} />
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <span className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
          {formatTime(currentTime)}
        </span>

        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="player-btn play-btn"
        >
          {isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <span className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
          {formatTime(duration)}
        </span>
      </div>
    </div>
  )
}
