"use client";

import { Urbanist } from "next/font/google";
import { Stats } from "./_components/Stats";
import { Features } from "./_components/Features";
import { HeroSection } from "./_components/HeroSection";
import { Testimonials } from "./_components/Testimonials";
import { CallForActions } from "./_components/CallForActions";
import { Blog } from "./_components/Blog";
import AppHeader from "./_components/AppHeader";

const urbanist = Urbanist({ subsets: ["latin"] });

export default function LandingPage() {
  return (
    <div className={`!scroll-smooth ${urbanist.className}`}>
      <AppHeader />
      <div className="space-y-40 mb-40">
        <HeroSection />
        <Features />
        <Stats />
        <Testimonials />
        <CallForActions />
        <Blog />
      </div>
    </div>
  );
}
