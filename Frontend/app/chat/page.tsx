'use client'

import React from 'react'
import { useI18n } from '@/lib/i18n-provider'
import { Navbar } from '@/components/Navbar'
import { ChatBox } from '@/components/ChatBox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  MessageSquare, 
  BookOpen, 
  Calculator, 
  FileText,
  HelpCircle,
  Lightbulb
} from 'lucide-react'

export default function ChatPage() {
  const { t } = useI18n()

  const quickQuestions = [
    {
      question: "How do I file my tax return in Bangladesh?",
      bangla: "বাংলাদেশে আমি কীভাবে আমার কর রিটার্ন দাখিল করব?",
      category: "filing"
    },
    {
      question: "What documents do I need for tax filing?",
      bangla: "কর দাখিলের জন্য আমার কী কী নথি প্রয়োজন?",
      category: "documents"
    },
    {
      question: "How is income tax calculated?",
      bangla: "আয়কর কীভাবে গণনা করা হয়?",
      category: "calculation"
    },
    {
      question: "What are the tax exemption limits?",
      bangla: "কর ছাড়ের সীমা কত?",
      category: "exemption"
    }
  ]

  const categories = [
    {
      icon: FileText,
      title: "Tax Filing",
      description: "Learn how to file your tax returns properly",
      color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
    },
    {
      icon: Calculator,
      title: "Tax Calculation",
      description: "Understand how taxes are calculated",
      color: "bg-green-50 text-green-600 dark:bg-green-900/20"
    },
    {
      icon: BookOpen,
      title: "Tax Laws",
      description: "Get information about tax regulations",
      color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
    },
    {
      icon: HelpCircle,
      title: "General Help",
      description: "Ask any tax-related questions",
      color: "bg-orange-50 text-orange-600 dark:bg-orange-900/20"
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
      
      <div className="h-screen overflow-y-auto scrollbar-hide pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <MessageSquare className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl md:text-4xl font-black text-white">
              {t('nav.chat')}
            </h1>
          </div>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Ask me anything about tax filing, calculations, or Bangladesh tax laws. I&apos;m here to help!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <ChatBox className="w-full" />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Questions */}
            <Card className="shadow-2xl border border-white/5 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-950/90 backdrop-blur-2xl hover:border-white/10 transition-all duration-700 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center space-x-2 text-white font-bold">
                  <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/20">
                    <Lightbulb className="h-5 w-5 text-yellow-400" />
                  </div>
                  <span>Quick Questions</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Click on any question to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickQuestions.map((item, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full text-left h-auto p-3 justify-start"
                    onClick={() => {
                      // In a real implementation, this would send the question to the chat
                    }}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm text-white">{item.question}</span>
                      <span className="text-xs text-gray-400">{item.bangla}</span>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Categories */}
            <Card className="shadow-2xl border border-white/5 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-950/90 backdrop-blur-2xl hover:border-white/10 transition-all duration-700 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-white font-bold">Help Categories</CardTitle>
                <CardDescription className="text-gray-400">
                  Browse help by category
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {categories.map((category, index) => {
                  const Icon = category.icon
                  return (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${category.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{category.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="shadow-2xl border border-white/5 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-950/90 backdrop-blur-2xl hover:border-white/10 transition-all duration-700 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-sm text-white font-bold">💡 Tips for Better Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-400 relative z-10">
                <div className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>Be specific about your tax situation</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>Mention your income range if relevant</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>Ask follow-up questions for clarity</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>Use either English or Bengali</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}