"use client";

import { useTheme } from "next-themes";
import { Button, ButtonProps } from "./ui/button";
import { Sun, Moon } from "lucide-react";
import { useCallback } from "react";

export const ThemeToggleButton = ({ className, ...props }: ButtonProps) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <Button className={className} onClick={toggleTheme} variant="outline" size="icon" {...props}>
      {theme === "dark" ? (
        <Sun className="h-[1rem] w-[1rem]" />
      ) : (
        <Moon className="h-[1rem] w-[1rem]" />
      )}
    </Button>
  );
};
