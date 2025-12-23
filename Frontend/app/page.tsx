'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useI18n } from '@/lib/i18n-provider'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/Navbar'
import Footer from '@/components/Footer'
import { 
  Calculator, 
  Bot, 
  Upload, 
  Globe, 
  Shield, 
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react'

export default function HomePage() {
  const { t, language } = useI18n()
  const { isAuthenticated, initialized } = useAuth()

  const features = [
    {
      icon: Bot,
      title: t('landing.feature1'),
      description: t('landing.feature1.desc'),
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Upload,
      title: t('landing.feature2'),
      description: t('landing.feature2.desc'),
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Globe,
      title: t('landing.feature3'),
      description: t('landing.feature3.desc'),
      color: 'from-purple-500 to-pink-500'
    }
  ]

  const benefits = [
    t('landing.benefits.1'),
    t('landing.benefits.2'),
    t('landing.benefits.3'),
    t('landing.benefits.4'),
    t('landing.benefits.5'),
    t('landing.benefits.6')
  ]

  return (
    <div className="min-h-screen relative bg-[#0a0a0a] dark:bg-[#0a0a0a]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-float"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-float-slow"></div>
      </div>
      <Navbar />
      <div className="relative pt-24">
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="text-center">
            <div className="animate-fade-in-up">
              <div className="flex justify-center mb-6 animate-scale-in">
                <Image
                  src="/logo.svg"
                  alt="Logo"
                  width={64}
                  height={64}
                  sizes="64px"
                  priority
                  className="h-16 w-16 rounded-xl shadow-lg hover:scale-110 transition-transform duration-300"
                />
              </div>
              
              <h1 className={`text-4xl md:text-6xl font-black mb-6 animate-fade-in-up animation-delay-200 ${
                language === 'bn' ? 'bangla-text' : ''
              }`}>
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:from-purple-400 hover:to-blue-400 transition-all duration-500">
                  {t('landing.title')}
                </span>
              </h1>
              
              <p className={`text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto animate-fade-in-up animation-delay-400 ${
                language === 'bn' ? 'bangla-text' : ''
              }`}>
                {t('landing.subtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-600">
                <Link href="/workspace">
                  <Button size="lg" className="text-lg px-8 py-3 group hover:shadow-xl hover:scale-105 transition-all duration-300">
                    <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                    {t('landing.cta')}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-3 hover:shadow-lg hover:scale-105 hover:border-primary transition-all duration-300">
                    <Calculator className="mr-2 h-5 w-5" />
                    {language === 'bn' ? 'মূল্য দেখুন' : 'View Pricing'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 md:top-20 left-5 md:left-10 w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-20 blur-xl animate-float"></div>
            <div className="absolute inset-2 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-full opacity-30 blur-md animate-float-delayed"></div>
          </div>
          
          <div className="absolute top-32 md:top-40 right-5 md:right-10 w-14 h-14 md:w-20 md:h-20 lg:w-28 lg:h-28">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full opacity-20 blur-xl animate-float-reverse"></div>
            <div className="absolute inset-2 bg-gradient-to-br from-green-300 to-emerald-300 rounded-full opacity-30 blur-md animate-float-reverse-delayed"></div>
          </div>
          
          <div className="absolute bottom-16 md:bottom-20 left-[15%] md:left-[20%] w-12 h-12 md:w-16 md:h-16 lg:w-24 lg:h-24">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 blur-xl animate-pulse-float"></div>
            <div className="absolute inset-2 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full opacity-30 blur-md animate-pulse-float-delayed"></div>
          </div>
          
          <div className="hidden lg:block absolute top-1/2 right-1/4 w-20 h-20 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-full opacity-10 blur-2xl animate-float-slow"></div>
          <div className="hidden lg:block absolute bottom-1/3 left-1/3 w-16 h-16 bg-gradient-to-br from-teal-400 to-green-400 rounded-full opacity-10 blur-2xl animate-float-reverse-slow"></div>
        </div>
      </section>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-black text-white mb-4 ${
              language === 'bn' ? 'bangla-text' : ''
            }`}>
              {t('landing.whyChoose')}
            </h2>
            <p className={`text-xl text-gray-400 max-w-2xl mx-auto ${
              language === 'bn' ? 'bangla-text' : ''
            }`}>
              {t('landing.whyChoose.desc')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  style={{
                    transition: 'transform 0.5s cubic-bezier(.22,1,.36,1), opacity 0.5s cubic-bezier(.22,1,.36,1)',
                    transitionDelay: `${index * 120}ms`,
                    transform: 'scale(1)',
                    opacity: 1,
                  }}
                >
                  <Card className="h-full shadow-2xl border border-white/5 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-950/90 backdrop-blur-2xl hover:border-white/10 transition-all duration-700 group relative overflow-hidden hover:-translate-y-1.5">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <CardHeader className="relative z-10">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 shadow-lg border border-white/10`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className={`text-xl text-white font-bold ${
                        language === 'bn' ? 'bangla-text' : ''
                      }`}>
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <CardDescription className={`text-base text-gray-400 ${
                        language === 'bn' ? 'bangla-text' : ''
                      }`}>
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className={`text-3xl md:text-4xl font-black text-white mb-6 ${
                language === 'bn' ? 'bangla-text' : ''
              }`}>
                {t('landing.benefits.title')}
              </h2>
              <p className={`text-xl text-gray-400 mb-8 ${
                language === 'bn' ? 'bangla-text' : ''
              }`}>
                {t('landing.benefits.desc')}
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className={`text-lg text-gray-300 ${
                      language === 'bn' ? 'bangla-text' : ''
                    }`}>
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <Card className="p-8 shadow-2xl border border-white/5 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-950/90 backdrop-blur-2xl hover:border-white/10 transition-all duration-700 group relative overflow-hidden animate-fade-in-up hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="text-center relative z-10">
                  <div className="inline-flex items-center justify-center mb-6 animate-scale-in animation-delay-200">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                      <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 p-5 rounded-2xl shadow-lg hover:scale-110 hover:rotate-6 transition-all duration-300">
                        <Shield className="h-10 w-10 text-white" strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>
                  <h3 className={`text-2xl font-bold text-white mb-4 animate-fade-in-up animation-delay-400 ${
                    language === 'bn' ? 'bangla-text' : ''
                  }`}>
                    {t('landing.security.title')}
                  </h3>
                  <p className={`text-gray-400 mb-6 animate-fade-in-up animation-delay-600 ${
                    language === 'bn' ? 'bangla-text' : ''
                  }`}>
                    {t('landing.security.desc')}
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground animate-fade-in-up animation-delay-800">
                    <div className={`flex items-center space-x-1 hover:text-primary transition-colors duration-300 ${
                      language === 'bn' ? 'bangla-text' : ''
                    }`}>
                      <Clock className="h-4 w-4 hover:scale-110 transition-transform" />
                      <span>{t('landing.security.available')}</span>
                    </div>
                    <div className={`flex items-center space-x-1 hover:text-primary transition-colors duration-300 ${
                      language === 'bn' ? 'bangla-text' : ''
                    }`}>
                      <Shield className="h-4 w-4 hover:scale-110 transition-transform" />
                      <span>{t('landing.security.secure')}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
      {initialized && (
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div>
              <h2 className={`text-3xl md:text-4xl font-black text-white mb-6 ${
                language === 'bn' ? 'bangla-text' : ''
              }`}>
                {t('landing.cta2.title')}
              </h2>
              <p className={`text-xl text-gray-400 mb-8 ${
                language === 'bn' ? 'bangla-text' : ''
              }`}>
                {t('landing.cta2.desc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!isAuthenticated && (
                  <Link href="/signup">
                    <Button size="lg" className={`text-lg px-8 py-3 group hover:shadow-2xl hover:scale-110 transition-all duration-500 animate-fade-in-scale animation-delay-200 relative overflow-hidden ${
                      language === 'bn' ? 'bangla-text' : ''
                    }`}>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>
                      <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                      {t('landing.cta2.start')}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </Link>
                )}
                <Link href="/workspace">
                  <Button variant="outline" size="lg" className={`text-lg px-8 py-3 group hover:shadow-xl hover:scale-110 hover:border-primary hover:bg-primary/5 transition-all duration-500 animate-fade-in-scale animation-delay-400 ${
                    language === 'bn' ? 'bangla-text' : ''
                  }`}>
                    <Bot className="mr-2 h-5 w-5 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" />
                    {t('landing.cta2.demo')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
      <Link href="/calculator" aria-label="Open Tax Calculator" title={language === 'bn' ? 'ক্যালকুলেটর' : 'Calculator'}>
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-scale">
          <div className="relative group">
            <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping"></div>
            <div className="relative h-14 w-14 rounded-full bg-gradient-to-br from-primary to-blue-600 shadow-2xl flex items-center justify-center text-white hover:scale-110 hover:rotate-12 transition-all duration-300 ring-2 ring-primary/25 hover:ring-4 hover:ring-primary/40">
              <span className="sr-only">{language === 'bn' ? 'ক্যালকুলেটর খুলুন' : 'Open Calculator'}</span>
              <Calculator className="h-6 w-6 group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
      </div>
    </div>
  )
}