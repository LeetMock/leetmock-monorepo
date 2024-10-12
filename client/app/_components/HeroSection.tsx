import Link from "next/link";
import TiltCard from "@/components/animata/card/tilted-card";
import { useAuth } from "@clerk/clerk-react";
import { Container } from "./Container";

export const HeroSection = () => {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <div className="relative" id="home">
      <div
        aria-hidden="true"
        className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40 dark:opacity-20"
      >
        <div className="blur-[106px] h-56 bg-gradient-to-br from-primary to-purple-400 dark:from-blue-700"></div>
        <div className="blur-[106px] h-32 bg-gradient-to-r from-cyan-400 to-sky-300 dark:to-indigo-600"></div>
      </div>
      <Container>
        <div className="relative pt-36 ml-auto">
          <div className="lg:w-2/3 text-center mx-auto">
            <h1 className="text-gray-900 dark:text-white font-bold text-5xl md:text-6xl xl:text-7xl">
              Practice technical interview with
              <br />
              <span className="bg-gradient-to-r from-[#F596D3] to-[#D247BF] text-transparent bg-clip-text">
                LeetMock AI.
              </span>
            </h1>
            <p className="mt-8 text-gray-700 dark:text-gray-300">
              Practice coding interviews with AI. Get personalized feedback. Improve interview
              skills.
            </p>
            {isLoaded && (
              <div className="mt-16 flex flex-wrap justify-center gap-y-4 gap-x-6">
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
            <div className="hidden py-8 mt-16 border-y border-gray-100 dark:border-gray-800 sm:flex justify-between items-stretch">
              <div className="flex-1 flex flex-col">
                <h6 className="text-lg font-semibold text-gray-700 dark:text-white mb-auto text-center">
                  Personalized Evaluation
                </h6>
                <div className="mt-2 flex-grow flex items-start">
                  <p className="text-gray-500 text-left">
                    Get personalized feedback on your skills and performance.
                  </p>
                </div>
              </div>
              <div className="flex-1 mx-4 flex flex-col">
                <h6 className="text-lg font-semibold text-gray-700 dark:text-white mb-auto text-center">
                  Effective Practice
                </h6>
                <div className="mt-2 flex-grow flex items-start">
                  <p className="text-gray-500 text-left">
                    Practice interviews with AI. Improve skills via the unique experience.
                  </p>
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <h6 className="text-lg font-semibold text-gray-700 dark:text-white mb-auto text-center">
                  Flexible Schedule
                </h6>
                <div className="mt-2 flex-grow flex items-start">
                  <p className="text-gray-500 text-left">
                    Practice coding interviews at your own pace. No need to wait for a slot.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6">
            <div className="p-4 grayscale transition duration-200 hover:grayscale-0">
              <img
                src="./clients/microsoft.svg"
                className="h-12 w-auto mx-auto"
                loading="lazy"
                alt="client logo"
                width=""
                height=""
              />
            </div>
            <div className="p-4 grayscale transition duration-200 hover:grayscale-0">
              <img
                src="./clients/airbnb.svg"
                className="h-12 w-auto mx-auto"
                loading="lazy"
                alt="client logo"
                width=""
                height=""
              />
            </div>
            <div className="p-4 flex grayscale transition duration-200 hover:grayscale-0">
              <img
                src="./clients/google.svg"
                className="h-9 w-auto m-auto"
                loading="lazy"
                alt="client logo"
                width=""
                height=""
              />
            </div>
            <div className="p-4 grayscale transition duration-200 hover:grayscale-0">
              <img
                src="./clients/nvidia.svg"
                className="h-12 w-auto mx-auto"
                loading="lazy"
                alt="client logo"
                width=""
                height=""
              />
            </div>
            <div className="p-4 flex grayscale transition duration-200 hover:grayscale-0">
              <img
                src="./clients/netflix.svg"
                className="h-8 w-auto m-auto"
                loading="lazy"
                alt="client logo"
                width=""
                height=""
              />
            </div>
            <div className="p-4 grayscale transition duration-200 hover:grayscale-0">
              <img
                src="./clients/google-cloud.svg"
                className="h-12 w-auto mx-auto"
                loading="lazy"
                alt="client logo"
                width=""
                height=""
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};
