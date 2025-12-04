'use client'

import { Menu } from 'lucide-react'

export function Navigation() {
  return (
    <nav className="fixed w-full z-40 top-0 left-0 px-6 py-6 flex justify-between items-center mix-blend-difference text-[#F4F1EA]">
      <div className="text-sm font-sans tracking-widest uppercase flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-bloom-accent animate-pulse" />
        SaaS • Beta
      </div>
      <div className="text-2xl font-serif italic font-bold tracking-tighter">Bloom.</div>
      <button className="group flex items-center gap-2 hover:opacity-70 transition-opacity">
        <span className="text-sm font-sans uppercase tracking-widest">Menu</span>
        <Menu className="text-lg" />
      </button>
    </nav>
  )
}
