import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="relative bg-[#0a0a0a] border-t border-white/5 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-5">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg blur-sm opacity-40" />
            <Image
              src="/logo.svg"
              alt="Tax Assistant Logo"
              width={32}
              height={32}
              sizes="32px"
              className="h-8 w-8 relative z-10"
            />
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/terms"
              className="text-sm text-gray-400 hover:text-white transition-colors duration-300"
            >
              Terms of Service
            </Link>
            <span className="text-gray-600 text-xs">•</span>
            <Link
              href="/privacy"
              className="text-sm text-gray-400 hover:text-white transition-colors duration-300"
            >
              Privacy Policy
            </Link>
          </div>

          <p className="text-xs text-gray-500">© 2025 Tax Assistant. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
