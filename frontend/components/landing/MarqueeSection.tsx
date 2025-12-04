'use client'

export function MarqueeSection() {
  return (
    <div className="border-y border-bloom-dark/10 py-6 overflow-hidden bg-bloom-bg relative z-10">
      <div className="whitespace-nowrap animate-marquee flex gap-16 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
        {/* Simulated Logos using text for simplicity */}
        <div className="flex items-center gap-2">
          <span className="font-sans font-bold text-xl">🎮</span>
          <span className="font-sans font-bold text-xl">TWITCH</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-sans font-bold text-xl">💳</span>
          <span className="font-sans font-bold text-xl">STRIPE</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-sans font-bold text-xl">💬</span>
          <span className="font-sans font-bold text-xl">DISCORD</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-sans font-bold text-xl">🏆</span>
          <span className="font-sans font-bold text-xl">RIOT API</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-sans font-bold text-xl">💾</span>
          <span className="font-sans font-bold text-xl">STEAM</span>
        </div>
        {/* Duplicated */}
        <div className="flex items-center gap-2">
          <span className="font-sans font-bold text-xl">🎮</span>
          <span className="font-sans font-bold text-xl">TWITCH</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-sans font-bold text-xl">💳</span>
          <span className="font-sans font-bold text-xl">STRIPE</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-sans font-bold text-xl">💬</span>
          <span className="font-sans font-bold text-xl">DISCORD</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-sans font-bold text-xl">🏆</span>
          <span className="font-sans font-bold text-xl">RIOT API</span>
        </div>
      </div>
    </div>
  )
}
