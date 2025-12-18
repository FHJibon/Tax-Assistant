'use client'

import React from 'react'
import { useI18n } from '@/lib/i18n-provider'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Zap, Crown, Sparkles } from 'lucide-react'

export default function PricingPage() {
  const { t, language } = useI18n()

  const plans = [
    {
      name: language === 'bn' ? 'বিনামূল্যে' : 'Free',
      nameBn: 'বিনামূল্যে',
      price: '৳0',
      priceEn: '৳0',
      period: language === 'bn' ? '/মাস' : '/month',
      description: language === 'bn' 
        ? 'ব্যক্তিগত ব্যবহারের জন্য আদর্শ' 
        : 'Perfect for personal use',
      icon: Sparkles,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      features: [
        { text: language === 'bn' ? 'বছরে ১টি কর রিটার্ন' : '1 tax return per year', included: true },
        { text: language === 'bn' ? 'মৌলিক এআই সহায়তা' : 'Basic AI assistance', included: true },
        { text: language === 'bn' ? '৫টি নথি আপলোড' : '5 document uploads', included: true },
        { text: language === 'bn' ? 'ইমেইল সহায়তা' : 'Email support', included: true },
        { text: language === 'bn' ? 'কর ক্যালকুলেটর' : 'Tax calculator', included: true },
        { text: language === 'bn' ? 'অগ্রাধিকার সহায়তা' : 'Priority support', included: false },
        { text: language === 'bn' ? 'ট্যাক্স বিশেষজ্ঞ পরামর্শ' : 'Tax expert consultation', included: false },
      ],
      cta: language === 'bn' ? 'শুরু করুন' : 'Get Started',
      popular: false
    },
    {
      name: language === 'bn' ? 'প্রো' : 'Pro',
      nameBn: 'প্রো',
      price: '৳499',
      priceEn: '৳499',
      period: language === 'bn' ? '/মাস' : '/month',
      description: language === 'bn' 
        ? 'পেশাদার ও ব্যবসার জন্য' 
        : 'For professionals & businesses',
      icon: Zap,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      features: [
        { text: language === 'bn' ? 'সীমাহীন কর রিটার্ন' : 'Unlimited tax returns', included: true },
        { text: language === 'bn' ? 'উন্নত এআই সহায়তা' : 'Advanced AI assistance', included: true },
        { text: language === 'bn' ? 'সীমাহীন নথি আপলোড' : 'Unlimited document uploads', included: true },
        { text: language === 'bn' ? 'অগ্রাধিকার সহায়তা' : 'Priority support', included: true },
        { text: language === 'bn' ? 'সব বৈশিষ্ট্য অ্যাক্সেস' : 'All features access', included: true },
        { text: language === 'bn' ? 'মাসিক ১টি বিশেষজ্ঞ পরামর্শ' : '1 expert consultation/month', included: true },
        { text: language === 'bn' ? 'কাস্টম রিপোর্ট' : 'Custom reports', included: true },
      ],
      cta: language === 'bn' ? 'আপগ্রেড করুন' : 'Upgrade Now',
      popular: true
    },
    {
      name: language === 'bn' ? 'এন্টারপ্রাইজ' : 'Enterprise',
      nameBn: 'এন্টারপ্রাইজ',
      price: language === 'bn' ? 'কাস্টম' : 'Custom',
      priceEn: 'Custom',
      period: '',
      description: language === 'bn' 
        ? 'বড় সংস্থা ও টিমের জন্য' 
        : 'For large organizations & teams',
      icon: Crown,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      features: [
        { text: language === 'bn' ? 'সব প্রো বৈশিষ্ট্য' : 'All Pro features', included: true },
        { text: language === 'bn' ? 'সীমাহীন ব্যবহারকারী' : 'Unlimited users', included: true },
        { text: language === 'bn' ? 'ডেডিকেটেড একাউন্ট ম্যানেজার' : 'Dedicated account manager', included: true },
        { text: language === 'bn' ? 'কাস্টম ইন্টিগ্রেশন' : 'Custom integrations', included: true },
        { text: language === 'bn' ? '২৪/৭ ফোন সহায়তা' : '24/7 phone support', included: true },
        { text: language === 'bn' ? 'সীমাহীন বিশেষজ্ঞ পরামর্শ' : 'Unlimited expert consultations', included: true },
        { text: language === 'bn' ? 'এসএলএ গ্যারান্টি' : 'SLA guarantee', included: true },
      ],
      cta: language === 'bn' ? 'যোগাযোগ করুন' : 'Contact Sales',
      popular: false
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
      
      <div className="h-screen overflow-y-auto scrollbar-hide">
        <div className="pt-20">
          <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
            {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="h-7 w-7 md:h-8 md:w-8 text-blue-400" />
            <h1 className={`text-2xl md:text-3xl lg:text-4xl font-black text-white ${
              language === 'bn' ? 'bangla-text' : ''
            }`}>
              {language === 'bn' ? 'মূল্য' : 'Pricing'}
            </h1>
          </div>
          <p className={`text-base md:text-lg text-gray-400 max-w-2xl mx-auto ${
            language === 'bn' ? 'bangla-text' : ''
          }`}>
            {language === 'bn' 
              ? 'আপনার প্রয়োজন অনুযায়ী সঠিক পরিকল্পনা বেছে নিন' 
              : 'Choose the perfect plan for your needs'}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            return (
              <Card 
                key={index} 
                className={`relative shadow-2xl border border-white/5 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-950/90 backdrop-blur-2xl hover:border-white/10 transition-all duration-700 group overflow-hidden ${
                  plan.popular 
                    ? 'scale-105 ring-2 ring-blue-500/50' 
                    : ''
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                {plan.popular && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
                    <span className={`px-4 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full ${
                      language === 'bn' ? 'bangla-text' : ''
                    }`}>
                      {language === 'bn' ? 'জনপ্রিয়' : 'Most Popular'}
                    </span>
                  </div>
                )}
                
                <CardHeader className={`text-center pb-8 relative z-10 ${plan.popular ? 'pt-12' : ''}`}>
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${plan.bgColor} flex items-center justify-center border border-white/10`}>
                    <Icon className={`h-8 w-8 ${plan.color}`} />
                  </div>
                  
                  <CardTitle className={`text-2xl mb-2 text-white font-bold ${
                    language === 'bn' ? 'bangla-text' : ''
                  }`}>
                    {plan.name}
                  </CardTitle>
                  
                  <div className="mb-2">
                    <span className={`text-4xl font-bold text-white ${
                      language === 'bn' ? 'bangla-text' : ''
                    }`}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className={`text-gray-400 ml-1 ${
                        language === 'bn' ? 'bangla-text' : ''
                      }`}>
                        {plan.period}
                      </span>
                    )}
                  </div>
                  
                  <CardDescription className={`${language === 'bn' ? 'bangla-text' : ''} text-gray-400`}>
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 relative z-10">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li 
                        key={featureIndex} 
                        className={`flex items-start space-x-3 ${
                          !feature.included ? 'opacity-40' : ''
                        }`}
                      >
                        <Check className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                          feature.included ? 'text-green-400' : 'text-gray-600'
                        }`} />
                        <span className={`text-sm text-gray-300 ${
                          language === 'bn' ? 'bangla-text' : ''
                        }`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-primary hover:bg-primary/90' 
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    }`}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* FAQ removed per request */}

        {/* CTA removed per request */}
          </div>
        </div>
      </div>
    </div>
  )
}
