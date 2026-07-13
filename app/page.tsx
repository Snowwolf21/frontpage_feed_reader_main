"use client";

import Link from "next/link";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { useState } from "react";
import AuthModal from "./components/AuthModal";
import { useSkipToMain } from "./hooks/useSkipToMain";
import {
  InfiniteFeedIcon,
  StarIcon,
  DownloadIcon
} from "../components/ui/svg";

// 📦 STATIC CONTENT CONFIGURATIONS (Keeps the component body clean and maintainable)
const BRAND_LOGOS = ["VERCEL", "LINEAR", "STRIPE", "SUPABASE"] as const;

const FEATURES = [
  {
    title: "Infinite Feeds",
    svg: InfiniteFeedIcon({ width: 18 }),
    description: "Amalgamate any RSS, Atom, or JSON endpoint. Architect unified layouts engineered for clean indexing.",
  },
  {
    title: "Distraction-Free Reading",
    svg: StarIcon({ width: 18 }),
    description: "Zero telemetry tracking. Zero advertisement blocks. Pure cryptographic reader view for optimal data consumption.",
  },
  {
    title: "Cross-Platform Sync",
    svg: DownloadIcon({ width: 18 }),
    description: "Instant cloud synchronization across edge environments. Retain precise reading progress on any node.",
  },
] as const;

const PRICING_TIERS = [
  {
    id: "base",
    name: "Base Tier",
    tag: null,
    basePrice: 0,
    yearlyPrice: 0,
    description: "Perfect for exploration and casual feed caching setups.",
    features: [
      "Up to 15 active feed endpoints",
      "3-hour polling interval delta",
      "Standard dark aesthetic layout"
    ],
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro Tier",
    tag: "Popular",
    basePrice: 10,
    yearlyPrice: 8, // Price per month when billed annually
    description: "Designed for advanced operators and research analysts.",
    features: [
      "Unlimited active feed collections",
      "Real-time web socket updates",
      "AI-assisted article summaries",
      "Cryptographic offline support"
    ],
    highlighted: true,
  }
] as const;

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const { mainRef, skipToMain } = useSkipToMain();

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-50 font-sans selection:bg-white/20">
      {/* Premium Keyboard Accessibility */}
      <Link
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          skipToMain();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-zinc-950 focus:px-5 focus:py-2.5 focus:rounded-xl focus:font-bold focus:ring-4 focus:ring-white/20 transition-all"
      >
        Skip to main content
      </Link>

      {/* Cinematic Ambient Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-linear-to-b from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -top-[40%] left-[10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[160px] pointer-events-none" />

      <Header />

      <main
        ref={mainRef}
        id="main"
        tabIndex={-1}
        className="relative flex flex-col items-center justify-center pt-32 pb-24 px-6 text-center max-w-6xl mx-auto focus:outline-none"
      >
        <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-8 max-w-4xl text-balance bg-linear-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent leading-[1.05]">
          All your intelligence in one beautiful place.
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
          Frontpage unifies your essential data endpoints into a lightning-fast, secure workspace. Engineered for modern knowledge workers.
        </p>

        {/* Call to Actions with High-End Micro-shadows */}
        <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200 mb-32">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full sm:w-auto px-8 py-4 bg-slate-400 text-zinc-800 font-semibold rounded-2xl active:bg-slate-700 active:text-slate-200 md:hover:text-slate-200 md:hover:bg-slate-600 active:scale-[0.99] cursor-pointer focus:outline-2 focus:outline-offset-4 focus:outline-white transition-colors duration-200"
            aria-label="Initialize enterprise or free account tier"
          >
            Get Started Free
          </button>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 text-slate-300 font-semibold border-slate-800 border  bg-slate-900/80 active:bg-slate-500 active:text-slate-900  md:hover:bg-slate-700/90 md:hover:text-slate-100  md:hover:scale-[1.01] active:scale-[0.99] cursor-pointer focus:outline-2 focus:outline-offset-4 focus:outline-slate-600 rounded-2xl transition-colors duration-200"
          >
              Preview Dashboard
          </Link>
        </div>

        {/* 1. Dynamic Social Proof / Trust Matrix */}
        <div className="w-full max-w-4xl mb-32 opacity-40 grayscale transition-opacity hover:opacity-70 duration-500">
          <p className="text-xs uppercase tracking-widest text-zinc-500 mb-6 font-semibold">Powering parsing workflows for operators at</p>
          <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-6 text-sm font-bold tracking-wider">
            {BRAND_LOGOS.map((brand) => (
              <span key={brand}>{brand}</span>
            ))}
          </div>
        </div>

        {/* 2. Dynamic Core Product Grid Interface */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left mb-32 animate-in fade-in duration-1000 delay-400">
          {FEATURES.map((card, index) => (
            <div 
              key={index} 
              className="group flex flex-col p-8 rounded-3xl bg-slate-900/90 border border-slate-700 transition-all hover:border-slate-700 hover:bg-slate-800/50 focus-within:ring-2 focus-within:ring-indigo-500/50"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center mb-6 text-zinc-300 group-hover:text-white group-hover:border-zinc-700 transition-colors shrink-0">
                {card.svg}
              </div>  
              <h3 className="font-bold text-zinc-100 text-lg mb-3 tracking-tight">{card.title}</h3>
              <p className="text-sm text-zinc-200 leading-relaxed font-light">
                {card.description}
              </p>
            </div>
          ))}
        </div>

        {/* Interactive Pricing Section */}
        <div className="w-full border-t border-zinc-900 pt-24 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Transparent, performance-based pricing.</h2>
          <p className="text-zinc-400 text-sm md:text-base font-light mb-8">Choose the pipeline velocity that aligns with your daily reading demands.</p>
          
          {/* Custom Segmented Billing Toggle Switch */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-700 border border-slate-700 mb-12">
            <button 
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${billingCycle === "monthly" ? "bg-slate-900 text-white shadow-md" : "text-zinc-400 hover:text-zinc-200"}`}
            >
              Monthly billing
            </button>
            <button 
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${billingCycle === "yearly" ? "bg-slate-900 text-white shadow-md" : "text-zinc-400 hover:text-zinc-200"}`}
            >
              Annual plan <span className="px-1.5 py-0.5 rounded-md bg-slate-500/20 text-indigo-500 text-[10px] uppercase font-bold tracking-wider">Save 20%</span>
            </button>
          </div>

          {/* 3. Fully Dynamic Pricing Tier Cards Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto ">
            {PRICING_TIERS.map((tier) => {
              const currentPrice = billingCycle === "yearly" ? tier.yearlyPrice : tier.basePrice;

              return (
                <div 
                  key={tier.id}
                  className={`p-8 rounded-3xl transition-all duration-300 relative border ${
                    tier.highlighted 
                      ? "bg-slate-900/90 shadow-[0_0_40px_rgba(99,102,241,0.05)] border-slate-500/30" 
                      : "bg-slate-900/90 border-slate-500/30"
                  }`}
                >
                  {/* Absolute Optional Tier Badge */}
                  {tier.tag && (
                    <div className="absolute top-4 right-4 px-2 py-0.5 rounded-md bg-slate-500 text-white text-[10px] font-bold uppercase tracking-widest">
                      {tier.tag}
                    </div>
                  )}

                  <h4 className={`text-sm font-semibold uppercase tracking-wider ${tier.highlighted ? "text-slate-400" : "text-zinc-400"}`}>
                    {tier.name}
                  </h4>

                  <div className="text-4xl font-black font-mono tracking-tight mt-4">
                    ${currentPrice}
                    {currentPrice > 0 && <span className="text-sm font-medium text-zinc-200"> / month</span>}
                  </div>

                  <p className="text-xs text-zinc-200 mt-2">{tier.description}</p>
                  <div className="h-px bg-zinc-400 my-6" />

                  {/* Nested Dynamic Feature List Injection */}
                  <ul className="text-xs space-y-2.5">
                    {tier.features.map((feature, idx) => (
                      <li 
                        key={idx} 
                        className={`flex items-center gap-2 ${tier.highlighted ? "text-zinc-100" : "text-zinc-200"}`}
                      >
                        <span className={tier.highlighted ? "text-zinc-200" : "text-zinc-300"}>✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialView="signup"
      />
    </div>
  );
}