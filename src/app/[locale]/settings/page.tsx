'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

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
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-8">Loading...</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Model Selection */}
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700">
              Model Selection
            </label>
            <p className="mt-1 text-sm text-gray-500">Choose the AI model for chat</p>
            <select
              id="model"
              value={settings.model}
              onChange={handleModelChange}
              className="mt-2 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
            >
              {AVAILABLE_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-gray-500">
              {AVAILABLE_MODELS.find((m) => m.id === settings.model)?.description}
            </p>
          </div>

          {/* API Key Setting */}
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
              API Key
            </label>
            <p className="mt-1 text-sm text-gray-500">Enter your MiniMax API key (optional)</p>
            <input
              type="password"
              id="apiKey"
              value={settings.apiKey}
              onChange={handleApiKeyChange}
              placeholder="sk-..."
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between">
            {saved && (
              <span className="text-sm text-green-600">Saved!</span>
            )}
            {!saved && <span></span>}
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
