"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getHiringRecommendation } from "@/lib/evaluation-utils";
import { cn } from "@/lib/utils";
import { evaluationData } from "@/mockedEvaluationData";
import { useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ScoreCard } from "./_components/score-card";
import { ScoreRadarChart } from "./_components/score-radar-chart";

const InterviewEvaluationPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const session = useQuery(api.sessions.getById, { sessionId: sessionId as Id<"sessions"> });
  const [activeTab, setActiveTab] = useState("communication");
  const tabsRef = useRef<HTMLDivElement>(null);

  if (!session) {
    return <div>Loading...</div>;
  }

  // Transform scoreboards data for radar chart
  const radarData = Object.entries(evaluationData.scoreboards).map(([category, metrics]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    score:
      Object.values(metrics).reduce((acc, curr) => acc + curr.score, 0) /
      Object.keys(metrics).length,
    fullMark: 10,
  }));

  const renderMetricContent = (metrics: Record<string, any>, categoryName: string) => {
    const totalScore = Object.values(metrics).reduce((acc: any, curr: any) => acc + curr.score, 0);
    const maxScore = Object.values(metrics).reduce((acc: any, curr: any) => acc + curr.maxScore, 0);
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
            <Card className="p-4 hover:shadow-md transition-all duration-200">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium capitalize">{metric}</h4>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full",
                        getHiringRecommendation(data.score, data.maxScore).bgColor,
                        getHiringRecommendation(data.score, data.maxScore).color
                      )}
                    >
                      {getHiringRecommendation(data.score, data.maxScore).text}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {data.score}/{data.maxScore}
                    </span>
                  </div>
                </div>
                <Progress
                  value={(data.score / data.maxScore) * 100}
                  className="h-2"
                  indicatorClassName={cn(
                    getHiringRecommendation(data.score, data.maxScore).bgColor,
                    "border border-blue-500/20"
                  )}
                />
                <p className="text-sm text-muted-foreground mt-2">{data.description}</p>
                <p className="text-sm mt-2">{data.comment}</p>
                <div className="space-y-1 mt-2">
                  {data.examples.map((example: string, i: number) => (
                    <div key={i} className="text-sm text-muted-foreground">
                      • {example}
                    </div>
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

  // Add this function to calculate pillar scores
  const calculatePillarScores = (scoreboards: any) => {
    return Object.entries(scoreboards).map(([name, metrics]) => {
      const totalScore = Object.values(metrics).reduce(
        (acc: any, curr: any) => acc + curr.score,
        0
      );
      const maxScore = Object.values(metrics).reduce(
        (acc: any, curr: any) => acc + curr.maxScore,
        0
      );

      // Map the internal category names to display names
      const displayNames: Record<string, string> = {
        communication: "Communication",
        problemSolving: "Problem Solving",
        technicalCompetency: "Technical",
        testing: "Testing",
      };

      return {
        name: displayNames[name] || name,
        internalName: name, // Add this for exact matching
        score: totalScore,
        maxScore: maxScore,
      };
    });
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
          totalScore={evaluationData.totalScore}
          overallFeedback={evaluationData.overallFeedback}
          criteria={evaluationData.criteria}
          pillarScores={calculatePillarScores(evaluationData.scoreboards)}
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
          <Card className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
            <div className="p-4 border-b backdrop-blur-sm">
              <h3 className="font-semibold">Code Submission</h3>
            </div>
            <ScrollArea className="flex-1 p-4">
              <SyntaxHighlighter
                language="javascript"
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                }}
              >
                {evaluationData.codeContent}
              </SyntaxHighlighter>
            </ScrollArea>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={item} ref={tabsRef}>
        <Card className="p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
          <h3 className="text-xl font-semibold mb-4">Detailed Evaluation</h3>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start bg-transparent flex flex-wrap gap-2">
              {Object.entries(evaluationData.scoreboards).map(([category, metrics]) => {
                const totalScore = Object.values(metrics).reduce(
                  (acc: any, curr: any) => acc + curr.score,
                  0
                );
                const maxScore = Object.values(metrics).reduce(
                  (acc: any, curr: any) => acc + curr.maxScore,
                  0
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
                        <span>{Math.round((totalScore / maxScore) * 100)}%</span>
                        <span>•</span>
                        <span>{recommendation.text}</span>
                      </div>
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            <AnimatePresence mode="wait">
              {Object.entries(evaluationData.scoreboards).map(([category, metrics]) => (
                <TabsContent key={category} value={category} className="mt-6">
                  {renderMetricContent(metrics, category)}
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
