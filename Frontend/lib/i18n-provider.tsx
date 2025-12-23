'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import './i18n'

interface I18nContextType {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { i18n, t } = useTranslation()
  const [language, setLanguage] = useState('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setLanguage(i18n.language || 'en')
  }, [i18n.language])

  useEffect(() => {
    const handleLanguageChange = (lang: string) => {
      setLanguage(lang)
      document.documentElement.lang = lang
      if (lang === 'bn') {
        document.body.classList.add('bangla-text')
      } else {
        document.body.classList.remove('bangla-text')
      }
    }

    i18n.on('languageChanged', handleLanguageChange)
    handleLanguageChange(i18n.language)

    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [i18n])

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
  }

  if (!mounted) {
    return (
      <I18nContext.Provider
        value={{
          language: 'en',
          setLanguage: changeLanguage,
          t,
        }}
      >
        {children}
      </I18nContext.Provider>
    )
  }

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage: changeLanguage,
        t,
      }}
    >
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}