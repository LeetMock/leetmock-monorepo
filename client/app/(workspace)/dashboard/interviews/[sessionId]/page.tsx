"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import React, { useMemo } from "react";
import { Workspace } from "./_components/workspace";
import { notFound } from "next/navigation";

const InterviewPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const sessionExists = useQuery(api.sessions.exists, { sessionId });

  const interviewWorkspace = useMemo(() => {
    if (sessionExists === undefined) {
      return <div>Loading...</div>;
    }

    if (sessionExists === false) {
      notFound();
    }

    return <Workspace sessionId={sessionId as Id<"sessions">} />;
  }, [sessionExists, sessionId]);

  return (
    <div className="flex flex-col justify-center items-center h-full bg-muted/80 w-full">
      {interviewWorkspace}
    </div>
  );
};

export default InterviewPage;
