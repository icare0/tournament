'use client'

import { Code } from 'lucide-react'

export function DownloadButton() {
  const handleDownload = () => {
    const htmlContent = document.documentElement.outerHTML
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bloom-saas.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <button
      aria-label="Download Code"
      className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-bloom-dark text-bloom-bg rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-500 group border border-bloom-bg/10 overflow-hidden cursor-none"
      onClick={handleDownload}
    >
      <div className="absolute inset-0 bg-bloom-accent transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
      <Code className="text-2xl relative z-10 group-hover:text-white transition-colors duration-300" />
      <span className="absolute right-full mr-4 bg-bloom-dark text-bloom-bg text-xs font-sans uppercase tracking-widest px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
        Sauvegarder
      </span>
    </button>
  )
}
