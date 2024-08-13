import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/NavBar";
import { Sponsors } from "@/components/Sponsors";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div>
      <Hero />
      <Sponsors />
    </div>
  );
}
