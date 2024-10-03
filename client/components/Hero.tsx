"use client";

import { Button } from "@/components/ui/button";
import { HeroCards } from "@/components/HeroCards";
import Link from "next/link";
import { useAuth } from "@clerk/clerk-react";
import { Cpu, Braces, Users, Brain } from "lucide-react"; // Add these imports
import TiltCard from "@/components/animata/card/tilted-card";
import ScrollingTestimonials from "./animata/container/scrolling-testimonials";

interface ids {
  href: string;
}

// export const AuthButtons = () => {
//   return (
//     <>
//       <SignedOut>
//         <SignInButton mode="modal">
//           <Button className="w-full md:w-1/3" variant="default" size="lg">
//             Get Started
//           </Button>
//         </SignInButton>
//       </SignedOut>
//       <SignedIn>
//         <Link href="/interview" passHref>
//           <Button className="w-full md:w-1/3" variant="default" size="lg">
//             Get Started
//           </Button>
//         </Link>
//       </SignedIn>
//     </>
//   );
// };

export const Hero = () => {
  const { isSignedIn, isLoaded } = useAuth();

  const titleIcons = [
    { emoji: "🤖", position: "-left-20 top-0 group-hover:-rotate-[10deg] group-hover:-translate-y-6" },
    { emoji: "💡", position: "right-20 top-0 group-hover:rotate-[10deg] group-hover:-translate-y-6" },
    { emoji: "😊", position: "-left-20 bottom-0 group-hover:-rotate-[10deg] group-hover:translate-y-6" },
    { emoji: "📊", position: "right-20 bottom-0 group-hover:rotate-[10deg] group-hover:translate-y-6" },
  ];

  return (
    <section className="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10">
      <div className="text-center lg:text-start space-y-6">
        <main className="text-5xl md:text-6xl font-bold">
          <div className="group relative inline-block p-8">
            <h1 className="relative z-10">
              <span className="inline bg-gradient-to-r from-[#F596D3] to-[#D247BF] text-transparent bg-clip-text">
                LeetMock
              </span>
              <br />
              <span className="inline bg-gradient-to-r from-[#61DAFB] via-[#1fc0f1] to-[#03a3d7] text-transparent bg-clip-text">
                AI
              </span>{" "}
              Powered
              <br />
              Mock Interview Platform
            </h1>
            <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {titleIcons.map((icon, index) => (
                <span
                  key={index}
                  className={`absolute transform text-6xl transition-transform duration-500 group-hover:scale-110 ${icon.position}`}
                >
                  {icon.emoji}
                </span>
              ))}
            </div>
          </div>
        </main>
        <p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0">
          Practice coding interviews with AI. Get personalized feedback. Improve interview skills.
        </p>
        {isLoaded && (
          <div className="space-y-4 md:space-y-0 md:space-x-4">
            {!!isSignedIn ? (
              <Link href="/dashboard" passHref>
                <TiltCard
                  className="hover:bg-blue-400 hover:border-blue-400 inline-block"
                  title="Go to Workspace"
                />
              </Link>
            ) : (
              <Link href="/auth" passHref>
                <TiltCard
                  className="hover:bg-blue-400 hover:border-blue-400 inline-block"
                  title="Get Started"
                />
              </Link>
            )}
          </div>
        )}
      </div>
      {/* Hero cards sections */}
      <div className="z-10">
        <HeroCards />
      </div>
      {/* Shadow effect */}
      <div className="shadow"></div>

      
    </section>
  );
};
