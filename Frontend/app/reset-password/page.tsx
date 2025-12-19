'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, ArrowLeft } from 'lucide-react'

function ResetPasswordPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const code = searchParams.get('code') || ''

  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [success, setSuccess] = React.useState('')
  const [passwordTouched, setPasswordTouched] = React.useState(false)
  const [confirmTouched, setConfirmTouched] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!email || !code) {
      setError('Missing email or code')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    try {
      const { authAPI } = await import('@/lib/api')
      const res = await authAPI.resetPassword(email, code, password)
      if (res.status === 200) {
        setSuccess('Password reset successful. Redirecting to login...')
        setTimeout(() => router.push('/login'), 1200)
      } else {
        setError('Failed to reset password')
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to reset password')
    }
  }

  return (
    <div className="min-h-screen relative bg-[#0a0a0a] dark:bg-[#0a0a0a] flex items-center justify-center p-4 pt-20">
      <div className="w-full max-w-md">
        <Card className="w-full shadow-2xl border border-white/5 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-950/90 backdrop-blur-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">Reset Password</CardTitle>
            <CardDescription className="text-gray-400">Enter your new password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setPasswordTouched(true)}
                    placeholder="Enter new password"
                    className="pl-10"
                    required
                  />
                </div>
                {passwordTouched && password.length > 0 && password.length < 8 && (
                  <div className="text-sm text-red-400">Password must be at least 8 characters</div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => setConfirmTouched(true)}
                    placeholder="Confirm new password"
                    className="pl-10"
                    required
                  />
                </div>
                {confirmTouched && confirmPassword && password !== confirmPassword && (
                  <div className="text-sm text-red-400">Passwords do not match</div>
                )}
              </div>

              {error && <div className="text-sm text-red-400">{error}</div>}
              {success && <div className="text-sm text-green-400">{success}</div>}

              <Button type="submit" className="w-full" disabled={password.length < 8 || password !== confirmPassword}>
                Reset Password
              </Button>
            </form>
            <div className="text-center mt-6">
              <Link href="/login" className="text-sm text-primary hover:underline flex items-center justify-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Login</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPageInner />
    </Suspense>
  )
}
