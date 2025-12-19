'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'

export default function SignupPage() {
  const { t, language } = useI18n()
  const router = useRouter()
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [mismatchOpen, setMismatchOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [acceptedTerms, setAcceptedTerms] = React.useState(false)
  const [showTermsAlert, setShowTermsAlert] = React.useState(false)
  const [passwordTouched, setPasswordTouched] = React.useState(false)
  const [confirmTouched, setConfirmTouched] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!acceptedTerms) {
      setShowTermsAlert(true)
      return
    }
    if (formData.password.length < 8) {
      setPasswordTouched(true)
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setMismatchOpen(true)
      return
    }
    setIsLoading(true)
    try {
      const res = await (await import('@/lib/api')).authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })
      if (res.status === 200) {
        // Redirect to verify OTP page
        router.push(`/verify-otp?type=signup&email=${encodeURIComponent(formData.email)}`)
      } else {
        alert('Registration failed')
      }
    } catch (err: any) {
      alert('Registration failed')
    }
    setIsLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
        <div className="flex justify-center mb-6 md:mb-8 animate-scale-in">
          <Link href="/">
            <Image src="/logo.svg" alt="Logo" width={64} height={64} className="h-14 w-14 md:h-16 md:w-16 rounded-xl shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300" />
          </Link>
        </div>

        {/* Signup Form */}
        <Card className="w-full shadow-2xl border border-white/5 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-950/90 backdrop-blur-2xl hover:border-white/10 transition-all duration-700 group relative overflow-hidden animate-fade-in-up animation-delay-200">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <CardHeader className="text-center relative z-10">
            <CardTitle className="text-2xl font-bold text-white">
              {t('auth.signup')}
            </CardTitle>
            <CardDescription className="text-gray-400">
              Create your account to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
                {/* Removed misplaced password error under name field */}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
                {/* Removed misplaced confirm error under email field */}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={() => setPasswordTouched(true)}
                    placeholder="Create a password"
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwordTouched && formData.password.length > 0 && formData.password.length < 8 && (
                  <div className="text-sm text-red-400">Password must be at least 8 characters</div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  {t('auth.confirmPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onBlur={() => setConfirmTouched(true)}
                    placeholder="Confirm your password"
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {confirmTouched && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <div className="text-sm text-red-400">Passwords do not match</div>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2 text-sm">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />
                <label htmlFor="terms" className="text-gray-400">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Signup Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || formData.password.length < 8 || formData.password !== formData.confirmPassword}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin" />
                    <span>{t('common.loading')}</span>
                  </div>
                ) : (
                  t('auth.signupButton')
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Signup */}
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                Continue with Google
              </Button>
            </div>

            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                {t('auth.hasAccount')}{' '}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  {t('auth.login')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      {mismatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm">
            <Card className="border border-white/10 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-950/90">
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold text-white">Password Mismatch</CardTitle>
                <CardDescription className="text-gray-400">The passwords entered do not match.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => setMismatchOpen(false)}>OK</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      {showTermsAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md px-6">
            <div className="bg-gradient-to-br from-slate-900/100 via-blue-900/100 to-blue-800/100 rounded-2xl p-6 border border-white/10 shadow-xl animate-scale-in">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-white/10">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Agree to Terms</h3>
                  <p className="text-sm text-gray-200">You must accept the Terms of Service and Privacy Policy to create an account.</p>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Button variant="ghost" className="flex-1 text-white/90" onClick={() => setShowTermsAlert(false)}>Close</Button>
                <Button className="flex-1 bg-white text-blue-900 hover:opacity-95" onClick={() => { setShowTermsAlert(false); setAcceptedTerms(true); }}>Accept</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}