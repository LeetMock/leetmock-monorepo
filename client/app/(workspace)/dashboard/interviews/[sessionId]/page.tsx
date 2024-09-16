"use client";

import { useParams } from "next/navigation";
import React, { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CodingWorkspace } from "./_components/coding-workspace";

const InterviewPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const sessionExists = useQuery(api.sessions.exists, { sessionId });
  const sessions = useQuery(api.sessions.getByUserId, {
    userId: "user_2l0CgXdHXXShSwtApSLaRxfs1yc",
  });

  const interviewWorkspace = useMemo(() => {
    if (sessionExists === undefined) {
      return <div>Loading...</div>;
    }

    if (sessionExists === false) {
      return <div>Session not found</div>;
    }

    return <CodingWorkspace sessionId={sessionId as Id<"sessions">} />;
  }, [sessionExists, sessionId]);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-muted/80 w-full p-3 space-y-3">
      {interviewWorkspace}
    </div>
  );
};

export default InterviewPage;
