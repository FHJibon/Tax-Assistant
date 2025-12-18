import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { I18nProvider } from '@/lib/i18n-provider'
import { AuthProvider } from '@/lib/auth-provider'
import { Toaster } from '@/components/ui/toaster'
import ConditionalFooter from '@/components/ConditionalFooter'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Tax & Law Assistant | বাংলাদেশের কর ও আইন সহায়ক',
  description: 'AI-powered tax filing and legal assistance for Bangladesh',
  keywords: ['tax', 'legal', 'AI', 'Bangladesh', 'filing', 'কর', 'আইন'],
  authors: [{ name: 'AI Tax Assistant Team' }],
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
        <AuthProvider>
          <I18nProvider>
            <div className="bg-[#0a0a0a] font-sans antialiased">
              {children}
            </div>
            <Toaster />
            <ConditionalFooter />
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  )
}