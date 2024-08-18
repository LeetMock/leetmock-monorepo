"use client";

import { Authenticated } from "convex/react";

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Authenticated>{children}</Authenticated>;
}
