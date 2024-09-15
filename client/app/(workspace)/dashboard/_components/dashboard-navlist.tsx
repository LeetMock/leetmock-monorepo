import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { LayoutDashboard, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  icon: React.ElementType;
  title: string;
}

interface NavProps extends React.HTMLAttributes<HTMLDivElement> {}

const navItems: NavItem[] = [
  { href: "/dashboard/interviews", icon: LayoutDashboard, title: "Interviews" },
  { href: "/dashboard/settings/account", icon: Settings, title: "Settings" },
];

export const NavList: React.FC<NavProps> = ({ className, ...props }) => {
  const pathname = usePathname();

  return (
    <nav
      className={cn("flex flex-col justify-center items-center space-y-2 mx-2", className)}
      {...props}
    >
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center text-base px-2 py-2 space-x-3 font-medium w-full rounded-md",
            "transition-all duration-200",
            pathname === item.href ? "bg-muted hover:bg-muted" : "hover:bg-muted/60"
          )}
        >
          <item.icon className={cn("h-4 w-4")} />
          <span>{item.title}</span>
        </Link>
      ))}
    </nav>
  );
};
