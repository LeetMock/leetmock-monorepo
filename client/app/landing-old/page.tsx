import { FullScreenSection } from "@/components/full-screen-section";
import { Hero } from "@/components/Hero";
import PricingPage from "../pricing/page";

export default function Home() {
  return (
    <div className="h-screen overflow-y-auto snap-y snap-mandatory">
      <FullScreenSection>
        <Hero />
      </FullScreenSection>
      <FullScreenSection>
        <PricingPage />
      </FullScreenSection>
    </div>
  );
}
