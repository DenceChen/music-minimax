'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import LanguageSelector from '@/components/layout/LanguageSelector'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const t = useTranslations('nav')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/chat" className="text-xl font-bold text-blue-600">
                  Music MiniMax
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/chat"
                  className="border-transparent text-gray-500 hover:border-blue-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  {t('chat')}
                </Link>
                <Link
                  href="/my-songs"
                  className="border-transparent text-gray-500 hover:border-blue-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  {t('mySongs')}
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <Link
                href="/settings"
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                {t('settings')}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                {t('signOut')}
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="py-10">{children}</main>
    </div>
  )
}
