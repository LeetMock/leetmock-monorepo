"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const StudyPlanRedirectPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the coding dashboard
    router.push("/dashboard/coding");
  }, [router]);

  // Return a minimal loading state while redirecting
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
};

export default StudyPlanRedirectPage;
