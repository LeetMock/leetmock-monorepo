"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserProfile } from "@/hooks/use-user-profile";
import { MINUTE_PRICE, MINUTE_PRICE_DISCOUNTED } from "@/lib/constants";
import { useUser } from "@clerk/clerk-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";

const SubscriptionPage: React.FC = () => {
  const { theme } = useTheme();

  useEffect(() => {
    // Load Stripe Pricing Table script
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/pricing-table.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up the script when the component unmounts
      document.body.removeChild(script);
    };
  }, []);

  const { user } = useUser();
  const { userProfile } = useUserProfile();

  const pricingTableId = theme === 'dark'
    ? process.env.NEXT_PUBLIC_PRICING_TABLE_ID_DARK
    : process.env.NEXT_PUBLIC_PRICING_TABLE_ID_LIGHT;
  const pricingTableKey = theme === 'dark'
    ? process.env.NEXT_PUBLIC_PRICING_TABLE_KEY_DARK
    : process.env.NEXT_PUBLIC_PRICING_TABLE_KEY_LIGHT;
  return (
    <div>
      <div className="flex justify-center mb-8 gap-4">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Badge
                  variant={userProfile!.subscription === "free" ? "outline" : "default"}
                  className={`text-lg py-1 px-2 font-semibold ${userProfile!.subscription === "basic"
                    ? "bg-gradient-to-r from-blue-400 to-cyan-300 text-white"
                    : userProfile!.subscription === "premium"
                      ? "bg-gradient-to-r from-purple-400 to-pink-500 text-white"
                      : userProfile!.subscription === "enterprise"
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse"
                        : ""
                    }`}
                >
                  {userProfile!.subscription.charAt(0).toUpperCase() +
                    userProfile!.subscription.slice(1)}
                </Badge>
              </div>
              {userProfile!.subscription !== "free" && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() =>
                    window.open(
                      `${process.env.NEXT_PUBLIC_MANAGE_SUBSCRIPTION_URL}?prefilled_email=${user!.emailAddresses[0].emailAddress}`,
                      "_blank"
                    )
                  }
                >
                  Manage Subscription
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {userProfile!.minutesRemaining} minutes remaining
            </p>
            {userProfile!.subscription !== "free" && (
              <p className="text-xs font-semibold text-yellow-600 mt-2 p-2 bg-yellow-100 rounded-md">
                The minutes will be refreshed at{" "}
                {(!!userProfile!.refreshDate &&
                  new Date(userProfile!.refreshDate * 1000).toLocaleString()) ||
                  new Date(userProfile!.currentPeriodEnd! * 1000).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buy Minutes Beyond Your Plan</CardTitle>
          </CardHeader>
          <CardContent>
            {userProfile!.subscription === "free" ? (
              <p className="text-sm text-muted-foreground">
                You must subscribe to a plan before buying extra minutes.
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{`${MINUTE_PRICE_DISCOUNTED * 60} / 60 minutes`}</div>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() =>
                      window.open(
                        `${process.env.NEXT_PUBLIC_BUY_MINUTES_URL}?prefilled_email=${user!.emailAddresses[0].emailAddress}`,
                        "_blank"
                      )
                    }
                  >
                    Buy Now
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  <s>Original: ${MINUTE_PRICE}/min</s>
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Now Discounted: ${MINUTE_PRICE_DISCOUNTED}/min
                </p>
                <p className="text-xs font-semibold text-yellow-600 mt-2 p-2 bg-yellow-100 rounded-md">
                  The extra minutes will be refreshed at{" "}
                  {(!!userProfile!.refreshDate &&
                    new Date(userProfile!.refreshDate * 1000).toLocaleString()) ||
                    new Date(userProfile!.currentPeriodEnd! * 1000).toLocaleString()}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      {/* @ts-ignore */}
      <stripe-pricing-table
        pricing-table-id={pricingTableId}
        publishable-key={pricingTableKey}
        customer-email={user!.emailAddresses[0].emailAddress}
      >
        {/* @ts-ignore */}
      </stripe-pricing-table>
    </div>
  );
};

export default SubscriptionPage;
