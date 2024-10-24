import { Stepper } from "@/components/stepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Wait } from "@/components/wait";
import { api } from "@/convex/_generated/api";
import { SessionType, useSessionCreateModal } from "@/hooks/use-session-create-modal";
import { cn } from "@/lib/utils";
import { useAction, useMutation, useQuery } from "convex/react";
import { Code, Database, Lock, MoveRight, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useState, useEffect } from "react";
import { toast } from "sonner";
import { CodeInterviewConfig } from "./code-interview-config";
import { CodeQuestionViewer } from "./code-question-viewer";

interface SessionMeta {
  title: string;
  type: SessionType;
  description: string;
  icon: React.ReactNode;
  available: boolean;
  bullets: string[];
}

const interviewTypes: SessionMeta[] = [
  {
    title: "Coding Interview",
    type: SessionType.CodeInterview,
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
    type: SessionType.SystemDesign,
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
    type: SessionType.Behavioral,
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

export const InterviewTypeCard: React.FC<React.HTMLAttributes<HTMLDivElement> & SessionMeta> = ({
  title,
  type,
  description,
  icon,
  available,
  bullets,
  className,
  onClick,
  ...props
}) => {
  const { type: currentType, setType } = useSessionCreateModal();

  const handleSelect = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e);
    if (!available) return;
    setType(currentType === type ? undefined : type);
  };

  return (
    <Card
      className={cn(
        "flex flex-col relative overflow-hidden transition-all duration-300 shadow-none select-none",
        available && "hover:cursor-pointer hover:scale-[1.03] hover:shadow-lg",
        currentType === type && "shadow-lg ring-2 ring-primary scale-[1.03]",
        className
      )}
      onClick={handleSelect}
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
        <ul className="list-disc ml-[1.1rem] [&>li]:mt-2 text-muted-foreground">
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

export const InterviewTypeSelection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
      {interviewTypes.map((interviewType) => (
        <InterviewTypeCard key={interviewType.title} {...interviewType} className="h-full" />
      ))}
    </div>
  );
};

export const StartInterviewDialog: React.FC = () => {
  const { maxStep, codeInterview, codeInterviewConfig, updateCodeInterview, updateCodeInterviewConfig: updateConfig, reset, setType } =
    useSessionCreateModal();
  const router = useRouter();
  const questions = useQuery(api.questions.getAll);
  const createAgentThread = useAction(api.actions.createAgentThread);
  const createSession = useMutation(api.sessions.createCodeSession);

  const [currentStep, setCurrentStep] = useState(0);
  const [startDialogOpen, setStartDialogOpen] = useState(false);

  const handleSessionCreate = useCallback(async () => {
    if (!questions) return;
    const question = questions.find((q) => q._id === codeInterview.questionId);
    if (!question) return;

    const promise = createAgentThread({ graphId: "code-mock-v1" })
      .then(({ threadId, assistantId }) => {
        return createSession({
          questionId: codeInterview.questionId!,
          agentThreadId: threadId,
          assistantId: assistantId,
          interviewType: "coding",
          interviewMode: codeInterviewConfig.mode!,
          interviewFlow: codeInterviewConfig.interviewFlow!,
          programmingLanguage: codeInterviewConfig.language!,
          timeLimit: codeInterviewConfig.interviewTime!,
          voice: codeInterviewConfig.voice!,
        });
      })
      .then((sessionId) => {
        reset();
        setStartDialogOpen(false);
        router.push(`/dashboard/interviews/${sessionId}`);
      });

    toast.promise(promise, {
      loading: "Creating interview",
      success: "Interview created",
      error: (error) => error.message,
    });
  }, [questions, createAgentThread, codeInterview, codeInterviewConfig, createSession, router, reset]);

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
            currentStep={maxStep}
          />

          {currentStep === 0 && <InterviewTypeSelection />}
          <Wait data={{ questions }}>
            {({ questions }) =>
              currentStep === 1 && (
                <div className="flex flex-col h-[calc(100vh-20rem)]">
                  <CodeQuestionViewer
                    questions={questions}
                    onQuestionSelected={(questionId) => {
                      updateCodeInterview({ questionId });
                      setCurrentStep(1);
                    }}
                  />
                </div>
              )
            }
          </Wait>
          {currentStep === 2 && (
            <div className="flex flex-col h-[calc(100vh-20rem)]">
              <CodeInterviewConfig
                onConfigUpdate={updateConfig}
                selectedQuestion={questions?.find((q) => q._id === codeInterview.questionId)}
              />
            </div>
          )}
          <div className="flex justify-between">
            <Button
              variant="ghost"
              disabled={currentStep <= 0}
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Back
            </Button>
            {currentStep >= 2 ? (
              <Button variant="shine" onClick={() => handleSessionCreate()}>
                Start
              </Button>
            ) : (
              <Button
                variant="expandIcon"
                iconPlacement="right"
                Icon={() => <MoveRight className="w-4 h-4 mt-px" />}
                disabled={currentStep >= maxStep}
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Next
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
