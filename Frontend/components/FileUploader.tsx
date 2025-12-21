'use client'

import React from 'react'
import { useI18n } from '@/lib/i18n-provider'
// Removed unused Card imports
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import Link from 'next/link'
import { Modal } from '@/components/ui/modal'
import { Upload } from 'lucide-react'
// animations removed to avoid hydration issues

interface FileItem {
  id: string
  name: string
  size: number
  type: string
  status: 'uploading' | 'success' | 'error'
  progress?: number
  docType?: string
}

interface FileUploaderProps {
  onFilesUpload?: (files: File[]) => void
  acceptedTypes?: string[]
  maxFiles?: number
  maxSize?: number // in MB
  hideInfo?: boolean
  showSizeNote?: boolean
  onSummarizingChange?: (active: boolean) => void
  onUploadComplete?: () => void
  onDocumentClassified?: (docType: string | null) => void
}

export function FileUploader({ 
  onFilesUpload,
  acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png', 'application/pdf', 'image/jpeg', 'image/png'],
  maxFiles = 10,
  maxSize = 5,
  hideInfo = false,
  showSizeNote = true,
  onSummarizingChange,
  onUploadComplete,
  onDocumentClassified,
}: FileUploaderProps) {
  const { t } = useI18n()
  const [files, setFiles] = React.useState<FileItem[]>([])
  const [isDragOver, setIsDragOver] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [statusMessage, setStatusMessage] = React.useState<string>("")
  const [statusType, setStatusType] = React.useState<'info' | 'error' | 'success'>("info")
  const [showPopup, setShowPopup] = React.useState(false)
  const [popupMessage, setPopupMessage] = React.useState('')
  const [showProfileUpdatePopup, setShowProfileUpdatePopup] = React.useState(false)
  const [profileUpdateDocType, setProfileUpdateDocType] = React.useState<string | null>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    processFiles(droppedFiles)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    processFiles(selectedFiles)
  }

  const processFiles = (newFiles: File[]) => {
    // Enforce max files
    if (files.length + newFiles.length > maxFiles) {
      setStatusMessage(`You can only upload up to ${maxFiles} files`)
      setStatusType('error')
      return
    }

    // Validate each file and collect rejections for user feedback
    const rejected: { name: string; reason: string }[] = []
    const isAccepted = (file: File) => {
      // Allow either by extension or by mime type
      const name = file.name.toLowerCase()
      const extOk = acceptedTypes
        .filter(t => t.startsWith('.'))
        .some(ext => name.endsWith(ext.toLowerCase()))
      const typeOk = acceptedTypes
        .filter(t => !t.startsWith('.'))
        .some(mt => (file.type || '').toLowerCase() === mt.toLowerCase())
      return extOk || typeOk
    }

    const validFiles = newFiles.filter(file => {
      const isValidType = isAccepted(file)
      const isValidSize = file.size <= maxSize * 1024 * 1024

      if (!isValidType) {
        rejected.push({ name: file.name, reason: 'Unsupported format' })
        return false
      }
      if (!isValidSize) {
        rejected.push({ name: file.name, reason: `Too large (> ${maxSize}MB)` })
        return false
      }
      return true
    })

    if (validFiles.length === 0) {
      setStatusMessage(
        rejected.length > 0
          ? `No files uploaded. Issues: ${rejected.map(r => `${r.name} (${r.reason})`).join(', ')}`
          : 'No valid files selected.'
      )
      setStatusType('error')
      return
    }

    const fileItems: FileItem[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0,
    }))

    setFiles(prev => [...prev, ...fileItems])
    // For successful additions we keep the UI quiet to avoid
    // the upload card growing; only errors will show messages.
    setStatusMessage('')
    setStatusType('info')

    // Upload to backend
    fileItems.forEach((fileItem, index) => {
      uploadFile(fileItem.id, validFiles[index])
    })

    onFilesUpload?.(validFiles)
  }

  const uploadFile = async (fileId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      onSummarizingChange?.(true)
      const res = await api.post('/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const total = e.total || file.size
          const progress = total ? Math.round((e.loaded * 100) / total) : 0
          setFiles(prev => prev.map(f =>
            f.id === fileId ? { ...f, progress } : f
          ))
        }
      })
      const docType = (res?.data?.doc_type as string | undefined) || undefined
      // If backend classifies the document but it's not one of the allowed
      // types (nid, tin, salary), reject it client-side and show an error.
      const allowed = ['nid', 'tin', 'salary']
      if (docType && !allowed.includes(docType)) {
        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'error', progress: 100, docType }
            : f
        ))
        setStatusMessage('Only Nation ID, TIN Certificate and Salary Certificate are allowed.')
        setStatusType('error')
        onDocumentClassified?.(null)
        onSummarizingChange?.(false)
        return
      }

      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'success', progress: 100, docType }
          : f
      ))
      // Do not show a success banner; keep the card height stable.
      setStatusMessage('')
      setStatusType('info')
      if (docType) {
        // Notify parent about the classified document and show
        // profile-update confirmation for NID/TIN.
        onDocumentClassified?.(docType)
        if (docType === 'nid' || docType === 'tin') {
          setProfileUpdateDocType(docType)
          setShowProfileUpdatePopup(true)
        }
      } else {
        onDocumentClassified?.(null)
      }
      // Notify parent so chat history can refresh
      // and show the new document summary.
      onUploadComplete?.()
    } catch (err: any) {
      // Keep UI quiet on server errors – no red banner
      const code = err?.response?.status
      const detail = err?.response?.data?.detail || 'Failed to upload'

      // For "Complete profile with NID and TIN" we only show the
      // blue popup (no red inline "Failed to upload" banner).
      if (code === 400 && typeof detail === 'string' && detail.includes('Complete profile')) {
        setPopupMessage(detail)
        setShowPopup(true)
      } else {
        console.error('Upload failed:', detail)
      }

      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'error' }
          : f
      ))
    } finally {
      onSummarizingChange?.(false)
    }
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <>
    <div className="space-y-4">
        {/* Status message */}
        {statusMessage && statusType === 'error' && (
          <div
            className={`text-sm rounded-md px-3 py-2 ${
              'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
            }`}
          >
            {statusMessage}
          </div>
        )}

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5'
            }
          `}
        >
          <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">{t('upload.dropzone')}</p>
          {!hideInfo && (
            <p className="text-sm text-muted-foreground mb-4">{t('upload.supported')}</p>
          )}
          <Button variant="outline">
            {t('common.upload')}
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple={maxFiles !== 1}
          // Accept attribute prefers comma-separated list; include both extensions and mimes
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* File Size Limits Info - shown immediately after upload box */}
        {showSizeNote && (
          <div className="text-xs text-muted-foreground text-center">
            <p>Maximum file size: {maxSize} MB</p>
          </div>
        )}


    </div>

    {/* Blue, centered modal popup for profile completion */}
    <Modal
      open={showPopup}
      title="Complete your profile"
      onClose={() => setShowPopup(false)}
      actions={
        <>
          <Button variant="ghost" className="text-white/90" onClick={() => setShowPopup(false)}>Close</Button>
        </>
      }
    >
      {/* No body text per request */}
    </Modal>
    
    {/* Popup telling user that profile data (NID/TIN) was updated from document */}
    <Modal
      open={showProfileUpdatePopup}
      title="Update profile from document"
      onClose={() => setShowProfileUpdatePopup(false)}
      actions={
        <>
          <Button
            variant="ghost"
            className="text-white/90"
            onClick={() => setShowProfileUpdatePopup(false)}
          >
            Cancel
          </Button>
          <Button
            className="bg-white text-blue-900 hover:opacity-95"
            onClick={() => setShowProfileUpdatePopup(false)}
          >
            Agree & Continue
          </Button>
        </>
      }
    >
      <p className="text-sm text-white/90 mb-2">
        We have extracted your {profileUpdateDocType === 'tin' ? 'TIN' : 'NID'} information from the uploaded
        document. By continuing, you confirm that this information is correct and agree that we may
        update your profile automatically to prepare your tax return.
      </p>
      <p className="text-xs text-white/70">
        You can review or change these details any time from the Profile page.
      </p>
    </Modal>
    </>
  )
}