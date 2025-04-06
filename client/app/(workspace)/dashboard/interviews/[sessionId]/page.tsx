"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useKrispNoiseFilter } from "@livekit/components-react/krisp";
import { isKrispNoiseFilterSupported } from "@livekit/krisp-noise-filter";
import { useQuery } from "convex/react";
import { notFound, useParams } from "next/navigation";
import React, { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Workspace } from "./_components/workspace";
import { useLivekitRPC } from "@/hooks/register_livekitRPC";
const isKrispSupported = isKrispNoiseFilterSupported();

const InterviewPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const sessionExists = useQuery(api.sessions.exists, { sessionId });
  const { setNoiseFilterEnabled, isNoiseFilterEnabled } = useKrispNoiseFilter();

  // register livekit rpc
  useLivekitRPC();

  useEffect(() => {
    if (isNoiseFilterEnabled) return;

    if (isKrispSupported) {
      if (!isNoiseFilterEnabled) {
        setNoiseFilterEnabled(true);
        toast.success("Background noise filter enabled", {
          description: "Automatically activated for better call quality",
        });
      }
    } else {
      toast.error("Noise filter not supported", {
        description: "Krisp background noise removal is not supported in this browser",
      });
    }
  }, [isNoiseFilterEnabled, setNoiseFilterEnabled]);

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
