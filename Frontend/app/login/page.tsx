'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n-provider'
import { useAuth } from '@/lib/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const { t, language } = useI18n()
  const { login } = useAuth()
  const router = useRouter()
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    email: '',
    password: ''
  })
  const [emailTouched, setEmailTouched] = React.useState(false)
  const [passwordTouched, setPasswordTouched] = React.useState(false)

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const success = await login(formData.email, formData.password)
      if (success) {
        router.push('/dashboard')
      } else {
        setError('Invalid email or password')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
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

        {/* Login Form */}
        <Card className="w-full shadow-2xl border border-white/5 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-950/90 backdrop-blur-2xl hover:border-white/10 transition-all duration-700 animate-fade-in-up animation-delay-200 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <CardHeader className="text-center relative z-10">
            <CardTitle className="text-2xl font-bold text-white">
              {t('auth.login')}
            </CardTitle>
            <CardDescription className="text-gray-400">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="Enter your email"
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
                {emailTouched && formData.email && !isValidEmail(formData.email) && (
                  <div className="text-sm text-red-400">Enter a valid email address</div>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
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
                    placeholder="Enter your password"
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
                {passwordTouched && formData.password && formData.password.length < 8 && (
                  <div className="text-sm text-red-400">Password must be at least 8 characters</div>
                )}
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  {t('auth.forgotPassword')}
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={
                  isLoading || !isValidEmail(formData.email) || formData.password.length < 8
                }
              >
                <div className="flex items-center justify-center gap-3">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin" />
                      <span>{t('common.loading')}</span>
                    </div>
                  ) : (
                    <span>{t('auth.loginButton')}</span>
                  )}
                </div>
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

            {/* Social Login */}
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                Continue with Google
              </Button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                {t('auth.noAccount')}{' '}
                <Link href="/signup" className="text-primary hover:underline font-medium">
                  {t('auth.signup')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}