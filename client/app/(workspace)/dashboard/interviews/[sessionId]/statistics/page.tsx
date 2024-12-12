"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { evaluationData } from "@/mockedEvaluationData";
import { useQuery } from "convex/react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { StatisticsView } from "../evaluation/_components/statistics-view";

const InterviewStatisticsPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const session = useQuery(api.sessions.getById, { sessionId: sessionId as Id<"sessions"> });

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/dashboard/interviews/${sessionId}/evaluation`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          Interview Statistics
        </h1>
      </div>

      <StatisticsView statistics={evaluationData.statistics} />
    </div>
  );
};

export default InterviewStatisticsPage;
