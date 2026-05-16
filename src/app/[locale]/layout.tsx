'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import LanguageSelector from '@/components/layout/LanguageSelector'

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = useLocale()
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const router = useRouter()
  const t = useTranslations('nav')

  // Skip auth check for login/register pages
  const isAuthPage = pathname?.includes('/login') || pathname?.includes('/register')

  useEffect(() => {
    if (status === 'unauthenticated' && !isAuthPage) {
      router.push(`/${locale}/login`)
    }
  }, [status, router, locale, isAuthPage])

  // Show loading only for non-auth pages
  if (status === 'loading' || !session) {
    if (isAuthPage) {
      return <>{children}</>
    }
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="loading-spinner" />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Navigation */}
      <nav className="nav-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo & Nav Links */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href={`/${locale}/chat`} className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center relative" style={{
                    background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
                    boxShadow: 'var(--shadow-glow)'
                  }}>
                    {/* Art Deco diamond center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 rotate-45" style={{ background: 'var(--bg-primary)' }} />
                    </div>
                    {/* Music note indicator */}
                    <svg className="w-5 h-5 relative z-10" style={{ fill: 'var(--bg-primary)' }} viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                  </div>
                  <span className="font-display text-xl font-bold" style={{
                    background: 'linear-gradient(135deg, var(--text-primary), var(--accent-primary))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    Music MiniMax
                  </span>
                </Link>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-2">
                <Link
                  href={`/${locale}/chat`}
                  className={`nav-link ${pathname?.includes('/chat') ? 'active' : ''}`}
                >
                  {t('chat')}
                </Link>
                <Link
                  href={`/${locale}/my-songs`}
                  className={`nav-link ${pathname?.includes('/my-songs') ? 'active' : ''}`}
                >
                  {t('mySongs')}
                </Link>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              <LanguageSelector />
              <Link
                href={`/${locale}/settings`}
                className="nav-link text-sm"
              >
                {t('settings')}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
                className="relative inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={{
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid rgba(254, 243, 226, 0.1)'
                }}
              >
                {t('signOut')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-8 relative" style={{ zIndex: 1 }}>
        {children}
      </main>
    </div>
  )
}
