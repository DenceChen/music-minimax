'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

const AVAILABLE_MODELS = [
  { id: 'MiniMax-M2.7-highspeed', name: 'MiniMax-M2.7-highspeed', description: 'High-speed model for quick responses' },
  { id: 'MiniMax-M2.7-standard', name: 'MiniMax-M2.7-standard', description: 'Standard model for balanced performance' },
  { id: 'MiniMax-M2.7-long', name: 'MiniMax-M2.7-long', description: 'Long context model for complex tasks' },
]

interface Settings {
  model: string
  apiKey: string
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const t = useTranslations('settings')

  const [settings, setSettings] = useState<Settings>({
    model: 'MiniMax-M2.7-highspeed',
    apiKey: '',
  })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    const savedSettings = localStorage.getItem('music-minimax-settings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
    setLoading(false)
  }, [status, router])

  const handleSave = () => {
    localStorage.setItem('music-minimax-settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings((prev) => ({ ...prev, model: e.target.value }))
  }

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev) => ({ ...prev, apiKey: e.target.value }))
  }

  if (loading || status === 'loading') {
    return (
      <div className="max-w-2xl mx-auto px-4">
        <div className="glass-card p-8 text-center">
          <div className="loading-spinner mx-auto" style={{ width: 48, height: 48 }} />
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="glass-card">
        <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(254, 243, 226, 0.08)' }}>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {t('title')}
          </h1>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Model Selection */}
          <div>
            <label htmlFor="model" className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {t('modelSelection')}
            </label>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              {t('modelSelectionDesc')}
            </p>
            <select
              id="model"
              value={settings.model}
              onChange={handleModelChange}
              className="mt-2 block w-full px-3 py-2 rounded-lg border text-base"
              style={{
                background: 'var(--bg-input)',
                borderColor: 'rgba(254, 243, 226, 0.1)',
                color: 'var(--text-primary)'
              }}
            >
              {AVAILABLE_MODELS.map((model) => (
                <option key={model.id} value={model.id} style={{ background: 'var(--bg-tertiary)' }}>
                  {model.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {AVAILABLE_MODELS.find((m) => m.id === settings.model)?.description}
            </p>
          </div>

          {/* API Key Setting */}
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {t('apiKeySetting')}
            </label>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              {t('apiKeySettingDesc')}
            </p>
            <input
              type="password"
              id="apiKey"
              value={settings.apiKey}
              onChange={handleApiKeyChange}
              placeholder={t('apiKeyPlaceholder')}
              className="mt-2 block w-full px-3 py-2 rounded-lg border text-base"
              style={{
                background: 'var(--bg-input)',
                borderColor: 'rgba(254, 243, 226, 0.1)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between">
            {saved && (
              <span className="text-sm" style={{ color: 'var(--success)' }}>
                {t('saved')}
              </span>
            )}
            {!saved && <span></span>}
            <button
              onClick={handleSave}
              className="generate-btn"
              style={{ width: 'auto', padding: '0.75rem 2rem' }}
            >
              {t('save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
