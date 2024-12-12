"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Container } from "./Container";
const links = [
  {
    to: "/#features",
    label: "Features",
  },
  {
    to: "/#solution",
    label: "Solution",
  },
  {
    to: "/#reviews",
    label: "Reviews",
  },
];

export default function AppHeader() {
  const [isToggled, setIsToggled] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const toggleNavlinks = () => {
      const navlinks = document.querySelector("#navlinks");
      const hamburger = document.querySelector("#hamburger");
      const layer = document.querySelector("#navLayer");

      if (isToggled) {
        navlinks?.classList.add("!visible", "!scale-100", "!opacity-100", "!lg:translate-y-0");
        hamburger?.classList.add("toggled");
        layer?.classList.add("origin-top", "scale-y-100");
      } else {
        navlinks?.classList.remove("!visible", "!scale-100", "!opacity-100", "!lg:translate-y-0");
        hamburger?.classList.remove("toggled");
        layer?.classList.remove("origin-top", "scale-y-100");
      }
    };

    toggleNavlinks();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isToggled]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-lg" : "bg-transparent"
        }`}
    >
      <nav className={`w-full transition-all duration-300 ${isScrolled ? "py-2" : "py-4"}`}>
        <Container>
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 md:gap-0 md:py-4">
            <div className="relative z-20 flex w-full justify-between md:px-0 lg:w-max">
              <Link href="/#home" aria-label="logo" className="flex items-center space-x-2">
                <div aria-hidden="true" className="flex items-center">
                  <Image
                    src="/logo.png"
                    alt="LeetMock.AI Logo"
                    width={40}
                    height={40}
                    className="h-10 w-auto"
                  />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  LeetMock.AI
                </span>
              </Link>

              <div className="relative flex max-h-10 items-center lg:hidden">
                <button
                  aria-label="hamburger"
                  id="hamburger"
                  className="relative -mr-6 p-6"
                  onClick={() => setIsToggled(!isToggled)}
                >
                  <div
                    aria-hidden="true"
                    id="line"
                    className="m-auto h-0.5 w-5 rounded bg-sky-900 transition duration-300 dark:bg-gray-300"
                  ></div>
                  <div
                    aria-hidden="true"
                    id="line2"
                    className="m-auto mt-2 h-0.5 w-5 rounded bg-sky-900 transition duration-300 dark:bg-gray-300"
                  ></div>
                </button>
              </div>
            </div>
            <div
              id="navLayer"
              aria-hidden="true"
              className="fixed inset-0 z-10 h-screen w-screen origin-bottom scale-y-0 bg-white/70 backdrop-blur-2xl transition duration-500 dark:bg-gray-900/70 lg:hidden"
            ></div>
            <div
              id="navlinks"
              className="invisible absolute top-full left-0 z-20 w-full origin-top-right translate-y-1 scale-90 flex-col flex-wrap justify-end gap-6 rounded-3xl border border-gray-100 bg-white p-8 opacity-0 shadow-2xl shadow-gray-600/10 transition-all duration-300 dark:border-gray-700 dark:bg-gray-800 dark:shadow-none lg:visible lg:relative lg:flex lg:w-7/12 lg:translate-y-0 lg:scale-100 lg:flex-row lg:items-center lg:gap-0 lg:border-none lg:bg-transparent lg:p-0 lg:opacity-100 lg:shadow-none"
            >
              <div className="w-full text-gray-600 dark:text-gray-200 lg:w-auto lg:pr-4 lg:pt-0">
                <ul className="flex flex-col gap-6 tracking-wide lg:flex-row lg:gap-0 lg:text-sm">
                  {links.map((link) => (
                    <li key={link.to}>
                      <Link
                        href={link.to}
                        className="hover:text-orange-500 block transition dark:hover:text-white md:px-4"
                        onClick={() => setIsToggled(false)}
                      >
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/pricing"
                      className="flex gap-2 font-semibold text-gray-700 transition hover:text-orange-500 dark:text-white dark:hover:text-white md:px-4"
                    >
                      <span>Premium</span>
                      <span className="flex rounded-full bg-primary/20 px-1.5 py-0.5 text-xs tracking-wider text-purple-700 dark:bg-white/10 dark:text-orange-300">
                        {" "}
                        new
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="mt-12 lg:mt-0">
                <Link
                  href="/dashboard"
                  className="relative flex h-9 w-full items-center justify-center px-4 before:absolute before:inset-0 before:rounded-full before:bg-blue-600 dark:before:bg-orange-500 before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
                >
                  <span className="relative text-sm font-semibold text-white">Get Started</span>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </nav>
      <style jsx>{`
        #hamburger.toggled #line {
          @apply translate-y-1.5 rotate-45;
        }
        #hamburger.toggled #line2 {
          @apply -translate-y-1 -rotate-45;
        }
      `}</style>
    </header>
  );
}
