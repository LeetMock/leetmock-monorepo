import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export enum PriceTier {
  Free = 0,
  Premium = 1,
}

const priceTiers = [
  {
    name: "Free",
    description: "Free tier",
    value: PriceTier.Free,
    className: "bg-gray-100 text-gray-800",
  },
  {
    name: "Premium",
    description: "Premium tier",
    value: PriceTier.Premium,
    className: "bg-blue-100 text-blue-800",
  },
];

export const TierBadge: React.FC<{ tier: PriceTier }> = ({ tier }) => {
  const tierData = priceTiers.find((t) => t.value === tier);
  return (
    <div
      className={cn(
        "flex items-center px-2 py-1 rounded-full text-xs font-medium",
        tierData?.className
      )}
    >
      <Star className="w-3 h-3 mr-1" />
      {tierData?.name}
    </div>
  );
};
