'use client'

import React from 'react'
import { useI18n } from '@/lib/i18n-provider'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { taxAPI } from '@/lib/api'
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
    monthlySalary: '',
    category: 'general' as 'general' | 'women_senior' | 'disabled'
  })
  
  // Deductions removed per request
  
  const [result, setResult] = React.useState<{
    totalIncome: number
    taxableIncome: number
    totalTax: number
  } | null>(null)

  const [isPdfGenerating, setIsPdfGenerating] = React.useState(false)
  const [pdfError, setPdfError] = React.useState<string | null>(null)

  // Exemption map used both in UI and calculation
  const EXEMPTION_MAP: Record<'general' | 'women_senior' | 'disabled', number> = {
    general: 350000,
    women_senior: 400000,
    disabled: 475000,
  }

  const calculateTax = () => {
    // Annualize monthly salary
    const monthlySalary = Number(income.monthlySalary || 0)
    const totalIncome = monthlySalary * 12

    const exemptionLimit = EXEMPTION_MAP[income.category]

    // Taxable income after exemption
    let remaining = totalIncome - exemptionLimit
    if (remaining < 0) remaining = 0

    // Progressive slabs per NBR (post-exemption):
    // Next 100,000 at 5%
    // Next 300,000 at 10%
    // Next 400,000 at 15%
    // Next 500,000 at 20%
    // Remaining at 25%
    let tax = 0
    const applySlab = (amount: number, rate: number) => {
      const take = Math.max(0, Math.min(remaining, amount))
      tax += take * rate
      remaining -= take
    }

    applySlab(100000, 0.05)
    applySlab(300000, 0.10)
    applySlab(400000, 0.15)
    applySlab(500000, 0.20)
    if (remaining > 0) tax += remaining * 0.25

    // No minimum tax floor applied here (per earlier requirement)
    if (totalIncome === 0) tax = 0

    setResult({
      totalIncome,
      taxableIncome: Math.max(0, totalIncome - exemptionLimit),
      totalTax: Math.round(tax)
    })
  }

  const resetCalculator = () => {
    setIncome({ monthlySalary: '', category: 'general' })
    setResult(null)
    setPdfError(null)
  }

  const generateTaxReturnPdf = async () => {
    try {
      setIsPdfGenerating(true)
      setPdfError(null)

      const monthlySalary = Number(income.monthlySalary || 0)
      const annualSalary = monthlySalary * 12

      const payload = {
        taxpayer_category: income.category,
        // Minimal mapping: treat annual salary as "basic pay"; others default to 0.
        sal_basic: annualSalary,
        sal_rent: 0,
        sal_medical: 0,
        sal_conveyance: 0,
        sal_festival: 0,
      }

      const response = await taxAPI.generateTaxReturnFromForm(payload, 60000)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'tax_return.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      setPdfError(typeof detail === 'string' ? detail : 'Failed to generate PDF')
    } finally {
      setIsPdfGenerating(false)
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
          <div className="space-y-4 md:space-y-6 flex flex-col lg:col-span-2">
            {/* Income Section */}
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 flex-1">
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
                    onChange={(e) => setIncome({ ...income, monthlySalary: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === 'bn'
                      ? `বার্ষিক আয়: ৳ ${(Number(income.monthlySalary || 0) * 12).toLocaleString()}`
                      : `Annual Income: ৳ ${(Number(income.monthlySalary || 0) * 12).toLocaleString()}`}
                  </p>
                </div>

                <div className="space-y-2 group">
                  <label className={`text-sm font-medium ${language === 'bn' ? 'bangla-text' : ''}`}>
                    {language === 'bn' ? 'করদাতার শ্রেণী' : 'Taxpayer Category'}
                  </label>
                  <select
                    className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-sm transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 hover:border-blue-400"
                    value={income.category}
                    onChange={(e) => setIncome({ ...income, category: e.target.value as any })}
                  >
                    <option value="general">{language === 'bn' ? 'সাধারণ করদাতা' : 'General'}</option>
                    <option value="women_senior">{language === 'bn' ? 'মহিলা/জ্যেষ্ঠ নাগরিক' : 'Women/Senior (65+)'}
                    </option>
                    <option value="disabled">{language === 'bn' ? 'প্রতিবন্ধী' : 'Persons with Disability'}</option>
                  </select>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20">
                      {income.category === 'general' && (language === 'bn' ? 'সাধারণ' : 'General')}
                      {income.category === 'women_senior' && (language === 'bn' ? 'মহিলা/জ্যেষ্ঠ' : 'Women/Senior')}
                      {income.category === 'disabled' && (language === 'bn' ? 'প্রতিবন্ধী' : 'Disability')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {language === 'bn' ? 'করমুক্ত সীমা:' : 'Exemption:'} ৳ {EXEMPTION_MAP[income.category].toLocaleString()}
                    </span>
                  </div>
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
              <Button
                onClick={generateTaxReturnPdf}
                size="lg"
                variant="secondary"
                disabled={isPdfGenerating}
              >
                <Download className="h-4 w-4 mr-2" />
                {isPdfGenerating
                  ? (language === 'bn' ? 'পিডিএফ তৈরি হচ্ছে...' : 'Generating PDF...')
                  : (language === 'bn' ? 'পিডিএফ ডাউনলোড' : 'Download PDF')}
              </Button>
              <Button onClick={resetCalculator} variant="outline" size="lg">
                <RotateCcw className="h-4 w-4 mr-2" />
                {language === 'bn' ? 'রিসেট' : 'Reset'}
              </Button>
            </div>

            {pdfError && (
              <div className="text-sm rounded-md px-3 py-2 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                {pdfError}
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6 flex flex-col lg:col-span-1">
            {result ? (
              <>
                <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 flex-1">
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
              <Card className="flex-1 min-h-[280px]">
                <CardContent className="h-full flex flex-col items-center justify-center text-center">
                  <CalculatorIcon className="h-16 w-16 mb-4 text-muted-foreground" />
                  <p className={`text-muted-foreground ${
                    language === 'bn' ? 'bangla-text' : ''
                  }`}>
                    {language === 'bn' 
                      ? 'পরিমাণ লিখুন, তারপর কর গণনা করুন' 
                      : 'Enter your amount, then calculate tax'}
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
