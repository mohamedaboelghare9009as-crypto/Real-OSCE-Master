import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import FeaturesGrid from '../components/landing/FeaturesGrid';
import HowItWorks from '../components/landing/HowItWorks';
import ContentSection from '../components/landing/ContentSection';

export default function Landing() {
    return (
        <main className="w-full bg-black min-h-screen">

            {/* 
        Section 1: Pinned Video Hero 
        Uses canvas to scrub through frames from 0-100% scroll.
      */}
            <HeroSection />

            {/* 
        Section 2: Interactive Bento Grid
        Spotlight borders + Micro animations
      */}
            <FeaturesGrid />

            {/* 
        Section 3: How It Works (Living EKG Timeline)
        Dynamic SVG path with scroll-linked drawing
      */}
            <HowItWorks />

            {/* 
        Section 4: Content / CTA
      */}
            <ContentSection />

            {/* Footer */}
            <footer className="w-full py-12 bg-zinc-900 border-t border-zinc-800 text-center text-zinc-600 font-mono text-sm">
                <p>OSCE Master | Clinical Simulation Platform</p>
                <p className="mt-2 text-zinc-700">Engineering Demo</p>
            </footer>
        </main>
    );
}