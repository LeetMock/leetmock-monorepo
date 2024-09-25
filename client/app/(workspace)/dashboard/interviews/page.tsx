"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { DataTable } from "./_components/data-table";
import { columns, SessionDoc } from "./_components/columns";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/clerk-react";
import { useMemo } from "react";
import { MoveRight } from "lucide-react";
import { DashboardBreadcrumb } from "../_components/breadcrumb";

interface InterviewCardProps {
  activeSessionId: Id<"sessions"> | undefined;
  questionTitle: string | undefined;
}

const InterviewCard = ({ activeSessionId, questionTitle }: InterviewCardProps) => {
  return (
    <Card
      className="col-span-full relative overflow-hidden rounded-lg"
      x-chunk="dashboard-05-chunk-0"
    >
      <Image
        src="/coding.jpg"
        alt="Coding background"
        fill
        sizes="100vw"
        style={{ objectFit: "cover" }}
        className="opacity-15"
        priority
      />
      <div className="relative z-10">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold">
            {activeSessionId && questionTitle ? questionTitle : "Start Interview"}
          </CardTitle>
          <CardDescription className="max-w-lg text-balance leading-relaxed">
            {activeSessionId
              ? "Resume your interview"
              : "Start a mock interview with our AI interviewer!"}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-end gap-4">
          <Link
            href={activeSessionId ? `/dashboard/interviews/${activeSessionId}` : "/problems"}
            passHref
          >
            <Button
              variant="expandIcon"
              size="lg"
              Icon={() => <MoveRight className="w-4 h-4 mt-px" />}
              iconPlacement="right"
            >
              {activeSessionId ? "Resume Interview" : "Start Interview"}
            </Button>
          </Link>
        </CardFooter>
      </div>
    </Card>
  );
};

const InterviewPage: React.FC = () => {
  const { user } = useUser();
  const sessions = useQuery(api.sessions.getByUserId, { userId: user!.id });
  const activeSession = useQuery(api.sessions.getActiveSession, { userId: user!.id });
  const question = useQuery(api.questions.getById, { questionId: activeSession?.questionId });

  const sessionList = useMemo(() => {
    if (!sessions) return [];
    return sessions as SessionDoc[];
  }, [sessions]);

  return (
    <div className="flex flex-col space-y-6 p-4 px-6">
      <DashboardBreadcrumb />
      <div className="flex flex-col space-y-1">
        <span className="text-xl font-bold tracking-tight">Interviews</span>
        <span className="text-muted-foreground">
          Manage your mock interviews and track your progress.
        </span>
      </div>
      <div className="flex flex-col space-y-2">
        <InterviewCard activeSessionId={activeSession?._id} questionTitle={question?.title} />
      </div>
      <div className="">
        <DataTable data={sessionList} columns={columns} />
      </div>
    </div>
  );
};

export default InterviewPage;
