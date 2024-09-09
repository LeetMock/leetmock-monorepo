"use client";

import Link from "next/link";
import { Menu, Package2, Settings } from "lucide-react";
import { dark } from "@clerk/themes";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { UserButton } from "@clerk/clerk-react";
import { useTheme } from "next-themes";
import { PersonIcon } from "@radix-ui/react-icons";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: PersonIcon, title: "Interviews" },
  { href: "/dashboard/settings", icon: Settings, title: "Settings" },
];

function Nav({ items, mobile, className, ...props }: NavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex",
        mobile ? "flex-col space-y-2" : "space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
      {...props}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.href
              ? "bg-muted hover:bg-muted"
              : "hover:bg-transparent hover:underline",
            "justify-start",
            mobile ? "text-lg" : "text-sm"
          )}
        >
          <item.icon className={cn("mr-2 h-4 w-4", mobile && "h-5 w-5")} />
          {item.title}
        </Link>
      ))}
    </nav>
  );
}

interface NavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    icon: React.ElementType;
    title: string;
  }[];
  mobile?: boolean;
}

export default function DashboardNavBar({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme } = useTheme();

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="">LeetMock</span>
            </Link>
          </div>
          <div className="flex-1">
            <Nav items={navItems} />
          </div>
          <div className="mt-auto p-4">
            <Card x-chunk="dashboard-02-chunk-0">
              <CardHeader className="p-2 pt-0 md:p-4">
                <CardTitle>Upgrade to Pro</CardTitle>
                <CardDescription>
                  Unlock all features and get more interview time now!
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                <Button size="sm" className="w-full">
                  Upgrade
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <Nav items={navItems} mobile className="mt-4" />
              <div className="mt-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Upgrade to Pro</CardTitle>
                    <CardDescription>
                      Unlock all features and get unlimited access to our support team.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button size="sm" className="w-full">
                      Upgrade
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1 p-4">
            <Alert>
              <AlertDescription>🚀 Upgrade to Pro to get more interview time! 🚀</AlertDescription>
            </Alert>
          </div>
          <ThemeToggleButton variant="ghost" />
          <UserButton
            appearance={{
              baseTheme: theme === "dark" ? dark : undefined,
            }}
          />
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-2 xl:grid-cols-2 mt-4">
          {children}
        </main>
      </div>
    </div>
  );
}
