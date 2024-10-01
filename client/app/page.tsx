import { Hero } from "@/components/Hero";
import PricingPage from "./pricing/page";
import { FullScreenSection } from "@/components/FullScreenSection";

export default function Home() {
    return (
        <div className="snap-y snap-mandatory h-screen overflow-y-scroll">
            <FullScreenSection>
                <Hero />
            </FullScreenSection>
            <FullScreenSection>
                <PricingPage />
            </FullScreenSection>
        </div>
    );
}