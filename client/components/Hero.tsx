import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { HeroCards } from "@/components/HeroCards";
import Link from "next/link";
import {
  SignInButton,
  SignedIn,
  SignedOut,
} from '@clerk/nextjs';
import { Sign } from "crypto";

interface ids {
  href: string;
}

export const AuthButtons = () => {
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <Button className="w-full md:w-1/3" variant="default" size="lg">
            Get Started
          </Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <Link href="/interview" passHref>
        <Button className="w-full md:w-1/3" variant="default" size="lg">
            Get Started
          </Button>
        </Link>
      </SignedIn>
    </>
  );
};

export const Hero = () => {
  return (
    <section className="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10">
      <div className="text-center lg:text-start space-y-6">
        <main className="text-5xl md:text-6xl font-bold">
          <h1 className="inline">
            <span className="inline bg-gradient-to-r from-[#F596D3]  to-[#D247BF] text-transparent bg-clip-text">
              LeetMock
            </span>
          </h1>
          <br />
          <h2 className="inline">
            <span className="inline bg-gradient-to-r from-[#61DAFB] via-[#1fc0f1] to-[#03a3d7] text-transparent bg-clip-text">
              AI
            </span>{" "}
            Powered
            <br />
            Mock Interview Platform
          </h2>
        </main>

        <p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0">
          Practice coding interviews with AI. Get instant feedback. Improve interview skills.
        </p>

        <div className="space-y-4 md:space-y-0 md:space-x-4">
          <AuthButtons />
        </div>
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
