'use client'

import * as React from "react"

interface ToastProps {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

interface ToasterContextType {
  toast: (props: ToastProps) => void
  toasts: (ToastProps & { id: string })[]
}

const ToasterContext = React.createContext<ToasterContextType | undefined>(undefined)

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<(ToastProps & { id: string })[]>([])

  const toast = React.useCallback((props: ToastProps) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { ...props, id }])
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [])

  return (
    <ToasterContext.Provider value={{ toast, toasts }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 space-y-3">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`
              max-w-sm w-full pointer-events-auto overflow-hidden rounded-2xl border shadow-lg backdrop-blur-xl
              transition-all duration-300 transform animate-fade-in-up
              ${toast.variant === 'destructive'
                ? 'border-red-500/40 bg-gradient-to-br from-red-900/80 via-red-900/90 to-black/90 shadow-red-900/40'
                : 'border-blue-500/30 bg-gradient-to-br from-gray-900/90 via-gray-900/95 to-black/95 shadow-blue-900/40'}
            `}
          >
            <div className="p-4">
              {toast.title && (
                <div className="text-sm font-semibold tracking-wide text-white">
                  {toast.title}
                </div>
              )}
              {toast.description && (
                <div className="mt-1 text-sm text-gray-300">
                  {toast.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </ToasterContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToasterContext)
  if (!context) {
    throw new Error('useToast must be used within a ToasterProvider')
  }
  return context
}

export function Toaster() {
  return null // The actual toaster is rendered by ToasterProvider
}