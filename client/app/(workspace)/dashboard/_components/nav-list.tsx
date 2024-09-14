import Link from "next/link";
import { Settings } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PersonIcon } from "@radix-ui/react-icons";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  icon: React.ElementType;
  title: string;
}

interface NavProps extends React.HTMLAttributes<HTMLDivElement> {}

const navItems: NavItem[] = [
  { href: "/dashboard/interviews", icon: PersonIcon, title: "Interviews" },
  { href: "/dashboard/settings/account", icon: Settings, title: "Settings" },
];

const NavList: React.FC<NavProps> = ({ className, ...props }) => {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col space-x-0 space-y-1", className)} {...props}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.href
              ? "bg-muted hover:bg-muted"
              : "hover:bg-transparent hover:underline",
            "justify-start text-sm"
          )}
        >
          <item.icon className={cn("mr-2 h-4 w-4")} />
          {item.title}
        </Link>
      ))}
    </nav>
  );
};

export default NavList;
