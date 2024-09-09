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
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useUser } from "@clerk/clerk-react";
import { useTheme } from "next-themes";

interface InterviewCardProps {
  resume: boolean;
  sessionId: Id<"sessions"> | undefined;
}

const InterviewCard = ({ resume, sessionId }: InterviewCardProps) => {
  return (
    <Card className="col-span-full relative overflow-hidden" x-chunk="dashboard-05-chunk-0">
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
          <CardTitle>{resume ? "Resume" : "Start"} Interview</CardTitle>
          <CardDescription className="max-w-lg text-balance leading-relaxed">
            {resume ? "Resume the interview" : "Start a mock interview with our AI interviewer!"}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-end gap-4">
          {resume ? (
            <Link href={`/interview/${sessionId}`} passHref>
              <Button size="lg">Resume Interview</Button>
            </Link>
          ) : (
            <Link href={`/problems`} passHref>
              <Button size="lg">Start Interview</Button>
            </Link>
          )}
        </CardFooter>
      </div>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useUser();
  const sessions = useQuery(api.sessions.getByUserId, { userId: user!.id });
  if (sessions === undefined) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  //TODO: this needs to be "in_progress"
  const sessionInProgress = sessions.find((session) => session.sessionStatus === "in_progress");
  const resume = sessionInProgress ? true : false;
  const sessionId = sessionInProgress ? sessionInProgress._id : undefined;

  console.log(sessions);
  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        <InterviewCard resume={resume} sessionId={sessionId} />
      </div>
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex ">
        <DataTable data={sessions as SessionDoc[]} columns={columns} />
      </div>
    </div>
  );
};

export default Dashboard;
