'use client'

import React from 'react'
import { useI18n } from '@/lib/i18n-provider'
// Removed unused Card imports
import { Button } from '@/components/ui/button'
import { Upload, File, X, CheckCircle } from 'lucide-react'
// animations removed to avoid hydration issues

interface FileItem {
  id: string
  name: string
  size: number
  type: string
  status: 'uploading' | 'success' | 'error'
  progress?: number
}

interface FileUploaderProps {
  onFilesUpload?: (files: File[]) => void
  acceptedTypes?: string[]
  maxFiles?: number
  maxSize?: number // in MB
  hideInfo?: boolean
  showSizeNote?: boolean
}

export function FileUploader({ 
  onFilesUpload, 
  acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png', 'application/pdf', 'image/jpeg', 'image/png'],
  maxFiles = 5,
  maxSize = 5,
  hideInfo = false,
  showSizeNote = true,
}: FileUploaderProps) {
  const { t } = useI18n()
  const [files, setFiles] = React.useState<FileItem[]>([])
  const [isDragOver, setIsDragOver] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [statusMessage, setStatusMessage] = React.useState<string>("")
  const [statusType, setStatusType] = React.useState<'info' | 'error' | 'success'>("info")

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
    setStatusMessage(
      `${validFiles.length} file${validFiles.length > 1 ? 's' : ''} added${rejected.length ? `. Skipped: ${rejected.map(r => r.name).join(', ')}` : ''}`
    )
    setStatusType('success')

    // Simulate upload process
    fileItems.forEach((fileItem, index) => {
      simulateUpload(fileItem.id, validFiles[index])
    })

    onFilesUpload?.(validFiles)
  }

  const simulateUpload = (fileId: string, file: File) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 30
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'success', progress: 100 }
            : f
        ))
      } else {
        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, progress }
            : f
        ))
      }
    }, 200)
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
        {/* Status message */}
        {statusMessage && (
          <div
            className={`text-sm rounded-md px-3 py-2 ${
              statusType === 'error'
                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                : statusType === 'success'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                : 'bg-muted text-foreground'
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
  )
}