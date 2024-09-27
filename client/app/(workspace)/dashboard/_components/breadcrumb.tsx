import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn, toUpperCase } from "@/lib/utils";
import { ChevronRightIcon } from "lucide-react";
import { usePathname } from "next/navigation";

interface DashboardBreadcrumbProps {
  className?: string;
}

export const DashboardBreadcrumb: React.FC<DashboardBreadcrumbProps> = ({ className }) => {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter((segment) => segment !== "");

  return (
    <Breadcrumb className={cn("sticky top-0 z-50", className)}>
      <BreadcrumbList>
        {pathSegments.map((segment, index) => (
          <React.Fragment key={segment}>
            <BreadcrumbItem>
              {index < pathSegments.length - 1 ? (
                <BreadcrumbLink href={`/${pathSegments.slice(0, index + 1).join("/")}`}>
                  <span className="text-sm font-medium">{toUpperCase(segment)}</span>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>
                  <span className="text-sm font-medium">{toUpperCase(segment)}</span>
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < pathSegments.length - 1 && (
              <BreadcrumbSeparator>
                <ChevronRightIcon className="h-3.5 w-3.5 mt-px" />
              </BreadcrumbSeparator>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
