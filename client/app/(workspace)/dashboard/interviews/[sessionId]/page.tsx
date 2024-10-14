"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import React, { useMemo } from "react";
import { CodeWorkspace } from "./_components/code-workspace";

const InterviewPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const sessionExists = useQuery(api.sessions.exists, { sessionId });

  const interviewWorkspace = useMemo(() => {
    if (sessionExists === undefined) {
      return <div>Loading...</div>;
    }

    if (sessionExists === false) {
      return <div>Session not found</div>;
    }

    return <CodeWorkspace sessionId={sessionId as Id<"sessions">} />;
  }, [sessionExists, sessionId]);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-muted/80 w-full p-2 space-y-2">
      {interviewWorkspace}
    </div>
  );
};

export default InterviewPage;
