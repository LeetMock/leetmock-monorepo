import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface UpgradeCardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const UpgradeCard: React.FC<UpgradeCardProps> = ({ className, ...props }) => {
  const router = useRouter();

  return (
    <Card className={cn("rounded-sm", className)} {...props}>
      <CardHeader className="p-4">
        <CardTitle>Upgrade to Premium</CardTitle>
        <CardDescription>Unlock all features and get more interview time now!</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Button
          size="sm"
          className="w-full"
          onClick={() => {
            router.push("/dashboard/settings/subscription");
          }}
        >
          Upgrade
        </Button>
      </CardContent>
    </Card>
  );
};
