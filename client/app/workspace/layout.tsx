"use client";

import { Navbar } from "@/components/NavBar";
import { Authenticated } from "convex/react";

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Authenticated>
      <Navbar />
      {children}
    </Authenticated>
  );
}
