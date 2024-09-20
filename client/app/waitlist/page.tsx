"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function WaitlistPage() {
  const [inviteCode, setInviteCode] = useState("");

  const handleInviteCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement your invite code verification logic here
    alert(`Invite code submitted: ${inviteCode}`);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 overflow-hidden">
      {/* Radial Background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div className="absolute rounded-full bg-blue-200 opacity-20 h-[500px] w-[500px] animate-pulse"></div>
          <div className="absolute rounded-full bg-blue-300 opacity-10 h-[700px] w-[700px]"></div>
          <div className="absolute rounded-full bg-blue-400 opacity-5 h-[900px] w-[900px]"></div>
        </div>
      </div>

      {/* Center Card */}
      <Card className="relative z-10 w-full max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Join the Waitlist</CardTitle>
          <CardDescription className="text-center mt-2 text-gray-600">
            We&apos;re excited to have you on board! Enter your invite code below to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInviteCodeSubmit} className="mt-4">
            <div className="flex flex-col space-y-4">
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
