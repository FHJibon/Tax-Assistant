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
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`
              max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden
              ${toast.variant === 'destructive' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}
            `}
          >
            <div className="p-4">
              {toast.title && (
                <div className="text-sm font-medium text-gray-900">
                  {toast.title}
                </div>
              )}
              {toast.description && (
                <div className="mt-1 text-sm text-gray-500">
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