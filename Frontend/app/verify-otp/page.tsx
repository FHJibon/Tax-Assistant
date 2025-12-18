'use client'

import React, { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useI18n } from '@/lib/i18n-provider'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Shield, ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react'

function VerifyOTPInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, language } = useI18n()
  
  const type = searchParams.get('type') || 'signup' 
  const email = searchParams.get('email') || ''
  
  const [otp, setOtp] = React.useState(['', '', '', '', '', ''])
  const [error, setError] = React.useState('')
  const [success, setSuccess] = React.useState(false)
  const [isVerifying, setIsVerifying] = React.useState(false)
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0]
    }

    if (!/^\d*$/.test(value)) {
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError('')

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'Enter') {
      const otpCode = otp.join('')
      if (otpCode.length === 6) {
        e.preventDefault()
        // Trigger verification when Enter is pressed and code complete
        handleVerify()
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    
    if (!/^\d+$/.test(pastedData)) {
      return
    }

    const newOtp = [...otp]
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i]
    }
    setOtp(newOtp)
    setError('')
    
    // Focus last filled input
    const lastIndex = Math.min(pastedData.length, 5)
    inputRefs.current[lastIndex]?.focus()
  }

  const handleVerify = async () => {
    const otpCode = otp.join('')
    
    if (otpCode.length !== 6) {
      setError(language === 'bn' ? 'সম্পূর্ণ OTP কোড লিখুন' : 'Please enter complete OTP code')
      return
    }

    setIsVerifying(true)
    setError('')
    try {
      const { authAPI } = await import('@/lib/api')
      if (type === 'forgot-password') {
        // For password reset, proceed to reset page with email+code
        setSuccess(true)
        setTimeout(() => {
          router.push(`/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(otpCode)}`)
        }, 800)
      } else {
        const res = await authAPI.verifySignup(email, otpCode)
        if (res.status === 200) {
          setSuccess(true)
          setTimeout(() => {
            router.push('/login?verified=true')
          }, 1500)
        } else {
          setError(language === 'bn' ? 'ভুল কোড' : 'Invalid code')
        }
      }
    } catch (err: any) {
      setError(language === 'bn' ? 'যাচাই ব্যর্থ' : 'Verification failed')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = () => {
    setOtp(['', '', '', '', '', ''])
    setError('')
    setSuccess(false)
    inputRefs.current[0]?.focus()
    // Simulate resend API call
    // In production, call your resend OTP API here
  }

  return (
    <div className="h-screen overflow-hidden relative bg-[#0a0a0a] dark:bg-[#0a0a0a]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-float"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-float-slow"></div>
      </div>
      
      <Navbar />
      
      <div className="h-screen overflow-y-auto scrollbar-hide pt-20">
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <Card className="w-full max-w-md shadow-2xl border border-white/5 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-950/90 backdrop-blur-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <CardHeader className="space-y-4 pb-8 relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="absolute top-6 left-6 text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {language === 'bn' ? 'পেছনে' : 'Back'}
              </Button>
              
              <div className="flex justify-center pt-8">
                <div className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-500/20 rounded-2xl border border-blue-500/20">
                  <Shield className="h-12 w-12 text-blue-400" />
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <CardTitle className={`text-2xl font-bold text-white ${language === 'bn' ? 'bangla-text' : ''}`}>
                  {language === 'bn' ? 'OTP যাচাই করুন' : 'Verify OTP'}
                </CardTitle>
                <CardDescription className={`text-gray-400 ${language === 'bn' ? 'bangla-text' : ''}`}>
                  {language === 'bn' 
                    ? `আমরা ${email} এ একটি 6-সংখ্যার কোড পাঠিয়েছি` 
                    : `We've sent a 6-digit code to ${email}`}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 relative">
              {/* OTP Input Fields */}
              <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    disabled={isVerifying || success}
                    className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500 ${
                      success ? 'border-green-500 bg-green-900/20' : ''
                    } ${error ? 'border-red-500' : ''}`}
                  />
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg p-3 animate-in slide-in-from-top-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="flex items-center gap-2 text-green-400 text-sm bg-green-900/20 border border-green-500/30 rounded-lg p-3 animate-in slide-in-from-top-2">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{language === 'bn' ? 'OTP যাচাই সফল!' : 'OTP verified successfully!'}</span>
                </div>
              )}

              {/* Verify Button */}
              <Button
                onClick={handleVerify}
                disabled={otp.join('').length !== 6 || isVerifying || success}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-700 text-white font-semibold h-12"
              >
                {isVerifying 
                  ? (language === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying...') 
                  : (language === 'bn' ? 'যাচাই করুন' : 'Verify OTP')}
              </Button>

              {/* Resend OTP */}
              <div className="text-center">
                <p className={`text-sm text-gray-400 mb-2 ${language === 'bn' ? 'bangla-text' : ''}`}>
                  {language === 'bn' ? 'কোড পাননি?' : "Didn't receive the code?"}
                </p>
                <Button
                  variant="ghost"
                  onClick={handleResend}
                  disabled={isVerifying || success}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {language === 'bn' ? 'পুনরায় পাঠান' : 'Resend OTP'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}> 
      <VerifyOTPInner />
    </Suspense>
  )
}
