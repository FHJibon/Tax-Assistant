'use client'

import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { authAPI, userAPI } from '@/lib/api'
import { useAuth } from '@/lib/auth-provider'
import { useI18n } from '@/lib/i18n-provider'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import dynamic from 'next/dynamic'
import { Calendar as CalendarIcon } from 'lucide-react'
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

const Popover = dynamic(() => import('@/components/ui/popover').then(m => m.Popover), { ssr: false })
const PopoverTrigger = dynamic(() => import('@/components/ui/popover').then(m => m.PopoverTrigger), { ssr: false })
const PopoverContent = dynamic(() => import('@/components/ui/popover').then(m => m.PopoverContent), { ssr: false })
const DateCalendar = dynamic(() => import('@/components/ui/calendar').then(m => m.Calendar), { ssr: false })

function ProfilePageInner() {
  const { t, language, setLanguage } = useI18n()
  const { user } = useAuth()
  const searchParams = useSearchParams()
  
  const [isEditing, setIsEditing] = React.useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = React.useState(false)
  const [saveMsg, setSaveMsg] = React.useState('')
  const [saveBusy, setSaveBusy] = React.useState(false)
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

  // Derived validations for Bangladeshi IDs
  // NID can be 10, 13, or 17 digits
  const nidValid = React.useMemo(() => {
    const s = (profile.nid || '').trim()
    return /^[0-9]{10}$/.test(s) || /^[0-9]{13}$/.test(s) || /^[0-9]{17}$/.test(s)
  }, [profile.nid])

  // Track if NID input was blurred
  const [nidTouched, setNidTouched] = React.useState(false)

  const tinValid = React.useMemo(() => {
    const s = (profile.tin || '').trim()
    return /^[0-9]{12}$/.test(s)
  }, [profile.tin])

  // Track if TIN input was blurred
  const [tinTouched, setTinTouched] = React.useState(false)

  // Phone: allow empty, otherwise must be exactly 11 digits
  const phoneValid = React.useMemo(() => {
    const s = (profile.phone || '').trim()
    if (!s) return true
    return /^[0-9]{11}$/.test(s)
  }, [profile.phone])

  // Track if phone input was blurred at least once
  const [phoneTouched, setPhoneTouched] = React.useState(false)

  React.useEffect(() => {
    // Auto-open edit mode when requested via query param
    const editParam = searchParams?.get('edit')
    if (editParam === '1' || editParam === 'true') {
      setIsEditing(true)
    }

    // Hydrate from any cached profile first so fields like phone/address
    // persist between visits even before the backend profile loads.
    const savedProfile = localStorage.getItem('userProfile')
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile)
        setProfile(prev => ({ ...prev, ...parsed }))
      } catch {
        // ignore invalid cache
      }
    }

    // Then hydrate from auth user and backend profile (source of truth
    // for name/email/NID/TIN/DOB and now phone/address/occupation too).
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
      }))
    }
    userAPI.getProfile()
      .then(res => {
        const u = res.data
        setProfile(prev => ({
          ...prev,
          name: u?.name ?? prev.name,
          email: u?.email ?? prev.email,
          nid: u?.nid ?? prev.nid,
          tin: u?.tin ?? prev.tin,
          dateOfBirth: u?.date_of_birth ?? prev.dateOfBirth,
          phone: u?.phone ?? prev.phone,
          address: u?.address ?? prev.address,
          occupation: u?.occupation ?? prev.occupation,
        }))
        // sync cache with server so all profile fields (including
        // phone/address/occupation) persist locally
        const cached = savedProfile ? (() => { try { return JSON.parse(savedProfile) } catch { return {} } })() : {}
        const local = {
          ...cached,
          name: u?.name || '',
          email: u?.email || '',
          nid: u?.nid || '',
          tin: u?.tin || '',
          dateOfBirth: u?.date_of_birth || '',
          phone: u?.phone || '',
          address: u?.address || '',
          occupation: u?.occupation || '',
        }
        localStorage.setItem('userProfile', JSON.stringify(local))
      })
      .catch((err: any) => {
        const status = err?.response?.status
        if (status === 401 || status === 404) {
          // Clear stale cache and bounce to login
          localStorage.removeItem('userProfile')
          localStorage.removeItem('userEmail')
          localStorage.removeItem('userName')
          if (typeof window !== 'undefined') window.location.href = '/login'
        } else if (savedProfile) {
          setProfile(JSON.parse(savedProfile))
        }
      })
  }, [user, searchParams])

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
  
  const handleSaveProfile = async () => {
    if (!nidValid || !tinValid || !phoneValid) return
    setSaveMsg('')
    setSaveBusy(true)
    try {
      await userAPI.updateProfile({
        name: profile.name,
        nid: profile.nid,
        tin: profile.tin,
        date_of_birth: profile.dateOfBirth || undefined,
        phone: profile.phone || undefined,
        address: profile.address || undefined,
        occupation: profile.occupation || undefined,
      })
      // Re-fetch from backend so UI reflects persisted server truth
      const refreshed = await userAPI.getProfile()
      const updated = refreshed.data
      // Persist minimal profile locally for client gating flows
      const local = {
        ...profile,
        name: updated?.name ?? profile.name,
        email: updated?.email ?? profile.email,
        nid: updated?.nid ?? profile.nid,
        tin: updated?.tin ?? profile.tin,
        dateOfBirth: updated?.date_of_birth ?? profile.dateOfBirth,
        phone: updated?.phone ?? profile.phone,
        address: updated?.address ?? profile.address,
        occupation: updated?.occupation ?? profile.occupation,
      }
      localStorage.setItem('userProfile', JSON.stringify(local))
      setProfile(local)
      setIsEditing(false)
      setShowSaveSuccess(true)
      setTimeout(() => setShowSaveSuccess(false), 3000)
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to save profile'
      setSaveMsg(msg)
    } finally {
      setSaveBusy(false)
    }
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
        {(showSaveSuccess || saveMsg) && (
          <div className="mb-6 animate-in slide-in-from-top-2 duration-300">
            <Card className={`backdrop-blur-xl ${saveMsg ? 'border-2 border-red-500/30 bg-red-950/20' : 'border-2 border-green-500/30 bg-green-950/20'}` }>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className={`h-5 w-5 flex-shrink-0 ${saveMsg ? 'text-red-400' : 'text-green-400'}`} />
                  <div>
                    {saveMsg ? (
                      <>
                        <p className="font-semibold text-red-400">
                          {language === 'bn' ? 'প্রোফাইল সংরক্ষণ ব্যর্থ হয়েছে' : 'Profile save failed'}
                        </p>
                        <p className="text-sm text-gray-300">{saveMsg}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-green-400 font-semibold">
                          {language === 'bn' ? 'প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে!' : 'Profile saved successfully!'}
                        </p>
                        <p className="text-sm text-gray-300">
                          {language === 'bn' ? 'আপনি এখন ডকুমেন্ট আপলোড করতে পারবেন' : 'You can now upload documents'}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Removed inline profile prompt; upload flow will handle popup */}

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
                    {/* Removed profile details update description as requested */}
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
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, '')
                          setProfile({ ...profile, phone: digitsOnly })
                          if (phoneTouched) setPhoneTouched(false)
                        }}
                        onBlur={() => setPhoneTouched(true)}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                    {isEditing && phoneTouched && profile.phone && !phoneValid && (
                      <div className="text-xs text-red-400">
                        {language === 'bn' ? 'ফোন নম্বর ১১ সংখ্যার হতে হবে' : 'Phone number must be exactly 11 digits'}
                      </div>
                    )}
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
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, '')
                        setProfile({ ...profile, nid: digitsOnly })
                        if (nidTouched) setNidTouched(false)
                      }}
                      onBlur={() => setNidTouched(true)}
                      disabled={!isEditing}
                      placeholder="Enter your National ID"
                    />
                    {isEditing && nidTouched && (!profile.nid || !nidValid) && (
                      <div className="text-xs text-red-400">
                        {language === 'bn'
                          ? (!profile.nid ? 'NID ফাঁকা রাখা যাবে না' : 'NID ১০, ১৩ বা ১৭ সংখ্যার হতে হবে')
                          : (!profile.nid ? 'NID cannot be empty' : 'NID must be 10, 13 or 17 digits')}
                      </div>
                    )}
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
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, '')
                        setProfile({ ...profile, tin: digitsOnly })
                        if (tinTouched) setTinTouched(false)
                      }}
                      onBlur={() => setTinTouched(true)}
                      disabled={!isEditing}
                      placeholder="Enter your TIN"
                    />
                    {isEditing && tinTouched && (!profile.tin || !tinValid) && (
                      <div className="text-xs text-red-400">
                        {language === 'bn'
                          ? (!profile.tin ? 'TIN ফাঁকা রাখা যাবে না' : 'TIN ১২ সংখ্যার হতে হবে')
                          : (!profile.tin ? 'TIN cannot be empty' : 'TIN must be 12 digits')}
                      </div>
                    )}
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
                    <Button onClick={handleSaveProfile} className="flex-1" disabled={!nidValid || !tinValid || saveBusy}>
                      <Save className="h-4 w-4 mr-2" />
                      {saveBusy ? (language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (language === 'bn' ? 'পরিবর্তন সংরক্ষণ' : 'Save Changes')}
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
            <Card className="border border-white/10 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-950/90 animate-bounce-in">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in">
          <div className="w-full max-w-sm">
            <Card className="border border-white/10 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-950/90 animate-bounce-in">
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
                      let message = 'Failed to change password'
                      const detail = err?.response?.data?.detail

                      if (typeof detail === 'string') {
                        message = detail
                      } else if (Array.isArray(detail) && detail.length > 0) {
                        const first = detail[0]
                        if (typeof first?.msg === 'string') {
                          message = first.msg
                        }
                      } else if (err?.message) {
                        message = err.message
                      }

                      setCpMsg(message)
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

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfilePageInner />
    </Suspense>
  )
}
