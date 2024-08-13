import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

// // Only use this if mobile menu is needed
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from "@/components/ui/sheet";
// import { useState } from "react";
// import { Menu } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { LogoIcon } from "@/components/Icons";
import Link from "next/link";
import { ThemeToggleButton } from "./ThemeToggleButton";
// import {
//   ClerkProvider,
//   SignInButton,
//   SignedIn,
//   SignedOut,
//   UserButton
// } from '@clerk/nextjs'

interface RouteProps {
  href: string;
  label: string;
}

const routeList: RouteProps[] = [
  {
    href: "#features",
    label: "Features",
  },
  {
    href: "#Feedback",
    label: "Feedback",
  },
  {
    href: "#pricing",
    label: "Pricing",
  },
  {
    href: "#faq",
    label: "FAQ",
  },
];

export const Navbar = () => {
  // const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <header className="sticky flex border-b items-center justify-between px-4 top-0 border-b-1 h-16 z-40 w-full dark:border-b-slate-700 dark:bg-background">
      <div>
        <a rel="noreferrer noopener" href="/" className="flex items-center font-bold text-xl">
          <LogoIcon />
          LeetMock
        </a>
      </div>
      <NavigationMenu>
        <NavigationMenuList>
          {/* <NavigationMenuList className="container h-14 px-4 w-full flex items-center justify-between"> */}
          {/* mobile Buggy not useable for now */}
          {/* <span className="flex md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger className="px-2">
                <Menu
                  className="flex md:hidden h-5 w-5"
                  onClick={() => setIsOpen(true)}
                >
                  <span className="sr-only">Menu Icon</span>
                </Menu>
              </SheetTrigger>

              <SheetContent side={"left"}>
                <SheetHeader>
                  <SheetTitle className="font-bold text-xl">
                    LeetMock
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col justify-center items-center gap-2 mt-4">
                  {routeList.map(({ href, label }: RouteProps) => (
                    <a
                      rel="noreferrer noopener"
                      key={label}
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className={buttonVariants({ variant: "ghost" })}
                    >
                      {label}
                    </a>
                  ))}
                  <a
                    rel="noreferrer noopener"
                    href="https://github.com/leoMirandaa/shadcn-landing-page.git"
                    target="_blank"
                    className={`w-[110px] border ${buttonVariants({
                      variant: "secondary",
                    })}`}
                  >
                    Github
                  </a>
                </nav>
              </SheetContent>
            </Sheet>
          </span> */}

          {/* desktop */}
          <NavigationMenuItem className="hidden md:flex gap-4">
            {routeList.map((route: RouteProps, i) => (
              <a
                rel="noreferrer noopener"
                href={route.href}
                key={i}
                className={`text-[17px] ${buttonVariants({
                  variant: "ghost",
                })}`}
              >
                {route.label}
              </a>
            ))}
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex justify-center items-center space-x-3">
        <ThemeToggleButton />
        {/* <SignedOut>
          <SignInButton mode="modal">
            <Button>Login</Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn> */}
      </div>
    </header>
  );
};
