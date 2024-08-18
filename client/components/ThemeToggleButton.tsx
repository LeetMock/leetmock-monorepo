"use client";

import { useTheme } from "next-themes";
import { Button, ButtonProps } from "./ui/button";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import { useCallback } from "react";

export const ThemeToggleButton = ({ className, ...props }: ButtonProps) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <Button className={className} onClick={toggleTheme} variant="outline" size="icon" {...props}>
      {theme === "dark" ? (
        <SunIcon className="h-[1rem] w-[1rem]" />
      ) : (
        <MoonIcon className="h-[1rem] w-[1rem]" />
      )}
    </Button>
  );
};
