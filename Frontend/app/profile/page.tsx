'use client'

import React from 'react'
import { useAuth } from '@/lib/auth-provider'
import { useI18n } from '@/lib/i18n-provider'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Calendar as DateCalendar } from '@/components/ui/calendar'
import { format as formatDate } from 'date-fns'
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Save,
  Edit2,
  Lock,
  Globe,
  Shield,
  CheckCircle
} from 'lucide-react'

export default function ProfilePage() {
  const { t, language, setLanguage } = useI18n()
  const { user } = useAuth()
  
  const [isEditing, setIsEditing] = React.useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = React.useState(false)
  const [profile, setProfile] = React.useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    nid: '',
    tin: '',
    dateOfBirth: '',
    occupation: ''
  })
  const [cpOpen, setCpOpen] = React.useState(false)
  const [cpCurrent, setCpCurrent] = React.useState('')
  const [cpNew, setCpNew] = React.useState('')
  const [cpConfirm, setCpConfirm] = React.useState('')
  const [cpNewTouched, setCpNewTouched] = React.useState(false)
  const [cpConfirmTouched, setCpConfirmTouched] = React.useState(false)
  const [cpMsg, setCpMsg] = React.useState('')
  const [delBusy, setDelBusy] = React.useState(false)
  const [delOpen, setDelOpen] = React.useState(false)
  const [delMsg, setDelMsg] = React.useState('')
  const [dobDate, setDobDate] = React.useState<Date | null>(null)
  const dobTriggerRef = React.useRef<HTMLButtonElement | null>(null)
  const [triggerWidth, setTriggerWidth] = React.useState<number | undefined>(undefined)

  React.useEffect(() => {
    // Prefer saved profile; otherwise hydrate from auth user
    const savedProfile = localStorage.getItem('userProfile')
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile))
    } else if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
      }))
    }
  }, [user])

  React.useEffect(() => {
    if (profile.dateOfBirth) {
      const d = new Date(profile.dateOfBirth)
      if (!isNaN(d.getTime())) setDobDate(d)
    } else {
      setDobDate(null)
    }
  }, [profile.dateOfBirth])

  React.useEffect(() => {
    const updateWidth = () => {
      const w = dobTriggerRef.current?.getBoundingClientRect().width
      setTriggerWidth(w)
    }
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [isEditing])
  
  const handleSaveProfile = () => {
    // Save profile to localStorage
    localStorage.setItem('userProfile', JSON.stringify(profile))
    setIsEditing(false)
    setShowSaveSuccess(true)
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSaveSuccess(false)
    }, 3000)
  }

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
      
      <div className="container mx-auto px-4 max-w-7xl h-screen overflow-y-auto scrollbar-hide pt-20">
        {/* Success Message */}
        {showSaveSuccess && (
          <div className="mb-6 animate-in slide-in-from-top-2 duration-300">
            <Card className="border-2 border-green-500/30 bg-green-950/20 backdrop-blur-xl">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-green-400 font-semibold">
                      {language === 'bn' ? 'প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে!' : 'Profile saved successfully!'}
                    </p>
                    <p className="text-sm text-gray-300">
                      {language === 'bn' ? 'আপনি এখন ডকুমেন্ট আপলোড করতে পারবেন' : 'You can now upload documents'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-500/20 rounded-2xl border border-blue-500/20">
              <User className="h-8 w-8 text-blue-400" />
            </div>
            <h1 className={`text-3xl md:text-4xl lg:text-5xl font-black text-white ${
              language === 'bn' ? 'bangla-text' : ''
            }`}>
              {language === 'bn' ? 'প্রোফাইল সেটিংস' : 'Profile Settings'}
            </h1>
          </div>
          <p className={`text-base md:text-lg text-muted-foreground max-w-2xl mx-auto ${
            language === 'bn' ? 'bangla-text' : ''
          }`}>
            {language === 'bn' 
              ? 'আপনার ব্যক্তিগত তথ্য এবং পছন্দ পরিচালনা করুন' 
              : 'Manage your personal information and preferences'}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 md:gap-6 items-start">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Personal Information */}
            <Card className="shadow-2xl border border-white/5 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-950/90 backdrop-blur-2xl hover:border-white/10 transition-all duration-700 group relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className={`flex items-center space-x-2 ${
                      language === 'bn' ? 'bangla-text' : ''
                    }`}>
                      <User className="h-5 w-5" />
                      <span>{language === 'bn' ? 'ব্যক্তিগত তথ্য' : 'Personal Information'}</span>
                    </CardTitle>
                    <CardDescription className={language === 'bn' ? 'bangla-text' : ''}>
                      {language === 'bn' 
                        ? 'আপনার প্রোফাইল বিস্তারিত আপডেট করুন' 
                        : 'Update your profile details'}
                    </CardDescription>
                  </div>
                  {!isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      {language === 'bn' ? 'সম্পাদনা' : 'Edit'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${
                      language === 'bn' ? 'bangla-text' : ''
                    }`}>
                      {language === 'bn' ? 'পূর্ণ নাম' : 'Full Name'}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${
                      language === 'bn' ? 'bangla-text' : ''
                    }`}>
                      {language === 'bn' ? 'ইমেইল' : 'Email'}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${
                      language === 'bn' ? 'bangla-text' : ''
                    }`}>
                      {language === 'bn' ? 'ফোন' : 'Phone'}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${
                      language === 'bn' ? 'bangla-text' : ''
                    }`}>
                      {language === 'bn' ? 'জন্ম তারিখ' : 'Date of Birth'}
                    </label>
                    <Popover>
                      <PopoverTrigger asChild disabled={!isEditing}>
                        <Button
                          ref={dobTriggerRef}
                          variant="outline"
                          className="w-full justify-start h-10 px-3 text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dobDate ? formatDate(dobDate, 'PPP') : (
                            language === 'bn' ? 'তারিখ নির্বাচন করুন' : 'Pick a date'
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0" align="start" style={{ width: triggerWidth ? `${triggerWidth}px` : undefined }}>
                        <DateCalendar
                          value={dobDate}
                          onChange={(d) => {
                            setDobDate(d)
                            setProfile({
                              ...profile,
                              dateOfBirth: d ? formatDate(d, 'yyyy-MM-dd') : ''
                            })
                          }}
                          disabled={(d) => d.getTime() > new Date().getTime()}
                          initialMonth={dobDate ?? new Date(2000, 0, 1)}
                          className="p-3"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label className={`text-sm font-medium ${
                      language === 'bn' ? 'bangla-text' : ''
                    }`}>
                      {language === 'bn' ? 'ঠিকানা' : 'Address'}
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        value={profile.address}
                        onChange={(e) => setProfile({...profile, address: e.target.value})}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${
                      language === 'bn' ? 'bangla-text' : ''
                    }`}>
                      {language === 'bn' ? 'এনআইডি নম্বর' : 'NID Number'}
                    </label>
                    <Input
                      type="text"
                      value={profile.nid}
                      onChange={(e) => setProfile({...profile, nid: e.target.value})}
                      disabled={!isEditing}
                      placeholder="Enter your National ID"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${
                      language === 'bn' ? 'bangla-text' : ''
                    }`}>
                      {language === 'bn' ? 'টিআইএন নম্বর' : 'TIN Number'}
                    </label>
                    <Input
                      type="text"
                      value={profile.tin}
                      onChange={(e) => setProfile({...profile, tin: e.target.value})}
                      disabled={!isEditing}
                      placeholder="Enter your TIN"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label className={`text-sm font-medium ${
                      language === 'bn' ? 'bangla-text' : ''
                    }`}>
                      {language === 'bn' ? 'পেশা' : 'Occupation'}
                    </label>
                    <Input
                      type="text"
                      value={profile.occupation}
                      onChange={(e) => setProfile({...profile, occupation: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex space-x-4 pt-4">
                    <Button onClick={handleSaveProfile} className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      {language === 'bn' ? 'পরিবর্তন সংরক্ষণ' : 'Save Changes'}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      {language === 'bn' ? 'বাতিল' : 'Cancel'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Sidebar */}
          <div className="flex flex-col space-y-4 md:space-y-6 h-full">
            {/* Language Settings */}
            <Card className="shadow-2xl border border-white/5 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-950/90 backdrop-blur-2xl hover:border-white/10 transition-all duration-700 group relative overflow-hidden flex-1">
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <CardHeader>
                <CardTitle className={`flex items-center space-x-2 text-sm ${
                  language === 'bn' ? 'bangla-text' : ''
                }`}>
                  <Globe className="h-4 w-4" />
                  <span>{language === 'bn' ? 'ভাষা সেটিংস' : 'Language Settings'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${
                    language === 'bn' ? 'bangla-text' : ''
                  }`}>
                    {language === 'bn' ? 'পছন্দের ভাষা' : 'Preferred Language'}
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="en">English</option>
                    <option value="bn">বাংলা (Bengali)</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="shadow-2xl border border-white/5 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-950/90 backdrop-blur-2xl hover:border-white/10 transition-all duration-700 group relative overflow-hidden flex-1">
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <CardHeader>
                <CardTitle className={`flex items-center space-x-2 text-sm ${
                  language === 'bn' ? 'bangla-text' : ''
                }`}>
                  <Shield className="h-4 w-4" />
                  <span>{language === 'bn' ? 'নিরাপত্তা' : 'Security'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-12 justify-start"
                  onClick={() => { setCpMsg(''); setCpOpen(true) }}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {language === 'bn' ? 'পাসওয়ার্ড পরিবর্তন' : 'Change Password'}
                </Button>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="shadow-2xl border border-white/5 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-950/90 backdrop-blur-2xl hover:border-white/10 transition-all duration-700 group relative overflow-hidden flex-1">
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <CardHeader>
                <CardTitle className={`flex items-center space-x-2 text-sm ${
                  language === 'bn' ? 'bangla-text' : ''
                }`}>
                  <User className="h-4 w-4" />
                  <span>{language === 'bn' ? 'অ্যাকাউন্ট অ্যাকশন' : 'Account Actions'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={delBusy}
                  onClick={() => { setDelMsg(''); setDelOpen(true) }}
                >
                  {language === 'bn' ? 'অ্যাকাউন্ট মুছুন' : 'Delete Account'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {delOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm">
            <Card className="border border-white/10 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-950/90 animate-slide-in">
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold text-white">
                  {language === 'bn' ? 'অ্যাকাউন্ট মুছুন' : 'Delete Account'}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {language === 'bn' ? 'আপনি কি সত্যিই আপনার অ্যাকাউন্টটি মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।' : 'Are you sure you want to delete your account? This action cannot be undone.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {delMsg && <div className="text-sm text-gray-300">{delMsg}</div>}
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={delBusy}
                    onClick={async () => {
                      setDelMsg('')
                      setDelBusy(true)
                      try {
                        const { authAPI } = await import('@/lib/api')
                        const res = await authAPI.deleteAccount(true)
                        if (res.status === 200) {
                          localStorage.removeItem('token')
                          localStorage.removeItem('userEmail')
                          localStorage.removeItem('userName')
                          localStorage.removeItem('userProfile')
                          window.location.href = '/login'
                        } else {
                          setDelMsg('Failed to delete account')
                        }
                      } catch (err: any) {
                        setDelMsg(err?.response?.data?.detail || 'Failed to delete account')
                      } finally {
                        setDelBusy(false)
                      }
                    }}
                  >
                    {language === 'bn' ? 'হ্যাঁ, মুছুন' : 'Yes, Delete'}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setDelOpen(false)}
                  >
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      {cpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm">
            <Card className="border border-white/10 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-950/90">
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold text-white">Change Password</CardTitle>
                <CardDescription className="text-gray-400">Enter current and new password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input type="password" value={cpCurrent} onChange={(e) => setCpCurrent(e.target.value)} placeholder="Current password" />
                <Input type="password" value={cpNew} onChange={(e) => setCpNew(e.target.value)} onBlur={() => setCpNewTouched(true)} placeholder="New password" />
                {cpNewTouched && cpNew && cpNew.length < 8 && (
                  <div className="text-sm text-red-400">New password must be at least 8 characters</div>
                )}
                <Input type="password" value={cpConfirm} onChange={(e) => setCpConfirm(e.target.value)} onBlur={() => setCpConfirmTouched(true)} placeholder="Confirm new password" />
                {cpConfirmTouched && cpConfirm && cpNew && cpNew !== cpConfirm && (
                  <div className="text-sm text-red-400">New passwords do not match</div>
                )}
                {cpMsg && <div className="text-sm text-gray-300">{cpMsg}</div>}
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={async () => {
                    setCpMsg('')
                    if (!cpCurrent || !cpNew || !cpConfirm) { setCpMsg('All fields are required'); return }
                    if (cpNew.length < 8) { setCpMsg('New password must be at least 8 characters'); return }
                    if (cpNew !== cpConfirm) { setCpMsg('New passwords do not match'); return }
                    try {
                      const { authAPI } = await import('@/lib/api')
                      const res = await authAPI.changePassword(cpCurrent, cpNew)
                      if (res.status === 200) {
                        setCpMsg('Password changed successfully')
                        setTimeout(() => setCpOpen(false), 900)
                      } else {
                        setCpMsg('Failed to change password')
                      }
                    } catch (err: any) {
                      setCpMsg(err?.response?.data?.detail || 'Failed to change password')
                    }
                  }}>Save</Button>
                  <Button variant="outline" className="flex-1" onClick={() => setCpOpen(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
