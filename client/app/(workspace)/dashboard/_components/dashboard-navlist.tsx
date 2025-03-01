import { cn } from "@/lib/utils";
import { LayoutDashboard, Settings, Code2, Network, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  icon: React.ElementType;
  title: string;
  children?: { href: string; title: string; icon?: React.ElementType; }[];
}

interface NavProps extends React.HTMLAttributes<HTMLDivElement> { }

const navItems: NavItem[] = [
  {
    href: "/dashboard/interviews",
    icon: LayoutDashboard,
    title: "Interviews",
    children: [
      { href: "/dashboard/coding", title: "Coding", icon: Code2 },
      { href: "/dashboard/behavior", title: "Behavior", icon: Users },
      { href: "/dashboard/system-design", title: "System Design", icon: Network },
    ]
  },
  { href: "/dashboard/settings/account", icon: Settings, title: "Account" },
];

export const NavList: React.FC<NavProps> = ({ className, ...props }) => {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col items-center space-y-2", className)} {...props}>
      {navItems.map((item) => (
        <div key={item.href} className="w-full">
          <Link
            href={item.href}
            className={cn(
              "flex items-center text-base px-2 py-1.5 space-x-3 font-medium w-full rounded-sm",
              "transition-all duration-200 hover:bg-muted",
              pathname === item.href && "bg-muted"
            )}
          >
            <item.icon className={cn("h-4 w-4")} />
            <span>{item.title}</span>
          </Link>
          {item.children && (
            <div className="ml-6 mt-1 space-y-1">
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    "flex items-center text-sm px-2 py-1.5 space-x-3 w-full rounded-sm",
                    "transition-all duration-200 hover:bg-muted",
                    pathname === child.href && "bg-muted"
                  )}
                >
                  {child.icon && <child.icon className="h-4 w-4" />}
                  <span>{child.title}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
};
