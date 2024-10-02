import { Hero } from "@/components/Hero";
import PricingPage from "./pricing/page";
import { FullScreenSection } from "@/components/FullScreenSection";

export default function Home() {
    return (
        <div className="home-container h-screen overflow-y-auto snap-y snap-mandatory">
            <FullScreenSection>
                <Hero />
            </FullScreenSection>
            <FullScreenSection>
                <PricingPage />
            </FullScreenSection>
        </div>
    );
}