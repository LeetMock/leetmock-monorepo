"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";


const SubscriptionPage: React.FC = () => {
  useEffect(() => {
    // Load Stripe Pricing Table script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up the script when the component unmounts
      document.body.removeChild(script);
    };
  }, []);

  const { user } = useUser();
  const { userProfile } = useUserProfile();
  console.log(userProfile);

  return (
    <div>
      <div className="flex justify-center mb-8 gap-4">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {userProfile!.subscription.charAt(0).toUpperCase() + userProfile!.subscription.slice(1)}
              </div>
              <Button variant="default" size="sm"
                onClick={() => window.open(`https://billing.stripe.com/p/login/test_28oeYK5gk2N27nidQQ?prefilled_email=${user!.emailAddresses[0].emailAddress}`, '_blank')}
              >
                Manage Subscription
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {userProfile!.minutesRemaining} minutes remaining
            </p>
          </CardContent>
        </Card>
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Buy Minutes Beyond Your Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {`$${"TBD"} / 60 minutes`}
              </div>
              <Button variant="default" size="sm"
                onClick={() => window.open(`https://billing.stripe.com/p/login/test_28oeYK5gk2N27nidQQ?prefilled_email=${user!.emailAddresses[0].emailAddress}`, '_blank')}
              >
                Buy Now
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Basic: $TBD / 60 mins
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Premium: $TBD / 60 mins
            </p>
          </CardContent>
        </Card>
      </div>
      {/* @ts-ignore */}
      <stripe-pricing-table
        pricing-table-id="prctbl_1Q5KMgB2uc8lODcNGav3acOC"
        publishable-key="pk_test_51Q5JueB2uc8lODcNMXsM6GYMeI2vhRf4d0XCvjk1sQp4SvBrJuLTyI0v8q1c0uB47qvqHV3cHMVvOyvB2kcaDB5t008enIiH1z"
        customer-email={user!.emailAddresses[0].emailAddress}>
        {/* @ts-ignore */}
      </stripe-pricing-table>

    </div>
  );
};

export default SubscriptionPage;
