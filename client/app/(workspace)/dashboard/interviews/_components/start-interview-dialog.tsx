import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MoveRight, Code, Database, Users, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import InterviewSelectionPage from "@/app/(workspace)/problems/page";
import { useState } from "react";
import { cn } from "@/lib/utils";
import React from "react";
import { Stepper } from "@/components/stepper";

// export function InterviewSelectionDialog({
//   open,
//   setOpen,
// }: {
//   open: boolean;
//   setOpen: (open: boolean) => void;
// }) {
//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogContent className="sm:max-w-[900px] sm:w-[90vw]">
//         <DialogHeader>
//           <DialogTitle>Start Interview</DialogTitle>
//           <DialogDescription>Choose from our available coding interviews.</DialogDescription>
//         </DialogHeader>
//         <InterviewSelectionPage />
//       </DialogContent>
//     </Dialog>
//   );
// }

interface InterviewType {
  title: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
  bullets: string[];
}

const interviewTypes: InterviewType[] = [
  {
    title: "Coding Interview",
    description: "Practice algorithmic problem-solving",
    icon: <Code className="w-4 h-4" />,
    available: true,
    bullets: [
      "Engage with a human-like, voice-driven AI interviewer",
      "Experience dynamic, real-time feedback",
      "Enhance your algorithmic problem-solving skills",
      "Simulate the pressure of real interviews in a fun environment",
      "Track your progress with detailed performance analytics",
    ],
  },
  {
    title: "System Design",
    description: "Design scalable systems",
    icon: <Database className="w-4 h-4" />,
    available: false,
    bullets: [
      "Collaborate with AI to design large-scale distributed systems",
      "Utilize interactive diagrams for visual problem-solving",
      "Receive AI-assisted guidance throughout your design process",
      "Simulate real-world system design challenges",
      "Improve your architectural decision-making skills",
    ],
  },
  {
    title: "Behavioral",
    description: "Improve your soft skills",
    icon: <Users className="w-4 h-4" />,
    available: false,
    bullets: [
      "Enhance your communication and interpersonal skills",
      "Develop effective problem-solving techniques",
      "Participate in AI-driven behavioral interview simulations",
      "Receive constructive feedback to boost your soft skills",
      "Build confidence in handling real-life interview scenarios",
    ],
  },
];

export const InterviewTypeCard: React.FC<React.HTMLAttributes<HTMLDivElement> & InterviewType> = ({
  title,
  description,
  icon,
  available,
  bullets,
  className,
  ...props
}) => {
  return (
    <Card
      className={cn(
        "flex flex-col relative overflow-hidden transition-all duration-300 shadow-none",
        available && "hover:cursor-pointer hover:scale-[1.03] hover:shadow-lg",
        className
      )}
      {...props}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          <span>{title}</span>
        </CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="list-disc ml-[1.15rem] [&>li]:mt-2 text-muted-foreground">
          {bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </CardContent>
      {!available && (
        <>
          <Badge
            variant="secondary"
            className="absolute top-3.5 right-3.5 bg-yellow-200 text-yellow-800"
          >
            Coming Soon
          </Badge>
          <div className="absolute inset-0 bg-gray-200/50 dark:bg-background/50 flex items-center justify-center">
            <Lock className="w-12 h-12 text-gray-400/50" />
          </div>
        </>
      )}
    </Card>
  );
};

export const StartInterviewDialog: React.FC = () => {
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [selectionDialogOpen, setSelectionDialogOpen] = useState(false);

  return (
    <>
      <Dialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="expandIcon"
            size="lg"
            Icon={() => <MoveRight className="w-4 h-4 mt-px" />}
            iconPlacement="right"
          >
            Start Interview
          </Button>
        </DialogTrigger>
        <DialogContent
          className={cn("sm:max-w-[1200px] sm:w-[90vw] sm:min-h-[50rem]", "flex flex-col gap-6")}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl">Choose Interview Type</DialogTitle>
            <DialogDescription className="text-base">
              Select the type of interview you&apos;d like to start.
            </DialogDescription>
          </DialogHeader>
          <Stepper
            steps={["Select Interview Type", "Select Problem", "Configure Interview"]}
            currentStep={1}
          />
          <div className="flex flex-col flex-grow gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
              {interviewTypes.map((interviewType) => (
                <InterviewTypeCard
                  key={interviewType.title}
                  {...interviewType}
                  className="h-full"
                />
              ))}
            </div>
            <div className="flex justify-end">
              <Button
                variant="expandIcon"
                iconPlacement="right"
                Icon={() => <MoveRight className="w-4 h-4 mt-px" />}
              >
                Next
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* <InterviewSelectionDialog open={selectionDialogOpen} setOpen={setSelectionDialogOpen} /> */}
    </>
  );
};
