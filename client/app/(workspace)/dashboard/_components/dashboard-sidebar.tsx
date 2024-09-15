import Link from "next/link";
import { Package2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import NavList from "./dashboard-navlist";

const DashboardSidebar = () => {
  return (
    <div className="flex h-full flex-col space-y-2 border-r bg-muted/30 w-72 flex-shrink-0">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-3">
          <Package2 className="h-6 w-6" />
          <span className="font-semibold text-xl">LeetMock</span>
        </Link>
      </div>
      <div className="flex-1">
        <NavList />
      </div>
      <div className="mt-auto p-4">
        <Card>
          <CardHeader className="p-4">
            <CardTitle>Upgrade to Pro</CardTitle>
            <CardDescription>Unlock all features and get more interview time now!</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Button size="sm" className="w-full">
              Upgrade
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardSidebar;
