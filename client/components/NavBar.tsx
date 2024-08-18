import { useTheme } from "next-themes";
import { dark } from "@clerk/themes";
import { UserButton } from "@clerk/clerk-react";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const { theme } = useTheme();

  return (
    <header className={"sticky border-b top-0 w-full dark:bg-background h-14"}>
      <div className="h-full flex items-center justify-between container">
        <div>
          <a rel="noreferrer noopener" href="/" className="flex items-center font-bold text-xl">
            LeetMock
          </a>
        </div>
        <div className="flex justify-center items-center space-x-4">
          <ThemeToggleButton variant="ghost" />
          <UserButton
            appearance={{
              baseTheme: theme === "dark" ? dark : undefined,
            }}
          />
        </div>
      </div>
    </header>
  );
};
