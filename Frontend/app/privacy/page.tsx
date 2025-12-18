'use client'

import React from 'react'
import { useI18n } from '@/lib/i18n-provider'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, Calendar } from 'lucide-react'

export default function PrivacyPage() {
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
              <Shield className="h-10 w-10 md:h-12 md:w-12 text-blue-400" />
            </div>
          </div>
          <h1 className={`text-2xl md:text-3xl lg:text-4xl font-black text-white mb-4 animation-delay-200 ${
            language === 'bn' ? 'bangla-text' : ''
          }`}>
            {language === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}
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
              // Bengali Privacy Policy
              <div className="space-y-6 bangla-text">
                <section>
                  <h2 className="text-2xl font-bold mb-4">১. ভূমিকা</h2>
                  <p className="text-muted-foreground mb-4">
                    AI Tax & Law Assistant (&quot;আমরা&quot;, &quot;আমাদের&quot;, &quot;আমাদের&quot;) আপনার গোপনীয়তা রক্ষা করতে প্রতিশ্রুতিবদ্ধ। এই গোপনীয়তা নীতি ব্যাখ্যা করে কিভাবে আমরা আপনার ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার, প্রকাশ এবং সুরক্ষিত করি যখন আপনি আমাদের সেবা ব্যবহার করেন।
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">২. আমরা যে তথ্য সংগ্রহ করি</h2>
                  <p className="text-muted-foreground mb-4">
                    আমরা নিম্নলিখিত ধরনের তথ্য সংগ্রহ করি:
                  </p>
                  
                  <h3 className="text-xl font-semibold mb-3 mt-4">২.১ ব্যক্তিগত তথ্য</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                    <li>নাম এবং যোগাযোগের তথ্য (ইমেইল, ফোন নম্বর)</li>
                    <li>কর শনাক্তকরণ নম্বর (টিআইএন)</li>
                    <li>আর্থিক তথ্য (আয়, কর্তন, বিনিয়োগ)</li>
                    <li>পরিচয় নথি (জাতীয় পরিচয়পত্র, পাসপোর্ট)</li>
                  </ul>

                  <h3 className="text-xl font-semibold mb-3 mt-4">২.২ স্বয়ংক্রিয়ভাবে সংগৃহীত তথ্য</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                    <li>আইপি ঠিকানা এবং ডিভাইস তথ্য</li>
                    <li>ব্রাউজার প্রকার এবং সংস্করণ</li>
                    <li>ব্যবহারের ডেটা এবং বিশ্লেষণ</li>
                    <li>কুকিজ এবং অনুরূপ প্রযুক্তি</li>
                  </ul>

                  <h3 className="text-xl font-semibold mb-3 mt-4">২.৩ আপলোড করা নথি</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                    <li>কর সংক্রান্ত নথি</li>
                    <li>আর্থিক বিবৃতি</li>
                    <li>বিনিয়োগ প্রমাণ</li>
                    <li>অন্যান্য সহায়ক নথি</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">৩. আমরা কিভাবে আপনার তথ্য ব্যবহার করি</h2>
                  <p className="text-muted-foreground mb-4">
                    আমরা আপনার তথ্য নিম্নলিখিত উদ্দেশ্যে ব্যবহার করি:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>কর গণনা এবং রিটার্ন প্রস্তুতি সেবা প্রদান করতে</li>
                    <li>আপনার নথি বিশ্লেষণ এবং প্রক্রিয়া করতে</li>
                    <li>আপনার পরিচয় যাচাই এবং জালিয়াতি প্রতিরোধ করতে</li>
                    <li>আমাদের সেবা উন্নত করতে এবং নতুন বৈশিষ্ট্য বিকাশ করতে</li>
                    <li>আপনার সাথে যোগাযোগ করতে এবং গ্রাহক সহায়তা প্রদান করতে</li>
                    <li>আইনি বাধ্যবাধকতা মেনে চলতে</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">৪. তথ্য শেয়ারিং এবং প্রকাশ</h2>
                  <p className="text-muted-foreground mb-4">
                    আমরা নিম্নলিখিত পরিস্থিতিতে আপনার তথ্য শেয়ার করতে পারি:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>আপনার সম্মতিতে:</strong> যখন আপনি আমাদের আপনার তথ্য শেয়ার করার অনুমতি দেন</li>
                    <li><strong>সেবা প্রদানকারী:</strong> বিশ্বস্ত তৃতীয় পক্ষের সাথে যারা আমাদের সেবা পরিচালনা করতে সাহায্য করে</li>
                    <li><strong>আইনি প্রয়োজনীয়তা:</strong> যখন আইন, নিয়ন্ত্রণ বা আইনি প্রক্রিয়া দ্বারা প্রয়োজন</li>
                    <li><strong>ব্যবসা স্থানান্তর:</strong> একত্রীকরণ বা অধিগ্রহণের ক্ষেত্রে</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">৫. ডেটা সুরক্ষা</h2>
                  <p className="text-muted-foreground mb-4">
                    আমরা আপনার তথ্য সুরক্ষিত রাখতে শিল্প-মান নিরাপত্তা ব্যবস্থা প্রয়োগ করি:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>ট্রানজিট এবং বিশ্রামে এনক্রিপশন (SSL/TLS)</li>
                    <li>নিরাপদ ডেটা স্টোরেজ এবং ব্যাকআপ</li>
                    <li>নিয়মিত নিরাপত্তা অডিট এবং মূল্যায়ন</li>
                    <li>সীমিত কর্মচারী অ্যাক্সেস এবং প্রশিক্ষণ</li>
                    <li>ফায়ারওয়াল এবং অনুপ্রবেশ সনাক্তকরণ সিস্টেম</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">৬. আপনার অধিকার</h2>
                  <p className="text-muted-foreground mb-4">
                    আপনার নিম্নলিখিত অধিকার আছে:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>অ্যাক্সেস:</strong> আমাদের কাছে থাকা আপনার ব্যক্তিগত তথ্য অ্যাক্সেস করার অধিকার</li>
                    <li><strong>সংশোধন:</strong> ভুল বা অসম্পূর্ণ তথ্য আপডেট করার অধিকার</li>
                    <li><strong>মুছে ফেলা:</strong> নির্দিষ্ট পরিস্থিতিতে আপনার তথ্য মুছে ফেলার অনুরোধ করার অধিকার</li>
                    <li><strong>বহনযোগ্যতা:</strong> একটি কাঠামোগত বিন্যাসে আপনার ডেটা প্রাপ্ত করার অধিকার</li>
                    <li><strong>আপত্তি:</strong> নির্দিষ্ট ডেটা প্রক্রিয়াকরণে আপত্তি করার অধিকার</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">৭. কুকিজ এবং ট্র্যাকিং</h2>
                  <p className="text-muted-foreground mb-4">
                    আমরা আপনার ব্যবহারকারী অভিজ্ঞতা উন্নত করতে এবং আমাদের সেবা বিশ্লেষণ করতে কুকিজ এবং অনুরূপ ট্র্যাকিং প্রযুক্তি ব্যবহার করি। আপনি আপনার ব্রাউজার সেটিংসের মাধ্যমে কুকিজ পরিচালনা করতে পারেন।
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">৮. ডেটা ধারণ</h2>
                  <p className="text-muted-foreground mb-4">
                    আমরা আপনার ব্যক্তিগত তথ্য ততদিন ধরে রাখি যতদিন আপনার অ্যাকাউন্ট সক্রিয় থাকে বা আপনাকে সেবা প্রদান করার জন্য প্রয়োজন। আইনি বাধ্যবাধকতা মেনে চলতে বা বিরোধ সমাধানের জন্য আমরা ডেটা দীর্ঘ সময়ের জন্য ধরে রাখতে পারি।
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">৯. শিশুদের গোপনীয়তা</h2>
                  <p className="text-muted-foreground mb-4">
                    আমাদের সেবা ১৮ বছরের কম বয়সী ব্যক্তিদের জন্য নয়। আমরা জেনেশুনে শিশুদের কাছ থেকে ব্যক্তিগত তথ্য সংগ্রহ করি না। আপনি যদি একজন অভিভাবক হন এবং সচেতন হন যে আপনার সন্তান আমাদের ব্যক্তিগত তথ্য প্রদান করেছে, আমাদের সাথে যোগাযোগ করুন।
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">১০. আন্তর্জাতিক ডেটা স্থানান্তর</h2>
                  <p className="text-muted-foreground mb-4">
                    আপনার তথ্য বাংলাদেশের বাইরে দেশগুলিতে স্থানান্তরিত এবং প্রক্রিয়া করা হতে পারে। আমরা এই ধরনের স্থানান্তরের জন্য উপযুক্ত সুরক্ষা নিশ্চিত করি।
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">১১. গোপনীয়তা নীতি পরিবর্তন</h2>
                  <p className="text-muted-foreground mb-4">
                    আমরা সময়ে সময়ে এই গোপনীয়তা নীতি আপডেট করতে পারি। আমরা এই পৃষ্ঠায় নতুন গোপনীয়তা নীতি পোস্ট করে এবং &quot;শেষ আপডেট&quot; তারিখ আপডেট করে কোনো পরিবর্তন সম্পর্কে আপনাকে অবহিত করব।
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">১২. যোগাযোগ করুন</h2>
                  <p className="text-muted-foreground mb-4">
                    এই গোপনীয়তা নীতি বা আপনার ব্যক্তিগত তথ্য সম্পর্কে প্রশ্ন বা উদ্বেগ থাকলে, আমাদের সাথে যোগাযোগ করুন:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>ইমেইল: ferdoushasanjibon25@gmail.com</li>
                    <li>ঠিকানা: ঢাকা, বাংলাদেশ</li>
                  </ul>
                </section>

                <section className="mt-8 pt-8 border-t">
                  <p className="text-sm text-muted-foreground">
                    আমাদের সেবা ব্যবহার করে, আপনি এই গোপনীয়তা নীতির শর্তাবলী স্বীকার করেন এবং সম্মত হন।
                  </p>
                </section>
              </div>
            ) : (
              // English Privacy Policy
              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
                  <p className="text-muted-foreground mb-4">
                    AI Tax & Law Assistant (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our Service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
                  <p className="text-muted-foreground mb-4">
                    We collect the following types of information:
                  </p>
                  
                  <h3 className="text-xl font-semibold mb-3 mt-4">2.1 Personal Information</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                    <li>Name and contact information (email, phone number)</li>
                    <li>Tax Identification Number (TIN)</li>
                    <li>Financial information (income, deductions, investments)</li>
                    <li>Identity documents (national ID, passport)</li>
                  </ul>

                  <h3 className="text-xl font-semibold mb-3 mt-4">2.2 Automatically Collected Information</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                    <li>IP address and device information</li>
                    <li>Browser type and version</li>
                    <li>Usage data and analytics</li>
                    <li>Cookies and similar technologies</li>
                  </ul>

                  <h3 className="text-xl font-semibold mb-3 mt-4">2.3 Uploaded Documents</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                    <li>Tax-related documents</li>
                    <li>Financial statements</li>
                    <li>Investment proofs</li>
                    <li>Other supporting documents</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
                  <p className="text-muted-foreground mb-4">
                    We use your information for the following purposes:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>To provide tax calculation and return preparation services</li>
                    <li>To analyze and process your documents</li>
                    <li>To verify your identity and prevent fraud</li>
                    <li>To improve our Service and develop new features</li>
                    <li>To communicate with you and provide customer support</li>
                    <li>To comply with legal obligations</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">4. Information Sharing and Disclosure</h2>
                  <p className="text-muted-foreground mb-4">
                    We may share your information in the following circumstances:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>With Your Consent:</strong> When you give us permission to share your information</li>
                    <li><strong>Service Providers:</strong> With trusted third parties who help us operate the Service</li>
                    <li><strong>Legal Requirements:</strong> When required by law, regulation, or legal process</li>
                    <li><strong>Business Transfers:</strong> In connection with a merger or acquisition</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
                  <p className="text-muted-foreground mb-4">
                    We implement industry-standard security measures to protect your information:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Encryption in transit and at rest (SSL/TLS)</li>
                    <li>Secure data storage and backups</li>
                    <li>Regular security audits and assessments</li>
                    <li>Limited employee access and training</li>
                    <li>Firewalls and intrusion detection systems</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
                  <p className="text-muted-foreground mb-4">
                    You have the following rights:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Access:</strong> Right to access your personal information we hold</li>
                    <li><strong>Correction:</strong> Right to update incorrect or incomplete information</li>
                    <li><strong>Deletion:</strong> Right to request deletion of your information in certain circumstances</li>
                    <li><strong>Portability:</strong> Right to receive your data in a structured format</li>
                    <li><strong>Object:</strong> Right to object to certain data processing</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">7. Cookies and Tracking</h2>
                  <p className="text-muted-foreground mb-4">
                    We use cookies and similar tracking technologies to enhance your user experience and analyze our Service. You can manage cookies through your browser settings.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">8. Data Retention</h2>
                  <p className="text-muted-foreground mb-4">
                    We retain your personal information for as long as your account is active or as needed to provide you services. We may retain data longer to comply with legal obligations or resolve disputes.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">9. Children&apos;s Privacy</h2>
                  <p className="text-muted-foreground mb-4">
                    Our Service is not intended for individuals under 18 years old. We do not knowingly collect personal information from children. If you are a parent and aware that your child has provided us with personal information, please contact us.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">10. International Data Transfers</h2>
                  <p className="text-muted-foreground mb-4">
                    Your information may be transferred to and processed in countries outside of Bangladesh. We ensure appropriate safeguards are in place for such transfers.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">11. Changes to Privacy Policy</h2>
                  <p className="text-muted-foreground mb-4">
                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">12. Contact Us</h2>
                  <p className="text-muted-foreground mb-4">
                    If you have questions or concerns about this Privacy Policy or your personal information, please contact us at:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Email: ferdoushasanjibon25@gmail.com</li>
                    <li>Address: Dhaka, Bangladesh</li>
                  </ul>
                </section>

                <section className="mt-8 pt-8 border-t">
                  <p className="text-sm text-muted-foreground">
                    By using our Service, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.
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
