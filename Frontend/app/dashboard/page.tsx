'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n-provider'
import { useAuth } from '@/lib/auth-provider'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  FileText,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Edit,
  
  
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { t, language } = useI18n()
  const { isAuthenticated, user } = useAuth()
  const [userData, setUserData] = React.useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    tin: '',
    nid: '',
    dateOfBirth: '',
    occupation: ''
  })

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    } else {
      // Load profile data from localStorage
      const savedProfile = localStorage.getItem('userProfile')
      if (savedProfile) {
        const profile = JSON.parse(savedProfile)
        setUserData({
          name: profile.name || '',
          phone: profile.phone || '',
          email: profile.email || '',
          address: profile.address || '',
          tin: profile.tin || '',
          nid: profile.nid || '',
          dateOfBirth: profile.dateOfBirth || '',
          occupation: profile.occupation || ''
        })
      } else {
        // Fallback from auth provider if no saved profile
        setUserData(prev => ({
          ...prev,
          name: (user?.name ?? prev.name) || '',
          email: (user?.email ?? prev.email) || '',
        }))
      }
    }
  }, [isAuthenticated, user, router])

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
          {/* Gradient orbs */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-float"></div>
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-float-slow"></div>
          <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px] opacity-50"></div>
        </div>
        
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-screen overflow-y-auto scrollbar-hide pt-20">
          {/* My Data Card - Large and Prominent */}
          <Card className="w-full max-w-6xl mx-auto shadow-2xl border border-white/5 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-950/90 backdrop-blur-2xl hover:border-white/10 transition-all duration-700 animate-fade-in-up relative overflow-hidden group">
            {/* Card shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <CardHeader className="pb-6 pt-12 border-b border-white/5 relative">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="space-y-4">
                  <div className={`inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-blue-400 text-xs font-bold tracking-wider uppercase backdrop-blur-sm animate-fade-in-scale ${
                    language === 'bn' ? 'bangla-text' : ''
                  }`}>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
                    {language === 'bn' ? 'প্রোফাইল' : 'Profile'}
                  </div>
                   <h1 className={`text-4xl md:text-5xl font-black flex items-center gap-4 tracking-tight text-white animate-fade-in-up animation-delay-200 ${
                    language === 'bn' ? 'bangla-text' : ''
                  }`}>
                    <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-500/20 rounded-2xl border border-blue-500/20 animate-scale-in animation-delay-200 shadow-lg shadow-blue-500/10">
                      <User className="h-8 w-8 text-blue-400" />
                    </div>
                    {language === 'bn' ? 'আমার তথ্য' : 'My Data'}
                  </h1>
                  <p className={`text-base text-gray-400 animate-fade-in-up animation-delay-400 ${
                    language === 'bn' ? 'bangla-text' : ''
                  }`}>{language === 'bn' ? 'আপনার ব্যক্তিগত তথ্য এবং প্রোফাইল বিবরণ' : 'Your personal information and profile details'}</p>
                </div>
                <Button variant="outline" size="lg" className={`text-base px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-500 text-white border-0 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 group/btn font-semibold animate-fade-in-scale animation-delay-600 ${
                  language === 'bn' ? 'bangla-text' : ''
                }`} onClick={() => router.push('/profile')}>
                  <Edit className="h-5 w-5 mr-2 group-hover/btn:rotate-12 transition-transform" />
                  {t('common.edit')}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="py-12 px-6 md:px-12 relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="flex items-start gap-5 rounded-2xl border border-white/5 bg-gradient-to-br from-gray-800/40 to-gray-900/40 p-6 hover:border-blue-500/30 hover:bg-gradient-to-br hover:from-gray-800/60 hover:to-gray-900/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 group backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="p-3.5 bg-gradient-to-br from-blue-500/20 to-blue-500/20 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border border-blue-500/20 shadow-lg shadow-blue-500/10 relative z-10">
                    <User className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="relative z-10">
                    <p className={`text-sm font-medium text-gray-500 mb-1 ${language === 'bn' ? 'bangla-text' : ''}`}>
                      {language === 'bn' ? 'পূর্ণ নাম' : 'Full Name'}
                    </p>
                    <p className={`font-bold text-xl text-white ${language === 'bn' ? 'bangla-text' : ''}`}>
                      {userData.name || '—'}
                    </p>
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="flex items-start gap-5 rounded-2xl border border-white/5 bg-gradient-to-br from-gray-800/40 to-gray-900/40 p-6 hover:border-blue-500/30 hover:bg-gradient-to-br hover:from-gray-800/60 hover:to-gray-900/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 group backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="p-3.5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border border-green-500/20 shadow-lg shadow-green-500/10 relative z-10">
                    <Phone className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="relative z-10">
                    <p className={`text-sm font-medium text-gray-500 mb-1 ${language === 'bn' ? 'bangla-text' : ''}`}>
                      {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
                    </p>
                    <p className={`font-bold text-xl text-white ${language === 'bn' ? 'bangla-text' : ''}`}>
                      {userData.phone || '—'}
                    </p>
                  </div>
                </div>

                {/* Email Address */}
                <div className="flex items-start gap-5 rounded-2xl border border-white/5 bg-gradient-to-br from-gray-800/40 to-gray-900/40 p-6 hover:border-blue-500/30 hover:bg-gradient-to-br hover:from-gray-800/60 hover:to-gray-900/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 group backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="p-3.5 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border border-blue-500/20 shadow-lg shadow-blue-500/10 relative z-10">
                    <Mail className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="relative z-10">
                    <p className={`text-sm font-medium text-gray-500 mb-1 ${language === 'bn' ? 'bangla-text' : ''}`}>
                      {language === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}
                    </p>
                    <p className={`font-bold text-xl text-white ${language === 'bn' ? 'bangla-text' : ''}`}>
                      {userData.email || '—'}
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-5 rounded-2xl border border-white/5 bg-gradient-to-br from-gray-800/40 to-gray-900/40 p-6 hover:border-blue-500/30 hover:bg-gradient-to-br hover:from-gray-800/60 hover:to-gray-900/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 group backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="p-3.5 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border border-orange-500/20 shadow-lg shadow-orange-500/10 relative z-10">
                    <MapPin className="h-6 w-6 text-orange-400" />
                  </div>
                  <div className="relative z-10">
                    <p className={`text-sm font-medium text-gray-500 mb-1 ${language === 'bn' ? 'bangla-text' : ''}`}>
                      {language === 'bn' ? 'ঠিকানা' : 'Address'}
                    </p>
                    <p className={`font-bold text-xl text-white ${language === 'bn' ? 'bangla-text' : ''}`}>
                      {userData.address || '—'}
                    </p>
                  </div>
                </div>

                {/* TIN Number */}
                <div className="flex items-start gap-5 rounded-2xl border border-white/5 bg-gradient-to-br from-gray-800/40 to-gray-900/40 p-6 hover:border-blue-500/30 hover:bg-gradient-to-br hover:from-gray-800/60 hover:to-gray-900/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 group backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="p-3.5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border border-cyan-500/20 shadow-lg shadow-cyan-500/10 relative z-10">
                    <CreditCard className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div className="relative z-10">
                    <p className={`text-sm font-medium text-gray-500 mb-1 ${language === 'bn' ? 'bangla-text' : ''}`}>
                      {language === 'bn' ? 'টিআইএন নম্বর' : 'TIN Number'}
                    </p>
                    <p className={`font-bold text-xl text-white ${language === 'bn' ? 'bangla-text' : ''}`}>
                      {userData.tin || '—'}
                    </p>
                  </div>
                </div>

                {/* NID Number */}
                <div className="flex items-start gap-5 rounded-2xl border border-white/5 bg-gradient-to-br from-gray-800/40 to-gray-900/40 p-6 hover:border-blue-500/30 hover:bg-gradient-to-br hover:from-gray-800/60 hover:to-gray-900/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 group backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="p-3.5 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border border-indigo-500/20 shadow-lg shadow-indigo-500/10 relative z-10">
                    <CreditCard className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div className="relative z-10">
                    <p className={`text-sm font-medium text-gray-500 mb-1 ${language === 'bn' ? 'bangla-text' : ''}`}>
                      {language === 'bn' ? 'এনআইডি নম্বর' : 'NID Number'}
                    </p>
                    <p className={`font-bold text-xl text-white ${language === 'bn' ? 'bangla-text' : ''}`}>
                      {userData.nid || '—'}
                    </p>
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="flex items-start gap-5 rounded-2xl border border-white/5 bg-gradient-to-br from-gray-800/40 to-gray-900/40 p-6 hover:border-blue-500/30 hover:bg-gradient-to-br hover:from-gray-800/60 hover:to-gray-900/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 group backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="p-3.5 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border border-yellow-500/20 shadow-lg shadow-yellow-500/10 relative z-10">
                    <Calendar className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="relative z-10">
                    <p className={`text-sm font-medium text-gray-500 mb-1 ${language === 'bn' ? 'bangla-text' : ''}`}>
                      {language === 'bn' ? 'জন্ম তারিখ' : 'Date of Birth'}
                    </p>
                    <p className={`font-bold text-xl text-white ${language === 'bn' ? 'bangla-text' : ''}`}>
                      {userData.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString('en-GB', { timeZone: 'UTC' }) : '—'}
                    </p>
                  </div>
                </div>

                {/* Occupation */}
                <div className="flex items-start gap-5 rounded-2xl border border-white/5 bg-gradient-to-br from-gray-800/40 to-gray-900/40 p-6 hover:border-blue-500/30 hover:bg-gradient-to-br hover:from-gray-800/60 hover:to-gray-900/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 group backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="p-3.5 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border border-teal-500/20 shadow-lg shadow-teal-500/10 relative z-10">
                    <FileText className="h-6 w-6 text-teal-400" />
                  </div>
                  <div className="relative z-10">
                    <p className={`text-sm font-medium text-gray-500 mb-1 ${language === 'bn' ? 'bangla-text' : ''}`}>
                      {language === 'bn' ? 'পেশা' : 'Occupation'}
                    </p>
                    <p className={`font-bold text-xl text-white ${language === 'bn' ? 'bangla-text' : ''}`}>
                      {userData.occupation || '—'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    );
  }
