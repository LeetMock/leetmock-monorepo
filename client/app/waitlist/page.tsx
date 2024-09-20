"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";

const WaitlistPage = () => {
  const [inviteCode, setInviteCode] = useState("");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInviteCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement your invite code verification logic here
    alert(`Invite code submitted: ${inviteCode}`);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div className="absolute rounded-full bg-blue-200 opacity-20 h-[500px] w-[500px] animate-pulse"></div>
          <div className="absolute rounded-full bg-blue-300 opacity-10 h-[700px] w-[700px]"></div>
          <div className="absolute rounded-full bg-blue-400 opacity-5 h-[900px] w-[900px]"></div>
        </div>
      </div>
      <Card className="relative z-10 w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        {mounted && (
          <div className="absolute top-4 right-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-gray-900 dark:text-white">
            Join the Waitlist
          </CardTitle>
          <CardDescription className="text-center mt-2 text-gray-600 dark:text-gray-300">
            We&apos;re excited to have you on board! Enter your invite code below to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 mt-4">
            <Input
              type="text"
              placeholder="Enter your invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaitlistPage;
