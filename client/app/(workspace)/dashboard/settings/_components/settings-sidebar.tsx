"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface SettingsSidebarProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
  }[];
}

export function SettingsSidebar({ className, items, ...props }: SettingsSidebarProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col items-center space-y-2", className)} {...props}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center text-base px-4 py-2 space-x-3 font-medium w-full rounded-md",
            "transition-all duration-200",
            pathname === item.href ? "bg-muted hover:bg-muted" : "hover:bg-muted/60"
          )}
        >
          <span>{item.title}</span>
        </Link>
      ))}
    </nav>
  );
}
