'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n-provider'
import { useAuth } from '@/lib/auth-provider'
import { Navbar } from '@/components/Navbar'
import { FileUploader } from '@/components/FileUploader'
import { ChatBox } from '@/components/ChatBox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileText, MessageSquare, CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function WorkspacePage() {
  const { t, language } = useI18n()
  const { isAuthenticated, initialized } = useAuth()
  const router = useRouter()
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([])

  React.useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, initialized, router])

  const handleFilesUpload = (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  if (!initialized) return null
  if (!isAuthenticated) {
    return null
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
          <div className="flex flex-col gap-4 md:gap-6 lg:h-[calc(100vh-12rem)]">
            {/* Upload Box */}
            <Card className="shadow-2xl border border-white/5 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-950/90 backdrop-blur-2xl hover:border-white/10 transition-all duration-700 flex-shrink-0 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <CardHeader className="pb-3 relative z-10">
                <CardTitle className={`text-lg flex items-center gap-2 text-white font-bold ${
                  language === 'bn' ? 'bangla-text' : ''
                }`}>
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/20 rounded-lg border border-blue-500/20">
                    <Upload className="h-5 w-5 text-blue-400" />
                  </div>
                  {language === 'bn' ? 'নথি আপলোড' : 'Upload Documents'}
                </CardTitle>
                <CardDescription className={`${language === 'bn' ? 'bangla-text text-sm' : 'text-sm'} text-gray-400`}>
                  {t('upload.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploader onFilesUpload={handleFilesUpload} maxFiles={10} hideInfo={false} showSizeNote={true} />
              </CardContent>
            </Card>

            {/* Uploaded Files List */}
            <Card className="shadow-2xl border border-white/5 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-950/90 backdrop-blur-2xl hover:border-white/10 transition-all duration-700 flex-1 min-h-0 overflow-hidden flex flex-col group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-lg flex items-center gap-2 text-white font-bold ${
                    language === 'bn' ? 'bangla-text' : ''
                  }`}>
                    <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/20">
                      <FileText className="h-5 w-5 text-green-400" />
                    </div>
                    {language === 'bn' ? 'আপলোড করা ফাইল' : 'Uploaded Files'}
                  </CardTitle>
                  {uploadedFiles.length > 0 && (
                    <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                      {uploadedFiles.length}
                    </span>
                  )}
                </div>
                {uploadedFiles.length > 0 && (
                  <CardDescription className={language === 'bn' ? 'bangla-text text-sm' : 'text-sm'}>
                    {language === 'bn' 
                      ? `${uploadedFiles.length} টি ফাইল সফলভাবে আপলোড হয়েছে` 
                      : `${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} uploaded successfully`}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40">
                {uploadedFiles.length > 0 ? (
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-3 bg-muted/50 hover:bg-muted/70 rounded-lg transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="p-2 bg-primary/10 rounded-md">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Upload className="h-12 w-12 md:h-16 md:w-16 mb-4 text-muted-foreground/50" />
                    <p className={`text-sm md:text-base font-medium text-muted-foreground mb-1 ${
                      language === 'bn' ? 'bangla-text' : ''
                    }`}>
                      {language === 'bn' 
                        ? 'কোনো ফাইল আপলোড করা হয়নি' 
                        : 'No files uploaded yet'}
                    </p>
                    <p className={`text-xs md:text-sm text-muted-foreground/70 ${
                      language === 'bn' ? 'bangla-text' : ''
                    }`}>
                      {language === 'bn' 
                        ? 'উপরে আপনার নথি আপলোড করুন' 
                        : 'Upload your documents above'}
                    </p>
                  </div>
                )}
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
                <ChatBox className="h-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
