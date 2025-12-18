'use client'

import React from 'react'
import { useI18n } from '@/lib/i18n-provider'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Calendar } from 'lucide-react'

export default function TermsPage() {
  const { t, language } = useI18n()

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
      
      <div className="h-screen overflow-y-auto scrollbar-hide pt-20">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8 animate-fade-in-up">
          <div className="flex justify-center mb-4 animate-scale-in">
            <div className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-500/20 rounded-full border border-blue-500/20 shadow-lg">
              <FileText className="h-10 w-10 md:h-12 md:w-12 text-blue-400" />
            </div>
          </div>
          <h1 className={`text-2xl md:text-3xl lg:text-4xl font-black text-white mb-4 animation-delay-200 ${
            language === 'bn' ? 'bangla-text' : ''
          }`}>
            {language === 'bn' ? 'সেবার শর্তাবলী' : 'Terms of Service'}
          </h1>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <Calendar className="h-4 w-4" />
            <span className={language === 'bn' ? 'bangla-text' : ''}>
              {language === 'bn' ? 'শেষ আপডেট: ১ সেপ্টেম্বর, ২০২৫' : 'Last updated: September 01, 2025'}
            </span>
          </div>
        </div>

        {/* Content */}
        <Card className="shadow-2xl border border-white/5 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-950/90 backdrop-blur-2xl hover:border-white/10 transition-all duration-700 group relative overflow-hidden animate-fade-in-up animation-delay-400">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <CardContent className="prose dark:prose-invert max-w-none pt-6 relative z-10">
            {language === 'bn' ? (
              // Bengali Terms
              <div className="space-y-6 bangla-text">
                <section>
                  <h2 className="text-2xl font-bold mb-4">১. শর্তাবলীর স্বীকৃতি</h2>
                  <p className="text-muted-foreground mb-4">
                    AI Tax & Law Assistant (&quot;সেবা&quot;, &quot;আমরা&quot;, &quot;আমাদের&quot;) ব্যবহার করে, আপনি এই সেবার শর্তাবলী মেনে নিতে সম্মত হন। আপনি যদি এই শর্তাবলীর সাথে একমত না হন, তাহলে অনুগ্রহ করে সেবা ব্যবহার করবেন না।
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">২. ব্যবহারকারীর দায়িত্ব</h2>
                  <p className="text-muted-foreground mb-4">
                    আপনি সম্মত হন যে:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>আপনি সঠিক এবং সম্পূর্ণ তথ্য প্রদান করবেন</li>
                    <li>আপনার অ্যাকাউন্টের নিরাপত্তা বজায় রাখবেন</li>
                    <li>আপনার অ্যাকাউন্টের অধীনে সমস্ত কার্যকলাপের জন্য দায়বদ্ধ থাকবেন</li>
                    <li>আপনি কোনো বেআইনি উদ্দেশ্যে সেবা ব্যবহার করবেন না</li>
                    <li>আপনি অন্যের অধিকার লঙ্ঘন করবেন না</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">৩. সেবার বিবরণ</h2>
                  <p className="text-muted-foreground mb-4">
                    আমাদের সেবা AI-চালিত কর এবং আইনি সহায়তা প্রদান করে। আমরা নিম্নলিখিত সেবা প্রদান করি:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>কর গণনা এবং রিটার্ন ফাইলিং সহায়তা</li>
                    <li>নথি বিশ্লেষণ এবং প্রক্রিয়াকরণ</li>
                    <li>AI চ্যাট সহায়তা</li>
                    <li>কর ফর্ম এবং রেফারেন্স উপকরণ</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">৪. গোপনীয়তা এবং ডেটা সুরক্ষা</h2>
                  <p className="text-muted-foreground mb-4">
                    আমরা আপনার গোপনীয়তাকে গুরুত্ব সহকারে নিই। আমাদের গোপনীয়তা নীতিমালা দেখুন কিভাবে আমরা আপনার ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার এবং সুরক্ষিত রাখি তার জন্য।
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">৫. বৌদ্ধিক সম্পত্তি</h2>
                  <p className="text-muted-foreground mb-4">
                    সেবা এবং এর মূল বিষয়বস্তু, বৈশিষ্ট্য এবং কার্যকারিতা আমাদের এবং আমাদের লাইসেন্সদাতাদের একচেটিয়া সম্পত্তি এবং কপিরাইট, ট্রেডমার্ক এবং অন্যান্য আইন দ্বারা সুরক্ষিত।
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">৬. দায় সীমাবদ্ধতা</h2>
                  <p className="text-muted-foreground mb-4">
                    আইন দ্বারা অনুমোদিত সর্বোচ্চ পরিমাণে, আমরা সেবা ব্যবহার বা ব্যবহারে অক্ষমতার ফলে উদ্ভূত কোনো পরোক্ষ, আনুষঙ্গিক, বিশেষ বা পরিণামগত ক্ষতির জন্য দায়ী থাকব না।
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">৭. সেবা পরিবর্তন এবং সমাপ্তি</h2>
                  <p className="text-muted-foreground mb-4">
                    আমরা যেকোনো সময় পূর্ব নোটিশ ছাড়াই সেবা পরিবর্তন, স্থগিত বা বন্ধ করার অধিকার সংরক্ষণ করি। আমরা এই শর্তাবলী লঙ্ঘনের জন্য যেকোনো কারণে আপনার অ্যাকাউন্ট সমাপ্ত বা স্থগিত করতে পারি।
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">৮. প্রযোজ্য আইন</h2>
                  <p className="text-muted-foreground mb-4">
                    এই শর্তাবলী বাংলাদেশের আইন দ্বারা শাসিত হবে এবং ব্যাখ্যা করা হবে। আপনি বাংলাদেশের আদালতের একচেটিয়া এখতিয়ারে জমা দিতে সম্মত হন।
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">৯. যোগাযোগ করুন</h2>
                  <p className="text-muted-foreground mb-4">
                    এই শর্তাবলী সম্পর্কে আপনার কোন প্রশ্ন থাকলে, অনুগ্রহ করে আমাদের সাথে যোগাযোগ করুন:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>ইমেইল: ferdoushasanjibon25@gmail.com</li>
                    <li>ঠিকানা: ঢাকা, বাংলাদেশ</li>
                  </ul>
                </section>

                <section className="mt-8 pt-8 border-t">
                  <p className="text-sm text-muted-foreground">
                    এই শর্তাবলী পড়ে এবং সেবা ব্যবহার করে, আপনি স্বীকার করেন যে আপনি এই শর্তাবলী পড়েছেন, বুঝেছেন এবং এর দ্বারা আবদ্ধ হতে সম্মত হয়েছেন।
                  </p>
                </section>
              </div>
            ) : (
              // English Terms
              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                  <p className="text-muted-foreground mb-4">
                    By accessing and using AI Tax & Law Assistant (&quot;Service&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">2. User Responsibilities</h2>
                  <p className="text-muted-foreground mb-4">
                    You agree that:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>You will provide accurate and complete information</li>
                    <li>You will maintain the security of your account</li>
                    <li>You are responsible for all activities under your account</li>
                    <li>You will not use the Service for any unlawful purposes</li>
                    <li>You will not violate any rights of others</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">3. Service Description</h2>
                  <p className="text-muted-foreground mb-4">
                    Our Service provides AI-powered tax and legal assistance. We offer:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Tax calculation and return filing assistance</li>
                    <li>Document analysis and processing</li>
                    <li>AI chat support</li>
                    <li>Tax forms and reference materials</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">4. Privacy and Data Protection</h2>
                  <p className="text-muted-foreground mb-4">
                    We take your privacy seriously. Please refer to our Privacy Policy for information on how we collect, use, and protect your personal information.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">5. Intellectual Property</h2>
                  <p className="text-muted-foreground mb-4">
                    The Service and its original content, features, and functionality are and will remain the exclusive property of us and our licensors. The Service is protected by copyright, trademark, and other laws.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">6. Limitation of Liability</h2>
                  <p className="text-muted-foreground mb-4">
                    To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use or inability to use the Service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">7. Service Modifications and Termination</h2>
                  <p className="text-muted-foreground mb-4">
                    We reserve the right to modify, suspend, or discontinue the Service at any time without prior notice. We may terminate or suspend your account at any time for any reason, including violation of these Terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">8. Governing Law</h2>
                  <p className="text-muted-foreground mb-4">
                    These Terms shall be governed by and construed in accordance with the laws of Bangladesh. You agree to submit to the exclusive jurisdiction of the courts of Bangladesh.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">9. Contact Us</h2>
                  <p className="text-muted-foreground mb-4">
                    If you have any questions about these Terms, please contact us at:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Email: ferdoushasanjibon25@gmail.com</li>
                    <li>Address: Dhaka, Bangladesh</li>
                  </ul>
                </section>

                <section className="mt-8 pt-8 border-t">
                  <p className="text-sm text-muted-foreground">
                    By using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                  </p>
                </section>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
