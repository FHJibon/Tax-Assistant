'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI, setAuthToken, getAuthToken, removeAuthToken } from './api'

interface AuthContextType {
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  user: { email: string; name?: string } | null
  initialized: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null)
  const [initialized, setInitialized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const token = getAuthToken()
      if (!token) { setInitialized(true); return }
      try {
        const me = await authAPI.me()
        const u = me?.data
        const name = u?.name as string | undefined
        const emailFinal = u?.email as string | undefined
        setIsAuthenticated(true)
        setUser({ email: emailFinal || '', name })
        if (emailFinal) localStorage.setItem('userEmail', emailFinal)
        if (name) localStorage.setItem('userName', name)
        const existingProfileRaw = localStorage.getItem('userProfile')
        const existingProfile = existingProfileRaw ? JSON.parse(existingProfileRaw) : {}
        const newProfile = {
          ...existingProfile,
          name: name || existingProfile.name || '',
          email: emailFinal || existingProfile.email || '',
        }
        localStorage.setItem('userProfile', JSON.stringify(newProfile))
      } catch (err: any) {
        // Token invalid or user missing -> clear client cache and force login
        removeAuthToken()
        localStorage.removeItem('userEmail')
        localStorage.removeItem('userName')
        localStorage.removeItem('userProfile')
        setIsAuthenticated(false)
        setUser(null)
        router.replace('/login')
      } finally {
        setInitialized(true)
      }
    }
    init()
  }, [router])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data } = await authAPI.login({ email, password });
      if (data?.access_token) {
        setAuthToken(data.access_token);
        setIsAuthenticated(true);
        try {
          const me = await authAPI.me();
          const userInfo = me?.data;
          const name = userInfo?.name as string | undefined;
          const emailFinal = userInfo?.email as string | undefined;
          setUser({ email: emailFinal || email, name });
          if (emailFinal) localStorage.setItem('userEmail', emailFinal);
          if (name) localStorage.setItem('userName', name);
          const existingProfileRaw = localStorage.getItem('userProfile');
          const existingProfile = existingProfileRaw ? JSON.parse(existingProfileRaw) : {};
          const newProfile = {
            ...existingProfile,
            name: name || existingProfile.name || '',
            email: emailFinal || existingProfile.email || '',
          };
          localStorage.setItem('userProfile', JSON.stringify(newProfile));
        } catch {
          setUser({ email });
          localStorage.setItem('userEmail', email);
        }
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
    removeAuthToken()
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user, initialized }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
