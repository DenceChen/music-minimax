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

  useEffect(() => {
    if (!containerRef.current) return

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#cbd5e1',
      progressColor: '#3b82f6',
      cursorColor: '#3b82f6',
      barWidth: 2,
      barRadius: 3,
      cursorWidth: 1,
      height: 80,
      barGap: 2,
    })

    wavesurferRef.current = wavesurfer

    wavesurfer.on('ready', () => {
      setIsLoading(false)
      setDuration(wavesurfer.getDuration())
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

    wavesurfer.load(url)

    return () => {
      wavesurfer.destroy()
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
    <div className="bg-white rounded-lg shadow p-4">
      <div ref={containerRef} className="w-full" />

      {isLoading && (
        <div className="text-center text-gray-500 text-sm mt-2">
          Loading audio...
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-600">
          {formatTime(currentTime)}
        </span>

        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center text-white"
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

        <span className="text-sm text-gray-600">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  )
}
