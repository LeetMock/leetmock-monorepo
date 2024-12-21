"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getHiringRecommendation } from "@/lib/evaluation-utils";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRef, useState, useMemo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ScoreCard } from "./_components/score-card";
import { ScoreRadarChart } from "./_components/score-radar-chart";
import { EvaluationLoading } from "./_components/loading-state";
import { MetricHeader } from "./_components/metric-header";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Criterion = {
  id: number;
  description: string;
  met: boolean;
  importance: "medium" | "high" | "critical";
};

const InterviewEvaluationPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const evaluation = useQuery(api.eval.getBySessionId, { sessionId: sessionId as Id<"sessions"> });
  const session_state = useQuery(api.codeSessionStates.getSessionStateBySessionId, {
    sessionId: sessionId as Id<"sessions">,
  });
  const [activeTab, setActiveTab] = useState("communication");
  const tabsRef = useRef<HTMLDivElement>(null);
  const [maxScore, setMaxScore] = useState(100);

  const calculateScores = (metrics: Record<string, { score: number; maxScore: number }>) => {
    const totalScore = Object.values(metrics).reduce((acc, curr) => acc + curr.score, 0);
    const maxScore = Object.values(metrics).reduce((acc, curr) => acc + curr.maxScore, 0);
    const percentage = (totalScore / maxScore) * 100;
    return { totalScore, maxScore, percentage };
  };

  const radarData = useMemo(
    () =>
      evaluation?.scoreboards
        ? Object.entries(evaluation.scoreboards).map(([category, metrics]) => {
            const { percentage } = calculateScores(
              metrics as Record<string, { score: number; maxScore: number }>
            );
            return {
              category: category.charAt(0).toUpperCase() + category.slice(1),
              score: percentage,
              fullMark: 100,
            };
          })
        : [],
    [evaluation?.scoreboards]
  );

  const pillarScores = useMemo(
    () =>
      evaluation?.scoreboards
        ? Object.entries(evaluation.scoreboards).map(([name, metrics]) => {
            const { totalScore, maxScore } = calculateScores(
              metrics as Record<string, { score: number; maxScore: number }>
            );
            const displayNames: Record<string, string> = {
              communication: "Communication",
              problemSolving: "Problem Solving",
              technicalCompetency: "Technical",
              testing: "Testing",
            };

            return {
              name: displayNames[name] || name,
              internalName: name,
              score: totalScore,
              maxScore: maxScore,
            };
          })
        : [],
    [evaluation?.scoreboards]
  );

  if (!evaluation) {
    return <EvaluationLoading />;
  }

  const renderMetricContent = (metrics: Record<string, any>, categoryName: string) => {
    const totalScore = Object.values(metrics).reduce((acc, curr) => acc + curr.score, 0);
    const maxScore = Object.values(metrics).reduce((acc, curr) => acc + curr.maxScore, 0);
    const recommendation = getHiringRecommendation(totalScore, maxScore);

    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-4 rounded-lg border",
            recommendation.bgColor,
            recommendation.borderColor
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{categoryName}</h3>
              <p className={cn("text-sm font-medium", recommendation.color)}>
                {recommendation.text}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{Math.round((totalScore / maxScore) * 100)}%</div>
              <div className="text-sm text-muted-foreground">
                {totalScore}/{maxScore} points
              </div>
            </div>
          </div>
        </motion.div>

        {Object.entries(metrics).map(([metric, data]) => (
          <motion.div key={metric} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-4 shadow-none transition-all duration-200 bg-background dark:bg-zinc-900">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <MetricHeader title={metric} description={data.description} />
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-sm font-medium px-2.5 py-1.5 rounded-full",
                        getHiringRecommendation(data.score, data.maxScore).bgColor,
                        getHiringRecommendation(data.score, data.maxScore).color
                      )}
                    >
                      {getHiringRecommendation(data.score, data.maxScore).text}
                    </span>
                    <span className="text-base text-muted-foreground">
                      {data.score}/{data.maxScore}
                    </span>
                  </div>
                </div>

                <div className="prose dark:prose-invert max-w-none text-base">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.comment}</ReactMarkdown>
                </div>
                {/* <p className="text-base leading-relaxed mt-2">{data.comment}</p> */}
                <div className="space-y-3 mt-4 border-l-2 border-blue-500/20 dark:border-blue-400/20">
                  {data.examples.map((example: string, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={cn(
                        "relative pl-6 py-2 -ml-px",
                        "before:absolute before:left-0 before:top-0 before:h-full before:w-[1px]",
                        "before:bg-gradient-to-b before:from-blue-500/40 before:to-purple-500/40",
                        "hover:bg-blue-50/50 dark:hover:bg-blue-950/20",
                        "transition-colors duration-200 rounded-r-lg"
                      )}
                    >
                      <div className="prose dark:prose-invert max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code: ({
                              inline,
                              className,
                              children,
                              ...props
                            }: { inline?: boolean } & any) => {
                              const codeText = String(children).trim();
                              const shouldBeInline =
                                inline || (codeText.length < 15 && !codeText.includes("\n"));

                              return (
                                <code
                                  className={cn(
                                    "px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-sm",
                                    !shouldBeInline && "block p-3 rounded-lg"
                                  )}
                                  {...props}
                                >
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {`• ${example}`}
                        </ReactMarkdown>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const scrollToTabs = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="container mx-auto py-8 px-4 space-y-6"
    >
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Interview Evaluation
          </h1>
          <Link
            href={`/dashboard/interviews/${sessionId}/statistics`}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="text-sm font-medium">View Statistics</span>
          </Link>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <ScoreCard
          totalScore={evaluation.totalScore}
          overallFeedback={evaluation.overallFeedback}
          // criteria={evaluationData.criteria}
          pillarScores={pillarScores}
          onPillarClick={(pillarName, internalName) => {
            setActiveTab(internalName);
            scrollToTabs();
          }}
        />
      </motion.div>

      <motion.div variants={item} className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <div className="h-[500px]">
          <ScoreRadarChart data={radarData} />
        </div>
        <motion.div variants={item} className="h-[500px]">
          <Card className="h-full flex flex-col bg-background">
            <div className="p-4 border-b backdrop-blur-sm">
              <h3 className="font-semibold">Code Submission</h3>
            </div>
            <ScrollArea className="flex-1 p-4">
              <SyntaxHighlighter
                language="python"
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  height: "100%",
                }}
              >
                {session_state?.editor.content}
              </SyntaxHighlighter>
            </ScrollArea>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={item} ref={tabsRef}>
        <Card className="p-6 bg-background">
          <h3 className="text-xl font-semibold mb-4">Detailed Evaluation</h3>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start bg-transparent flex flex-wrap gap-2">
              {Object.entries(evaluation.scoreboards).map(([category, metrics]) => {
                const { totalScore, maxScore, percentage } = calculateScores(
                  metrics as Record<string, { score: number; maxScore: number }>
                );
                const recommendation = getHiringRecommendation(totalScore, maxScore);

                return (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className={cn(
                      "relative overflow-hidden group transition-all duration-300",
                      "data-[state=active]:bg-gradient-to-r",
                      "data-[state=active]:from-blue-500 data-[state=active]:to-blue-600",
                      "data-[state=active]:text-white"
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-blue-500/10 transition-all duration-300" />
                    <div className="relative">
                      <span className="capitalize">{category}</span>
                      <div className="text-xs opacity-80 flex items-center gap-1.5">
                        <span>{Math.round(percentage)}%</span>
                        <span>•</span>
                        <span>{recommendation.text}</span>
                      </div>
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            <AnimatePresence mode="wait">
              {Object.entries(evaluation.scoreboards).map(([category, metrics]) => (
                <TabsContent key={category} value={category} className="mt-10">
                  {renderMetricContent(metrics as Record<string, any>, category)}
                </TabsContent>
              ))}
            </AnimatePresence>
          </Tabs>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default InterviewEvaluationPage;
