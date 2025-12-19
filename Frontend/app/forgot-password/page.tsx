'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const { t, language } = useI18n()
  const router = useRouter()
  const [email, setEmail] = React.useState('')
  const [submitted, setSubmitted] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [emailTouched, setEmailTouched] = React.useState(false)

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const { authAPI } = await import('@/lib/api')
      const res = await authAPI.forgotPassword(email)
      if (res.status === 200) {
        router.push(`/verify-otp?type=forgot-password&email=${encodeURIComponent(email)}`)
      } else {
        alert(language === 'bn' ? 'ওটিপি পাঠাতে ব্যর্থ' : 'Failed to send OTP')
      }
    } catch (err) {
      alert(language === 'bn' ? 'ওটিপি পাঠাতে ব্যর্থ' : 'Failed to send OTP')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen relative bg-[#0a0a0a] dark:bg-[#0a0a0a] flex items-center justify-center p-4 pt-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-float"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-float-slow"></div>
      </div>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image src="/logo.svg" alt="Logo" width={64} height={64} className="h-16 w-16 rounded-xl shadow-lg hover:shadow-xl transition-shadow" />
          </Link>
        </div>

        {/* Forgot Password Form */}
        <Card className="w-full shadow-2xl border border-white/5 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-950/90 backdrop-blur-2xl hover:border-white/10 transition-all duration-700 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <CardHeader className="text-center relative z-10">
            <CardTitle className={`text-2xl font-bold text-white ${
              language === 'bn' ? 'bangla-text' : ''
            }`}>
              {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
            </CardTitle>
            <CardDescription className={`${language === 'bn' ? 'bangla-text' : ''} text-gray-400`}>
              {language === 'bn' 
                ? 'আপনার ইমেইল লিখুন' 
                : "Enter your email address."}
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className={`text-sm font-medium text-white ${
                    language === 'bn' ? 'bangla-text' : ''
                  }`}>
                    {language === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setEmailTouched(true)}
                      placeholder={language === 'bn' ? 'আপনার ইমেইল লিখুন' : 'Enter your email'}
                      className="pl-10"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  {emailTouched && email && !isValidEmail(email) && (
                    <div className="text-sm text-red-400">
                      {language === 'bn' ? 'সঠিক ইমেইল দিন' : 'Enter a valid email address'}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={isLoading || !isValidEmail(email)}>
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin" />
                      <span>{language === 'bn' ? 'লোড হচ্ছে...' : 'Sending...'}</span>
                    </div>
                  ) : (
                    language === 'bn' ? 'ওটিপি পাঠান' : 'Send OTP'
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-green-500/20 p-4 rounded-full border border-green-500/20">
                    <CheckCircle className="h-12 w-12 text-green-400" />
                  </div>
                </div>
                <div>
                  <h3 className={`text-lg font-medium text-white mb-2 ${
                    language === 'bn' ? 'bangla-text' : ''
                  }`}>
                    {language === 'bn' ? 'ইমেইল পাঠানো হয়েছে!' : 'Email Sent!'}
                  </h3>
                  <p className={`text-sm text-gray-400 ${
                    language === 'bn' ? 'bangla-text' : ''
                  }`}>
                    {language === 'bn' 
                      ? `আমরা ${email} ঠিকানায় একটি পাসওয়ার্ড রিসেট লিংক পাঠিয়েছি। আপনার ইনবক্স দেখুন।` 
                      : `We've sent a password reset link to ${email}. Please check your inbox.`}
                  </p>
                </div>
                <Button 
                  onClick={() => setSubmitted(false)} 
                  variant="outline"
                  className="w-full"
                >
                  {language === 'bn' ? 'আবার চেষ্টা করুন' : 'Try Again'}
                </Button>
              </div>
            )}

            {/* Back to Login */}
            <div className="text-center mt-6">
              <Link 
                href="/login" 
                className="text-sm text-primary hover:underline flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className={language === 'bn' ? 'bangla-text' : ''}>
                  {language === 'bn' ? 'লগইনে ফিরে যান' : 'Back to Login'}
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Additional Help */}
        <div className="text-center mt-6 text-sm text-gray-400 relative z-10">
          <p className={language === 'bn' ? 'bangla-text' : ''}>
            {language === 'bn' 
              ? 'সমস্যা হচ্ছে? আমাদের সাথে যোগাযোগ করুন ' 
              : 'Having trouble? Contact us at '}
            <Link href="mailto:ferdoushasanjibon25@gmail.com" className="text-primary hover:underline">
              ferdoushasanjibon25@gmail.com
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
