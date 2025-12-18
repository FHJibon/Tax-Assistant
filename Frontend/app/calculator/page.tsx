'use client'

import React from 'react'
import { useI18n } from '@/lib/i18n-provider'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Calculator as CalculatorIcon,
  DollarSign,
  TrendingDown,
  Info,
  Download,
  RotateCcw
} from 'lucide-react'

export default function CalculatorPage() {
  const { t, language } = useI18n()
  
  const [income, setIncome] = React.useState({
    monthlySalary: ''
  })
  
  // Deductions removed per request
  
  const [result, setResult] = React.useState<{
    totalIncome: number
    taxableIncome: number
    totalTax: number
  } | null>(null)

  const calculateTax = () => {
    // Only use monthly salary, annualize it
    const monthlySalary = Number(income.monthlySalary || 0)
    const totalIncome = monthlySalary * 12
    // Bangladesh tax slabs (2024-25)
    const exemptionLimit = 350000
    let taxableIncome = totalIncome - exemptionLimit
    if (taxableIncome < 0) taxableIncome = 0
    let tax = 0
    // Tax calculation based on Bangladesh slabs
    if (taxableIncome <= 100000) {
      tax = 0
    } else if (taxableIncome <= 400000) {
      tax = (taxableIncome - 100000) * 0.05
    } else if (taxableIncome <= 700000) {
      tax = 15000 + (taxableIncome - 400000) * 0.10
    } else if (taxableIncome <= 1100000) {
      tax = 45000 + (taxableIncome - 700000) * 0.15
    } else if (taxableIncome <= 1600000) {
      tax = 105000 + (taxableIncome - 1100000) * 0.20
    } else {
      tax = 205000 + (taxableIncome - 1600000) * 0.25
    }
    // Remove minimum tax floor per request; show slab-based tax only
    if (totalIncome === 0) tax = 0
    setResult({
      totalIncome,
      taxableIncome,
      totalTax: tax
    })
  }

  const resetCalculator = () => {
    setIncome({ monthlySalary: '' })
    setResult(null)
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
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-500/20 rounded-2xl border border-blue-500/20">
              <CalculatorIcon className="h-8 w-8 text-blue-400" />
            </div>
            <h1 className={`text-3xl md:text-4xl lg:text-5xl font-black text-white ${
              language === 'bn' ? 'bangla-text' : ''
            }`}>
              {language === 'bn' ? 'কর ক্যালকুলেটর' : 'Tax Calculator'}
            </h1>
          </div>
          <p className={`text-base md:text-lg text-muted-foreground max-w-2xl mx-auto ${
            language === 'bn' ? 'bangla-text' : ''
          }`}>
            {language === 'bn' 
              ? 'আপনার করের পরিমাণ গণনা করুন' 
              : 'Calculate your tax amount'}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Income Section (Only Monthly Salary) */}
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-500">
              <CardHeader>
                <CardTitle className={`flex items-center space-x-2 ${
                  language === 'bn' ? 'bangla-text' : ''
                }`}>
                  <DollarSign className="h-5 w-5" />
                  <span>{language === 'bn' ? 'মাসিক বেতন' : 'Monthly Salary'}</span>
                </CardTitle>
                <CardDescription className={language === 'bn' ? 'bangla-text' : ''}>
                  {language === 'bn'
                    ? 'শুধুমাত্র মাসিক বেতন লিখুন (৳ টাকায়)। বার্ষিক আয় স্বয়ংক্রিয়ভাবে গণনা হবে।'
                    : 'Enter your monthly salary (in ৳ BDT). Annual income will be calculated automatically.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${
                    language === 'bn' ? 'bangla-text' : ''
                  }`}>
                    {language === 'bn' ? 'মাসিক বেতন' : 'Monthly Salary'}
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={income.monthlySalary}
                    onChange={(e) => setIncome({ monthlySalary: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === 'bn'
                      ? `বার্ষিক আয়: ৳ ${(Number(income.monthlySalary || 0) * 12).toLocaleString()}`
                      : `Annual Income: ৳ ${(Number(income.monthlySalary || 0) * 12).toLocaleString()}`}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Deductions Section removed as requested */}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button onClick={calculateTax} size="lg" className="flex-1">
                <CalculatorIcon className="h-4 w-4 mr-2" />
                {language === 'bn' ? 'কর গণনা করুন' : 'Calculate Tax'}
              </Button>
              <Button onClick={resetCalculator} variant="outline" size="lg">
                <RotateCcw className="h-4 w-4 mr-2" />
                {language === 'bn' ? 'রিসেট' : 'Reset'}
              </Button>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {result ? (
              <>
                <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-500">
                  <CardHeader>
                    <CardTitle className={`text-center ${
                      language === 'bn' ? 'bangla-text' : ''
                    }`}>
                      {language === 'bn' ? 'আপনার কর গণনা' : 'Your Tax Calculation'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className={`font-medium ${
                        language === 'bn' ? 'bangla-text' : ''
                      }`}>
                        {language === 'bn' ? 'মোট আয়' : 'Total Income'}
                      </span>
                      <span className="font-bold text-lg">
                        ৳ {result.totalIncome.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className={`font-medium ${
                        language === 'bn' ? 'bangla-text' : ''
                      }`}>
                        {language === 'bn' ? 'করযোগ্য আয়' : 'Taxable Income'}
                      </span>
                      <span className="font-bold text-lg">
                        ৳ {result.taxableIncome.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b bg-primary/10 rounded-lg px-4">
                      <span className={`font-bold text-lg ${
                        language === 'bn' ? 'bangla-text' : ''
                      }`}>
                        {language === 'bn' ? 'মোট কর' : 'Total Tax'}
                      </span>
                      <span className="font-bold text-2xl text-primary">
                        ৳ {result.totalTax.toLocaleString()}
                      </span>
                    </div>
                    {/* Effective Rate removed as requested */}
                    {/* Download Report removed as requested */}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <CalculatorIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className={`text-muted-foreground ${
                    language === 'bn' ? 'bangla-text' : ''
                  }`}>
                    {language === 'bn' 
                      ? 'আপনার আয় এবং ছাড় লিখুন, তারপর কর গণনা করুন' 
                      : 'Enter your income and deductions, then calculate tax'}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Tax Slabs Info removed as requested */}
          </div>
        </div>
      </div>
    </div>
  )
}
