'use client'

import React from 'react'
import { createPortal } from 'react-dom'

type ModalProps = {
  open: boolean
  title?: string
  onClose?: () => void
  children?: React.ReactNode
  actions?: React.ReactNode
  size?: 'sm' | 'md'
}

export function Modal({ open, title, onClose, children, actions, size = 'md' }: ModalProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!open || !mounted) return null

  const sizeClass = size === 'sm' ? 'max-w-xs' : 'max-w-sm md:max-w-md'

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={`relative w-full ${sizeClass} rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/100 via-blue-900/100 to-blue-800/100 text-white shadow-xl animate-bounce-in`}>
        <div className="p-6">
          {title && <h3 className="font-semibold mb-2 text-white">{title}</h3>}
          {children}
          {actions && (
            <div className="mt-6 flex justify-end gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
