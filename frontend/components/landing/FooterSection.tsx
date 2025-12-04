'use client'

import Link from 'next/link'

export function FooterSection() {
  return (
    <footer className="bg-bloom-dark text-bloom-bg pt-20 pb-6 px-6 overflow-hidden border-t border-bloom-bg/10 mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="md:col-span-2">
            <h2 className="font-serif text-5xl md:text-8xl italic mb-8">Bloom.</h2>
            <p className="font-sans text-sm text-gray-400 max-w-sm leading-relaxed">
              Le système d'exploitation des compétitions modernes. Nous aidons les communautés à grandir,
              un match à la fois.
            </p>
          </div>
          <div>
            <h4 className="font-sans text-xs uppercase tracking-widest mb-6 text-bloom-sage">Produit</h4>
            <ul className="space-y-4 font-serif text-xl text-gray-300">
              <li>
                <Link
                  href="#features"
                  className="hover:text-bloom-accent hover:pl-2 transition-all inline-block"
                >
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-bloom-accent hover:pl-2 transition-all inline-block"
                >
                  Intégrations
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="hover:text-bloom-accent hover:pl-2 transition-all inline-block"
                >
                  Tarifs
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-bloom-accent hover:pl-2 transition-all inline-block"
                >
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-sans text-xs uppercase tracking-widest mb-6 text-bloom-sage">Légal</h4>
            <ul className="space-y-2 font-sans text-sm text-gray-500">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Conditions Générales
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Confidentialité
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Mentions Légales
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-end border-t border-gray-800 pt-6">
          <div className="flex gap-4 mb-4 md:mb-0">
            <span className="font-sans text-[10px] text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
              Twitter
            </span>
            <span className="font-sans text-[10px] text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
              LinkedIn
            </span>
            <span className="font-sans text-[10px] text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
              Discord
            </span>
          </div>
          <div className="font-sans text-[10px] text-gray-600 uppercase tracking-widest">
            © 2025 Bloom SaaS Technologies. Paris, France.
          </div>
        </div>
      </div>
    </footer>
  )
}
