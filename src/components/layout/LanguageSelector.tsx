'use client'

import { useLocale } from 'next-intl'

export default function LanguageSelector() {
  const locale = useLocale()

  const languages = [
    { code: 'zh', label: '中文' },
    { code: 'en', label: 'EN' },
    { code: 'ja', label: 'JA' },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value
    // Direct window location navigation to avoid any routing confusion
    const currentPath = window.location.pathname
    // Strip the current locale from path
    const pathWithoutLocale = currentPath.replace(/^\/(zh|en|ja)/, '')
    // Navigate directly
    window.location.href = `/${newLocale}${pathWithoutLocale}`
  }

  return (
    <select
      value={locale}
      onChange={handleChange}
      className="lang-select"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code} style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
          {lang.label}
        </option>
      ))}
    </select>
  )
}
