'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n-provider'
import { userAPI } from '@/lib/api'
import { Navbar } from '@/components/Navbar'
import { FileUploader } from '@/components/FileUploader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Upload, 
  Shield,
  CheckCircle,
  Calendar,
  UserX
} from 'lucide-react'

export default function UploadPage() {
  const { t } = useI18n()
  const router = useRouter()
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([])
  const [profileComplete, setProfileComplete] = React.useState(false)
  const [missingFields, setMissingFields] = React.useState<string[]>([])

  const checkProfileCompletion = React.useCallback(async () => {
    // Always treat the backend profile as the source of truth so that
    // once the user has completed their profile, they don't need to
    // re-enter it just because local storage was cleared or is stale.
    try {
      const res = await userAPI.getProfile()
      const u = res.data

      if (!u) {
        setProfileComplete(false)
        setMissingFields(['All profile information'])
        return
      }

      const profileFromServer = {
        name: u.name || '',
        email: u.email || '',
        nid: u.nid || '',
        tin: u.tin || '',
        dateOfBirth: u.date_of_birth || '',
        phone: u.phone || '',
        address: u.address || '',
        occupation: u.occupation || '',
      }

      // Keep a local cache for other pages, but always based on server.
      localStorage.setItem('userProfile', JSON.stringify(profileFromServer))

      const profile = profileFromServer
      const missing: string[] = []

      if (!profile.nid || profile.nid.trim() === '') {
        missing.push('NID Number')
      }
      if (!profile.tin || profile.tin.trim() === '') {
        missing.push('TIN Number')
      }

      if (missing.length > 0) {
        setProfileComplete(false)
        setMissingFields(missing)
      } else {
        setProfileComplete(true)
        setMissingFields([])
      }
    } catch (err) {
      // If backend profile cannot be loaded, treat as incomplete
      setProfileComplete(false)
      setMissingFields(['All profile information'])
    }
  }, [])

  React.useEffect(() => {
    // Initial check
    checkProfileCompletion()

    // Re-check when window gains focus (user returns from profile page)
    const handleFocus = () => {
      checkProfileCompletion()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [checkProfileCompletion])

  const handleFilesUpload = (files: File[]) => {
    if (!profileComplete) {
      return
    }
    setUploadedFiles(prev => [...prev, ...files])
  }

  // supportedDocuments removed (no longer used)

  const processingSteps = [
    {
      step: 1,
      title: "Upload Documents",
      description: "Drag and drop or select your tax documents",
      status: uploadedFiles.length > 0 ? "completed" : "current"
    },
    {
      step: 2,
      title: "AI Processing",
      description: "Our AI extracts and validates information",
      status: uploadedFiles.length > 0 ? "current" : "pending"
    },
    {
      step: 3,
      title: "Review & Submit",
      description: "Review extracted data and submit your return",
      status: "pending"
    }
  ]

  return (
    <div className="h-screen overflow-hidden relative bg-[#0a0a0a] dark:bg-[#0a0a0a]">
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
      
      <div className="h-[calc(100vh-5rem)] overflow-y-auto scrollbar-hide pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Upload className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl md:text-4xl font-black text-white">
              {t('upload.title')}
            </h1>
          </div>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {t('upload.subtitle')}
          </p>
        </div>

        {/* Profile Incomplete Warning */}
        {!profileComplete && (
          <Card className="mb-8 border-2 border-red-500/30 bg-red-950/20 backdrop-blur-xl shadow-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <UserX className="h-8 w-8 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-400 mb-2">
                    Complete Your Profile First
                  </h3>
                  <p className="text-gray-300 mb-3">
                    You must complete your profile with NID and TIN information before uploading documents.
                  </p>
                  <div className="bg-red-900/30 rounded-lg p-3 mb-4">
                    <p className="text-sm font-medium text-red-300 mb-2">Missing Information:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {missingFields.map((field, index) => (
                        <li key={index} className="text-sm text-gray-300">{field}</li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    onClick={() => router.push('/profile?edit=1')}
                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
                  >
                    Complete Profile Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upload Interface */}
          <div className="lg:col-span-2 space-y-6">
            <div className={!profileComplete ? 'opacity-50 pointer-events-none' : ''}>
              <FileUploader onFilesUpload={handleFilesUpload} />
            </div>

            {/* Supported Documents card removed as requested */}

            {/* Processing Steps */}
            <Card className="shadow-2xl border border-white/5 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-950/90 backdrop-blur-2xl hover:border-white/10 transition-all duration-700 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-white font-bold">Processing Steps</CardTitle>
                <CardDescription className="text-gray-400">
                  Follow these steps to complete your tax filing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {processingSteps.map((step) => (
                    <div key={step.step} className="flex items-start space-x-4">
                      <div className={`
                        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                        ${step.status === 'completed' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                          : step.status === 'current'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                        }
                      `}>
                        {step.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : step.status === 'current' ? (
                          <Calendar className="h-4 w-4" />
                        ) : (
                          step.step
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Security Notice */}
            <Card className="shadow-2xl border border-white/5 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-950/90 backdrop-blur-2xl hover:border-white/10 transition-all duration-700 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center space-x-2 text-lg text-white font-bold">
                  <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/20">
                    <Shield className="h-5 w-5 text-green-400" />
                  </div>
                  <span>Secure Upload</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm relative z-10">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">All uploads are encrypted end-to-end</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">Documents are processed locally when possible</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">Your data is never shared with third parties</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">Files are automatically deleted after processing</span>
                </div>
              </CardContent>
            </Card>

            {/* Help Button */}
            <Button className="w-full" variant="outline">
              Need Help? Contact Support
            </Button>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}