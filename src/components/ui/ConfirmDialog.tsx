'use client'

import { useEffect } from 'react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  destructive?: boolean
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false
}: ConfirmDialogProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onCancel}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className="relative glass-card p-6 w-full max-w-md mx-4 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fadeIn 0.2s ease' }}
      >
        <h2 className="font-display text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border transition-all hover:opacity-80"
            style={{
              background: 'var(--bg-tertiary)',
              borderColor: 'rgba(254, 243, 226, 0.1)',
              color: 'var(--text-secondary)'
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg font-semibold transition-all hover:opacity-90"
            style={{
              background: destructive ? 'var(--error)' : 'var(--accent-primary)',
              color: 'white'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
