'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n-provider'
import { useAuth } from '@/lib/auth-provider'
import { Button } from '@/components/ui/button'
import { 
  Menu, 
  X, 
  Globe,
  Home,
  Briefcase,
  BarChart3,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react'

export function Navbar() {
  const { language, setLanguage, t } = useI18n()
  const { isAuthenticated, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [showProfileMenu, setShowProfileMenu] = React.useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const navigation = [
    { name: t('nav.home'), href: '/', icon: Home, public: true },
    { name: t('nav.workspace'), href: '/workspace', icon: Briefcase, public: false },
    { name: t('nav.dashboard'), href: '/dashboard', icon: BarChart3, public: false },
  ].filter(item => item.public || isAuthenticated)

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                <Image src="/logo.svg" alt="Logo" width={40} height={40} className="h-10 w-10 relative z-10 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="text-lg font-bold text-white hidden md:block">Tax Assistant</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group relative overflow-hidden
                    ${isActive 
                      ? 'text-white bg-white/10' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <Icon className="h-4 w-4 mr-2 relative z-10" />
                  <span className="relative z-10">{item.name}</span>
                </Link>
              )
            })}
          </div>
          
          <div className="hidden md:flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="relative h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 group"
              aria-label="Toggle language"
            >
              <Globe className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
              <span className="absolute -top-1 -right-1 bg-gradient-to-br from-blue-600 to-blue-800 text-white text-[10px] font-bold rounded-md px-1.5 py-0.5 shadow-lg">
                {language === 'en' ? 'EN' : 'বা'}
              </span>
            </Button>

            {isAuthenticated ? (
              <div className="relative">
                <Button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-all duration-300 rounded-lg px-4 py-2 h-9"
                >
                  <User className="h-4 w-4" />
                </Button>
                
                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg bg-black/90 backdrop-blur-xl border border-white/10 shadow-xl z-50 overflow-hidden">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false)
                        router.push('/profile')
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all duration-300 text-left"
                    >
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">Profile</span>
                    </button>
                    <div className="h-px bg-white/10" />
                    <button
                      onClick={() => {
                        setShowProfileMenu(false)
                        logout()
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all duration-300 text-left text-red-400"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm font-medium">Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-all duration-300 rounded-lg px-4 py-2 h-9 text-sm font-medium">
                    {t('nav.login')}
                  </Button>
                </Link>
                
                <Link href="/signup">
                  <Button className="bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-500 text-white border-0 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 hover:scale-105 transition-all duration-300 rounded-lg px-4 py-2 h-9 text-sm font-medium">
                    {t('nav.signup')}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-white" />
              ) : (
                <Menu className="h-5 w-5 text-white" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 group relative overflow-hidden
                    ${isActive 
                      ? 'text-white bg-white/10' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <Icon className="h-5 w-5 mr-3 relative z-10" />
                  <span className="relative z-10">{item.name}</span>
                </Link>
              )
            })}
          </div>

          <div className="px-4 py-4 border-t border-white/5">
            <div className="flex items-center space-x-2 mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white rounded-lg h-9"
              >
                <Globe className="h-4 w-4 mr-2" />
                <span className="text-sm">{language === 'en' ? 'English' : 'বাংলা'}</span>
              </Button>
            </div>

            <div className="space-y-2">
              {isAuthenticated ? (
                <>
                  <Link href="/profile" className="block w-full">
                    <Button 
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white rounded-lg h-10"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Profile</span>
                    </Button>
                  </Link>
                  <Button 
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-red-400 hover:text-red-300 rounded-lg h-10"
                    onClick={() => {
                      logout()
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block w-full">
                    <Button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white rounded-lg h-10 text-sm font-medium">
                      {t('nav.login')}
                    </Button>
                  </Link>
                  <Link href="/signup" className="block w-full">
                    <Button className="w-full bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-500 text-white border-0 shadow-lg shadow-blue-600/20 rounded-lg h-10 text-sm font-medium">
                      {t('nav.signup')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}