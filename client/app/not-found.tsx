"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-9xl font-bold text-muted-foreground/20">404</div>
      <h1 className="text-4xl font-bold mt-4">Page Not Found</h1>
      <p className="text-muted-foreground mt-2 text-center max-w-[500px]">
        The page you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to
        access it.
      </p>
      <div className="flex gap-4 mt-8">
        <Button onClick={() => router.back()}>Go Back</Button>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
