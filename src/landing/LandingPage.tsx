import React from 'react';
import HeroSection from './components/HeroSection';
import TunnelVisionSection from './components/TunnelVisionSection';
import FeaturesGrid from './components/FeaturesGrid';
import NeuralAudioSection from './components/NeuralAudioSection';
import HowItWorks from './components/HowItWorks';
import ComparisonSlider from './components/ComparisonSlider';
import SocialProofSection from './components/SocialProofSection';
import PricingSection from './components/PricingSection';

const LandingPage: React.FC = () => {
    return (
        <main className="w-full bg-osce-blue min-h-screen selection:bg-osce-orange selection:text-white">

            {/* 
        Section 1: Pinned Video Hero 
        Uses canvas to scrub through frames from 0-100% scroll.
      */}
            <HeroSection />

            {/*
        Section 2: The Problem (Knowing != Performing)
        Tunnel Vision Effect
      */}
            <TunnelVisionSection />

            {/* 
        Section 3: Interactive Bento Grid
        Spotlight borders + Micro animations
      */}
            <FeaturesGrid />

            {/*
        Section 4: Neural Audio Engine
        3D Orb + Voice Visualization
      */}
            <NeuralAudioSection />

            {/* 
        Section 5: How It Works (Living EKG Timeline)
        Dynamic SVG path with scroll-linked drawing
      */}
            <HowItWorks />

            {/* 
        Section 6: Before/After Interactive Slider
        Demonstrates the shift from old learning to new
      */}
            <ComparisonSlider />

            {/* 
        Section 7: Social Proof (Light Mode Break)
        Massive Counter + Infinite Marquees
      */}
            <SocialProofSection />

            {/* 
        Section 8: Premium Pricing (Holographic Lab)
        3D Tilt Cards + Number Roll
      */}
            <PricingSection />

            {/* Footer / Extra scroll space to demonstrate flow */}
            <footer className="w-full py-12 bg-osce-navy border-t border-osce-navy/50 text-center text-osce-navy/50 font-mono text-sm relative z-20">
                <div className="flex justify-center mb-6">
                    <img src="https://raw.githubusercontent.com/KhalidAbdullaziz/test/main/Assets/LogoPrimary.png" alt="OSCE Master" className="h-8 brightness-0 invert opacity-80" />
                </div>
                <p>© 2024 OSCE Master | Clinical Intelligence</p>
            </footer>
        </main>
    );
};

export default LandingPage;
