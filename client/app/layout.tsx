import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";

import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { DevTool } from "@/components/dev-tool";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "LeetMock",
  description: "Mock Interview like Ever Before",
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
    ],
    apple: [
      { url: "/logo.png" }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head />
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange>
          <ConvexClientProvider>
            {children}
            <Toaster
              duration={1500}  // 1.5 seconds
            />
            <DevTool />
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
