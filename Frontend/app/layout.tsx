import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { I18nProvider } from '@/lib/i18n-provider'
import { AuthProvider } from '@/lib/auth-provider'
import { ToasterProvider } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tax Assistant',
  description: 'Tax filing and legal assistance of Bangladesh',
  keywords: ['tax', 'law', 'filing'],
  authors: [{ name: 'Md Ferdous Hasan' }],
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} dark bg-[#0a0a0a]`}>
        <ToasterProvider>
          <AuthProvider>
            <I18nProvider>
              <div className="bg-[#0a0a0a] font-sans antialiased">
                {children}
              </div>
            </I18nProvider>
          </AuthProvider>
        </ToasterProvider>
      </body>
    </html>
  )
}