import { redirect } from 'next/navigation'
import { routing } from '@/i18n/routing'

export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/chat`)
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
