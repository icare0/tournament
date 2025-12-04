'use client'

import { useScrollReveal } from '@/hooks/useScrollReveal'
import {
  CustomCursor,
  Navigation,
  HeroSection,
  MarqueeSection,
  FeaturesSection,
  ShowcaseSection,
  PricingSection,
  FooterSection,
} from '@/components/landing'

export default function HomePage() {
  // Initialize scroll reveal animations
  useScrollReveal()

  return (
    <div className="bg-bloom-bg text-bloom-dark antialiased overflow-x-hidden selection:bg-bloom-accent selection:text-white cursor-none">
      {/* Noise Texture Overlay */}
      <div className="noise-overlay" />

      {/* Custom Cursor (Desktop only) */}
      <CustomCursor />

      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <HeroSection />

      {/* Marquee Section (Clients/Integrations) */}
      <MarqueeSection />

      {/* Features Bento Grid */}
      <FeaturesSection />

      {/* Showcase / SaaS Preview Section */}
      <ShowcaseSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* Footer */}
      <FooterSection />
    </div>
  )
}
