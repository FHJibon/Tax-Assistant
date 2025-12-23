'use client'

import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n-provider'
import { useAuth } from '@/lib/auth-provider'
import { uploadAPI, taxAPI } from '@/lib/api'
import { Navbar } from '@/components/Navbar'
import { FileUploader } from '@/components/FileUploader'
import { ChatBox } from '@/components/ChatBox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'

export default function WorkspacePage() {
  const { t, language } = useI18n()
  const { isAuthenticated, initialized } = useAuth()
  const router = useRouter()
  const [isSummarizing, setIsSummarizing] = React.useState(false)
  const [chatReloadToken, setChatReloadToken] = React.useState(0)
  const [reviewedDocTypes, setReviewedDocTypes] = React.useState<Record<string, boolean>>({})
  const [showMissingModal, setShowMissingModal] = React.useState(false)
  const [missingDocs, setMissingDocs] = React.useState<string[]>([])
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [showGenerateTerms, setShowGenerateTerms] = React.useState(false)
  const [generateError, setGenerateError] = React.useState<string | null>(null)
  const [showGenerationOverlay, setShowGenerationOverlay] = React.useState(false)
  const [generationStageIndex, setGenerationStageIndex] = React.useState(0)
  const [readyFile, setReadyFile] = React.useState<{ blob: Blob; filename: string } | null>(null)
  const [showDownloadModal, setShowDownloadModal] = React.useState(false)

  const docTypeDefinitions = React.useMemo(
    () => [
      { key: 'nid', labelEn: 'Nation ID', labelBn: 'এনআইডি' },
      { key: 'tin', labelEn: 'TIN Certificate', labelBn: 'টিন সার্টিফিকেট' },
      { key: 'salary', labelEn: 'Salary Certificate', labelBn: 'বেতন সার্টিফিকেট' },
      { key: 'bank', labelEn: 'Bank Statement', labelBn: 'ব্যাংক স্টেটমেন্ট' },
      { key: 'insurance', labelEn: 'Insurance Statement', labelBn: 'বীমা' },
      { key: 'dps', labelEn: 'DPS Statement', labelBn: 'ডিপিএস' },
      { key: 'sanchaypatra', labelEn: 'Saving Certificate', labelBn: 'সঞ্চয়পত্র' },
      { key: 'loan', labelEn: 'Loan Statement', labelBn: 'ঋণ স্টেটমেন্ট' },
    ],
    []
  )

  // Only these documents are required for Generate
  const requiredDocKeys = React.useMemo(() => ['nid', 'tin', 'salary'], [])

  const generationStages = React.useMemo(
    () => [
      'Gathering Data...',
      'Analyzing...',
      'Calculating Tax...',
      'Generating Tax Return...',
    ],
    []
  )

  React.useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, initialized, router])

  const handleFilesUpload = (_files: File[]) => {
    // We no longer display individual file rows; only doc-type status.
  }

  const handleDocumentClassified = (docType: string | null) => {
    if (!docType || docType === 'unknown') return
    setReviewedDocTypes(prev => ({ ...prev, [docType]: true }))
  }

  // On load, fetch which document types already exist for this
  // session so ticks persist across page/backend refresh.
  React.useEffect(() => {
    if (!initialized || !isAuthenticated) return

    let cancelled = false

    const loadStatus = async () => {
      try {
        const { data } = await uploadAPI.getStatus()
        if (cancelled || !data) return

        const next: Record<string, boolean> = {}
        docTypeDefinitions.forEach((d) => {
          const raw = (data as any)[d.key]
          next[d.key] = Boolean(raw)
        })
        setReviewedDocTypes(next)
      } catch {
        // ignore; user can still upload and set flags client-side
      }
    }

    loadStatus()

    return () => {
      cancelled = true
    }
  }, [initialized, isAuthenticated, docTypeDefinitions])

  if (!initialized) return null
  if (!isAuthenticated) {
    return null
  }

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const handleGenerateClick = async () => {
    const missing = docTypeDefinitions
      .filter(d => requiredDocKeys.includes(d.key) && !reviewedDocTypes[d.key])
      .map(d => (language === 'bn' ? d.labelBn : d.labelEn))

    if (missing.length > 0) {
      setMissingDocs(missing)
      setShowMissingModal(true)
      return
    }

    // All required documents present – ask user to agree to terms
    setShowGenerateTerms(true)
  }

  const handleConfirmGenerate = async () => {
    try {
      setShowGenerateTerms(false)
      setIsGenerating(true)
      setShowGenerationOverlay(true)

      // Show all 4 stages in sequence before generating the file
      for (let i = 0; i < generationStages.length; i++) {
        setGenerationStageIndex(i)
        // Slight pause for each stage to feel like a breathing flow
        await sleep(1200)
      }

      const response = await taxAPI.generateTaxReturn()
      const blob = new Blob([response.data], { type: 'application/pdf' })

      let filename = 'tax_return.pdf'
      const disposition = (response.headers && (response.headers['content-disposition'] || response.headers['Content-Disposition'])) as string | undefined
      if (disposition) {
        const match = disposition.match(/filename="?([^";]+)"?/i)
        if (match && match[1]) {
          filename = match[1]
        }
      }

      // Fallback: derive filename from stored profile name if header is missing or default
      if (!filename || filename === 'tax_return.pdf') {
        try {
          const storedName = typeof window !== 'undefined' ? localStorage.getItem('userName') : null
          if (storedName) {
            const safeBase = storedName.trim().replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'user'
            filename = `${safeBase}.pdf`
          }
        } catch {
          // ignore and keep existing filename
        }
      }

      setReadyFile({ blob, filename })
      setShowGenerationOverlay(false)
      setShowDownloadModal(true)
    } catch (error) {
      console.error('Failed to generate tax return:', error)
      setShowGenerateTerms(false)
      setShowGenerationOverlay(false)
      setGenerateError(
        language === 'bn'
          ? 'ট্যাক্স রিটার্ন তৈরি করা যায়নি। পরে আবার চেষ্টা করুন।'
          : 'Failed to generate tax return. Please try again later.'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadReadyFile = async () => {
    if (!readyFile) return
    try {
      const url = window.URL.createObjectURL(readyFile.blob)
      const link = document.createElement('a')
      link.href = url
      link.download = readyFile.filename || 'tax_return.pdf'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      // After triggering the download, terminate the backend chat/session
      try {
        await taxAPI.terminateSession()
      } catch {
        // If termination fails, ignore; user can still continue using the app.
      }
    } finally {
      setShowDownloadModal(false)
      setReadyFile(null)
    }
  }

  return (
    <div className="h-screen overflow-hidden relative bg-[#0a0a0a] dark:bg-[#0a0a0a]">
      {/* Animated grid background */}
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
      
      <div className="container mx-auto px-4 max-w-7xl h-screen overflow-y-auto scrollbar-hide pt-20">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Left Column: Upload Section */}
          <div className="flex flex-col gap-2 md:gap-4 lg:h-[calc(100vh-12rem)]">
            {/* Upload Box */}
            <Card className="shadow-2xl border border-blue-500/15 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-slate-950/95 backdrop-blur-2xl transition-all duration-700 flex-shrink-0 group relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <CardHeader className="pb-3 relative z-10">
                <CardTitle className={`text-lg flex items-center gap-2 text-white font-bold ${
                  language === 'bn' ? 'bangla-text' : ''
                }`}>
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/20 rounded-lg border border-blue-500/20">
                    <Upload className="h-5 w-5 text-blue-400" />
                  </div>
                  {language === 'bn' ? 'নথি আপলোড' : 'Upload Documents'}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <FileUploader
                  onFilesUpload={handleFilesUpload}
                  maxFiles={10}
                  hideInfo={false}
                  showSizeNote={true}
                  onSummarizingChange={setIsSummarizing}
                  onUploadComplete={() => setChatReloadToken((prev) => prev + 1)}
                  onDocumentClassified={handleDocumentClassified}
                />
              </CardContent>
            </Card>

            {/* Reviewed Documents Status */}
            <Card className="shadow-2xl border border-blue-500/15 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-slate-950/95 backdrop-blur-2xl transition-all duration-700 flex-1 min-h-0 overflow-hidden flex flex-col group relative">
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              {/* Header intentionally removed to hide the Reviewed Documents title */}
              <CardContent
                className="relative z-10 flex-1 overflow-visible flex flex-col"
              >
                {/* Reviewed document types summary */}
                <div className="mt-6 pt-0 h-full flex flex-col">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm items-stretch flex-1" style={{ gridAutoRows: '1fr' }}>
                    {docTypeDefinitions.map((doc) => {
                      const done = reviewedDocTypes[doc.key]
                      const label = language === 'bn' ? doc.labelBn : doc.labelEn
                      return (
                        <div
                          key={doc.key}
                          className={`h-full flex items-center justify-between px-3 py-2 rounded-lg transition-transform duration-200 ease-in-out transform ${
                            done ? 'bg-gradient-to-r from-emerald-900/30 to-emerald-900/10 ring-1 ring-emerald-400/20 shadow-[0_6px_18px_rgba(6,95,70,0.08)]' : 'bg-black/20 hover:scale-[1.02] hover:bg-white/2'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${done ? 'bg-emerald-500/10' : 'bg-white/2'} text-[13px]`}> 
                              <svg className={`w-4 h-4 ${done ? 'text-emerald-400 animate-pulse' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <div className={`truncate font-medium ${done ? 'text-emerald-200' : 'text-gray-300'}`}>{label}</div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {done ? (
                              <div className="w-7 h-7 rounded-full bg-emerald-600/20 flex items-center justify-center ring-1 ring-emerald-400/25">
                                <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                            ) : (
                              <div className="w-3 h-3 rounded-full bg-gray-600/40" />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <Button
                    className="w-full mt-4 lg:mt-6 btn-cool text-white"
                    size="sm"
                    disabled={Object.keys(reviewedDocTypes).length === 0 || isGenerating}
                    onClick={handleGenerateClick}
                  >
                    {isGenerating
                      ? (language === 'bn' ? 'Generating...' : 'Generating...')
                      : (language === 'bn' ? 'Generate' : 'Generate')}
                  </Button>
                  <Modal
                    open={showMissingModal}
                    onClose={() => setShowMissingModal(false)}
                    actions={null}
                    size={missingDocs.length <= 3 ? 'sm' : 'md'}
                  >
                    <div className="text-white/90 text-sm">
                      <div className="text-center font-semibold text-base">
                        {language === 'bn' ? 'প্রয়োজনীয় নথি' : 'Required Documents'}
                      </div>
                      <div className="mt-3">
                        <ul className="list-disc pl-5 space-y-1">
                          {missingDocs.map((doc, i) => (
                            <li key={i}>{doc}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-6 flex justify-center">
                        <Button
                          className="px-6 bg-white text-blue-900 hover:opacity-95"
                          onClick={() => setShowMissingModal(false)}
                        >
                          {language === 'bn' ? 'ঠিক আছে' : 'OK'}
                        </Button>
                      </div>
                    </div>
                  </Modal>

                  {/* Terms confirmation before generating PDF (single box, centered text) */}
                  <Modal
                    open={showGenerateTerms}
                    onClose={() => {
                      if (!isGenerating) setShowGenerateTerms(false)
                    }}
                    actions={null}
                   >
                    <p className="text-sm text-center text-gray-100">
                              {language === 'bn'
                                ? 'আপনি সম্মত যে প্রদত্ত তথ্যের ভিত্তিতে আপনার ট্যাক্স রিটার্ন তৈরি করা হবে এবং এটি শুধুমাত্র ডকুমেন্টেশন ও পরামর্শের জন্য ব্যবহৃত হবে।'
                                : 'By continuing, your tax return will be generated based on the uploaded documents'}
                    </p>
                    <div className="mt-6 flex gap-3 justify-between">
                      <Button
                        variant="ghost"
                        className="flex-1 text-white/90"
                        disabled={isGenerating}
                        onClick={() => { if (!isGenerating) setShowGenerateTerms(false) }}
                      >
                        {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                      </Button>
                      <Button
                        className="flex-1 bg-white text-blue-900 hover:opacity-95"
                        disabled={isGenerating}
                        onClick={handleConfirmGenerate}
                      >
                        {isGenerating
                          ? (language === 'bn' ? 'তৈরি হচ্ছে...' : 'Generating...')
                          : (language === 'bn' ? 'Continue' : 'Continue')}
                      </Button>
                    </div>
                  </Modal>

                  {/* Error popup if PDF generation fails (single box, centered text) */}
                  <Modal
                    open={!!generateError}
                    onClose={() => setGenerateError(null)}
                    actions={null}
                  >
                    <p className="text-sm text-center text-gray-100">
                      {generateError || (language === 'bn'
                        ? 'ট্যাক্স রিটার্ন তৈরি করা যায়নি। পরে আবার চেষ্টা করুন।'
                        : 'Failed to generate tax return. Please try again later.')}
                    </p>
                    <div className="mt-6 flex justify-center">
                      <Button
                        className="px-6 bg-white text-blue-900 hover:opacity-95"
                        onClick={() => setGenerateError(null)}
                      >
                        {language === 'bn' ? 'ঠিক আছে' : 'OK'}
                      </Button>
                    </div>
                  </Modal>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Chat Section */}
          <div className="flex flex-col">
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-500 flex flex-col h-[600px] md:h-[700px] lg:h-[calc(100vh-12rem)]">
              <CardHeader className="pb-3 border-b flex-shrink-0">
                <CardTitle className={`text-lg flex items-center gap-2 ${
                  language === 'bn' ? 'bangla-text' : ''
                }`}>
                  <MessageSquare className="h-5 w-5 text-primary" />
                  {t('nav.chat')}
                </CardTitle>
                <CardDescription className={language === 'bn' ? 'bangla-text text-sm' : 'text-sm'}>
                  {language === 'bn' 
                    ? 'কর সম্পর্কিত যেকোনো প্রশ্ন করুন' 
                    : 'Ask any tax-related questions'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden">
                <ChatBox
                  className="h-full"
                  externalLoading={isSummarizing}
                  externalLoadingText={
                    language === 'bn'
                      ? 'আপলোড করা ডকুমেন্টের সারাংশ তৈরি হচ্ছে...'
                      : 'Summarizing uploaded document...'
                  }
                  reloadTrigger={chatReloadToken}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Generation progress overlay */}
      {showGenerationOverlay && (
        <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-slate-900/95 shadow-[0_0_40px_rgba(59,130,246,0.35)] flex items-center justify-center border border-blue-500/40 animate-pulse">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-800 rounded-2xl blur-md opacity-60" />
                <Image
                  src="/logo.svg"
                  alt="Tax Assistant Logo"
                  width={40}
                  height={40}
                  className="h-10 w-10 relative z-10 drop-shadow-[0_0_18px_rgba(59,130,246,0.9)]"
                />
              </div>
            </div>
            <div
              key={generationStageIndex}
              className="text-base md:text-xl font-semibold text-white/95 transition-all duration-500 ease-out animate-fade-in-up"
            >
              {generationStages[generationStageIndex] || generationStages[generationStages.length - 1]}
            </div>
            <div className="flex gap-2 mt-1">
              {generationStages.map((_, index) => (
                <div
                  key={index}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index < generationStageIndex
                      ? 'bg-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.9)] scale-110'
                      : index === generationStageIndex
                        ? 'bg-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.8)] scale-100'
                        : 'bg-blue-900/60 scale-90'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Download-ready popup */}
      <Modal
        open={showDownloadModal && !!readyFile}
        onClose={() => {
          setShowDownloadModal(false)
        }}
        actions={null}
      >
        <p className="text-sm text-center text-gray-100">
          The Tax Return File is Ready
        </p>
        <div className="mt-6 flex gap-3 justify-between">
          <Button
            variant="ghost"
            className="flex-1 text-white/90"
            onClick={() => {
              setShowDownloadModal(false)
              setReadyFile(null)
            }}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-white text-blue-900 hover:opacity-95"
            onClick={handleDownloadReadyFile}
          >
            Download
          </Button>
        </div>
      </Modal>
    </div>
  )
}
