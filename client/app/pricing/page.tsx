import { Button } from "@/components/ui/button";
import Link from "next/link";

function PricingPage() {
  // display not implemented yet, redirect to home, use a nice icon
  return (
    <div>
      <div className="flex flex-col items-center justify-center h-screen gap-8">
        <h1 className="text-4xl font-bold">Pricing</h1>
        <p className="text-lg">This feature is not implemented yet.</p>
        <Link href="/dashboard">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  );
}

export default PricingPage;
