import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/NavBar";
import { Sponsors } from "@/components/Sponsors";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Sponsors />
    </div>
  );
}
