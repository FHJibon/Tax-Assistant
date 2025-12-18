import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

const resources = {
  en: {
    translation: {
      // Navigation
      'nav.home': 'Home',
      'nav.chat': 'Tax Assistant',
      'nav.upload': 'Upload Documents',
      'nav.workspace': 'Workspace',
      'nav.calculation': 'Calculation',
      'nav.dashboard': 'Dashboard',
      'nav.login': 'Login',
      'nav.signup': 'Sign Up',
      
      // Landing Page
      'landing.title': 'AI Tax & Law Assistant',
      'landing.subtitle': 'Smart tax filing and legal guidance for Bangladesh',
      'landing.cta': 'Start Filing',
      'landing.feature1': 'AI-Powered Assistance',
      'landing.feature1.desc': 'Get instant answers to your tax and legal questions',
      'landing.feature2': 'Document Processing',
      'landing.feature2.desc': 'Upload and process your tax documents automatically',
      'landing.feature3': 'Bilingual Support',
      'landing.feature3.desc': 'Available in both English and Bengali',
      'landing.whyChoose': 'Why Choose Our AI Assistant?',
      'landing.whyChoose.desc': 'Experience the future of tax filing with our intelligent, bilingual assistant',
      'landing.benefits.title': 'Everything You Need for Tax Filing',
      'landing.benefits.desc': 'Our comprehensive platform provides all the tools and guidance you need to file your taxes correctly and efficiently.',
      'landing.benefits.1': 'Expert AI guidance for Bangladesh tax laws',
      'landing.benefits.2': 'Automated document processing',
      'landing.benefits.3': 'Multi-language support (Bengali & English)',
      'landing.benefits.4': 'Secure and confidential',
      'landing.benefits.5': 'Real-time tax calculations',
      'landing.benefits.6': '24/7 availability',
      'landing.security.title': 'Secure & Confidential',
      'landing.security.desc': 'Your tax information is protected with bank-level security and encryption. We never store or share your personal data.',
      'landing.security.available': '24/7 Available',
      'landing.security.secure': 'Bank-level Security',
      'landing.cta2.title': 'Ready to Simplify Your Tax Filing?',
      'landing.cta2.desc': 'Join thousands of users who trust our AI assistant for their tax needs',
      'landing.cta2.start': 'Get Started Free',
      'landing.cta2.demo': 'Try Demo',
      'landing.footer': 'All rights reserved.',
      
      // Chat
      'chat.placeholder': 'Ask me about taxes, laws, or filing procedures...',
      'chat.send': 'Send',
      'chat.typing': 'AI Assistant is typing...',
      'chat.welcome': 'Hello! I\'m your AI Tax & Law Assistant. How can I help you today?',
      
      // Upload
      'upload.title': 'Upload Documents',
      'upload.subtitle': 'Upload Your Salary Certificates, NID & TIN Certificate',
      'upload.dropzone': 'Drag and drop files here, or click to select',
      'upload.supported': 'Supported formats: PDF, JPG, PNG',
      'upload.processing': 'Processing documents...',
      'upload.success': 'Documents uploaded successfully',
      
      // Dashboard
      'dashboard.title': 'Tax Dashboard',
      'dashboard.returns': 'My Returns',
      'dashboard.pending': 'Pending Actions',
      
      'dashboard.overview': 'Overview',
      'dashboard.income': 'Total Income',
      'dashboard.tax': 'Tax Liability',
      'dashboard.refund': 'Expected Refund',
      
      // Common
      'common.loading': 'Loading...',
      'common.error': 'An error occurred',
      'common.retry': 'Try Again',
      'common.cancel': 'Cancel',
      'common.save': 'Save',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.view': 'View',
      'common.download': 'Download',
      'common.upload': 'Upload',
      'common.search': 'Search',
      'common.filter': 'Filter',
      'common.sort': 'Sort',
      'common.date': 'Date',
      'common.amount': 'Amount',
      'common.status': 'Status',
      'common.type': 'Type',
      'common.description': 'Description',
      
      // Auth
      'auth.login': 'Login',
      'auth.signup': 'Sign Up',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.confirmPassword': 'Confirm Password',
      'auth.forgotPassword': 'Forgot Password?',
      'auth.noAccount': 'Don\'t have an account?',
      'auth.hasAccount': 'Already have an account?',
      'auth.loginButton': 'Login',
      'auth.signupButton': 'Create Account',
    }
  },
  bn: {
    translation: {
      // Navigation
      'nav.home': 'হোম',
      'nav.chat': 'কর সহায়ক',
      'nav.upload': 'নথি আপলোড',
      'nav.workspace': 'ওয়ার্কস্পেস',
      'nav.calculation': 'ক্যালকুলেটর',
      'nav.dashboard': 'ড্যাশবোর্ড',
      'nav.login': 'লগইন',
      'nav.signup': 'সাইন আপ',
      
      // Landing Page
      'landing.title': 'এআই কর ও আইন সহায়ক',
      'landing.subtitle': 'বাংলাদেশের জন্য স্মার্ট কর দাখিল এবং আইনি গাইডেন্স',
      'landing.cta': 'দাখিল শুরু করুন',
      'landing.feature1': 'এআই-চালিত সহায়তা',
      'landing.feature1.desc': 'আপনার কর এবং আইনি প্রশ্নের তাৎক্ষণিক উত্তর পান',
      'landing.feature2': 'নথি প্রক্রিয়াকরণ',
      'landing.feature2.desc': 'আপনার কর নথিগুলি স্বয়ংক্রিয়ভাবে আপলোড এবং প্রক্রিয়া করুন',
      'landing.feature3': 'দ্বিভাষিক সহায়তা',
      'landing.feature3.desc': 'ইংরেজি এবং বাংলা উভয় ভাষায় উপলব্ধ',
      'landing.whyChoose': 'কেন আমাদের এআই সহায়ক বেছে নেবেন?',
      'landing.whyChoose.desc': 'আমাদের বুদ্ধিমান, দ্বিভাষিক সহায়কের সাথে কর দাখিলের ভবিষ্যত অনুভব করুন',
      'landing.benefits.title': 'কর দাখিলের জন্য আপনার যা প্রয়োজন সবকিছু',
      'landing.benefits.desc': 'আমাদের ব্যাপক প্ল্যাটফর্ম আপনার কর সঠিকভাবে এবং দক্ষতার সাথে দাখিল করার জন্য প্রয়োজনীয় সমস্ত সরঞ্জাম এবং নির্দেশনা প্রদান করে।',
      'landing.benefits.1': 'বাংলাদেশ কর আইনের জন্য বিশেষজ্ঞ এআই নির্দেশনা',
      'landing.benefits.2': 'স্বয়ংক্রিয় নথি প্রক্রিয়াকরণ',
      'landing.benefits.3': 'বহুভাষিক সহায়তা (বাংলা এবং ইংরেজি)',
      'landing.benefits.4': 'নিরাপদ এবং গোপনীয়',
      'landing.benefits.5': 'রিয়েল-টাইম কর গণনা',
      'landing.benefits.6': '২৪/৭ উপলব্ধতা',
      'landing.security.title': 'নিরাপদ ও গোপনীয়',
      'landing.security.desc': 'আপনার কর তথ্য ব্যাংক-স্তরের নিরাপত্তা এবং এনক্রিপশন দ্বারা সুরক্ষিত। আমরা কখনই আপনার ব্যক্তিগত তথ্য সংরক্ষণ বা শেয়ার করি না।',
      'landing.security.available': '২৪/৭ উপলব্ধ',
      'landing.security.secure': 'ব্যাংক-স্তরের নিরাপত্তা',
      'landing.cta2.title': 'আপনার কর দাখিল সহজ করতে প্রস্তুত?',
      'landing.cta2.desc': 'হাজার হাজার ব্যবহারকারীর সাথে যোগ দিন যারা তাদের কর প্রয়োজনের জন্য আমাদের এআই সহায়কে বিশ্বাস করেন',
      'landing.cta2.start': 'বিনামূল্যে শুরু করুন',
      'landing.cta2.demo': 'ডেমো ব্যবহার করুন',
      'landing.footer': 'সর্বস্বত্ব সংরক্ষিত।',
      
      // Chat
      'chat.placeholder': 'কর, আইন বা দাখিল পদ্ধতি সম্পর্কে প্রশ্ন করুন...',
      'chat.send': 'পাঠান',
      'chat.typing': 'এআই সহায়ক টাইপ করছে...',
      'chat.welcome': 'হ্যালো! আমি আপনার এআই কর ও আইন সহায়ক। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?',
      
      // Upload
      'upload.title': 'নথি আপলোড করুন',
      'upload.subtitle': 'আপনার বেতন সার্টিফিকেট, এনআইডি ও টিআইএন সার্টিফিকেট আপলোড করুন',
      'upload.dropzone': 'ফাইলগুলি এখানে টেনে আনুন বা নির্বাচন করতে ক্লিক করুন',
      'upload.supported': 'সমর্থিত ফরম্যাট: PDF, JPG, PNG',
      'upload.processing': 'নথি প্রক্রিয়াকরণ করা হচ্ছে...',
      'upload.success': 'নথি সফলভাবে আপলোড হয়েছে',
      
      // Dashboard
      'dashboard.title': 'কর ড্যাশবোর্ড',
      'dashboard.returns': 'আমার রিটার্ন',
      'dashboard.pending': 'অপেক্ষমাণ কাজ',
      
      'dashboard.overview': 'সংক্ষিপ্ত বিবরণ',
      'dashboard.income': 'মোট আয়',
      'dashboard.tax': 'কর দায়বদ্ধতা',
      'dashboard.refund': 'প্রত্যাশিত ফেরত',
      
      // Common
      'common.loading': 'লোড হচ্ছে...',
      'common.error': 'একটি ত্রুটি ঘটেছে',
      'common.retry': 'আবার চেষ্টা করুন',
      'common.cancel': 'বাতিল',
      'common.save': 'সংরক্ষণ',
      'common.delete': 'মুছে ফেলুন',
      'common.edit': 'সম্পাদনা',
      'common.view': 'দেখুন',
      'common.download': 'ডাউনলোড',
      'common.upload': 'আপলোড',
      'common.search': 'অনুসন্ধান',
      'common.filter': 'ফিল্টার',
      'common.sort': 'সাজান',
      'common.date': 'তারিখ',
      'common.amount': 'পরিমাণ',
      'common.status': 'অবস্থা',
      'common.type': 'ধরন',
      'common.description': 'বিবরণ',
      
      // Auth
      'auth.login': 'লগইন',
      'auth.signup': 'সাইন আপ',
      'auth.email': 'ইমেইল',
      'auth.password': 'পাসওয়ার্ড',
      'auth.confirmPassword': 'পাসওয়ার্ড নিশ্চিত করুন',
      'auth.forgotPassword': 'পাসওয়ার্ড ভুলে গেছেন?',
      'auth.noAccount': 'অ্যাকাউন্ট নেই?',
      'auth.hasAccount': 'ইতিমধ্যে অ্যাকাউন্ট আছে?',
      'auth.loginButton': 'লগইন',
      'auth.signupButton': 'অ্যাকাউন্ট তৈরি করুন',
    }
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: 'en',
    
    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  })

export default i18n