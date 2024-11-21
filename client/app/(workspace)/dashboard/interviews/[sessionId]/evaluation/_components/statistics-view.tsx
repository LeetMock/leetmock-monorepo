import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Activity, Brain, CheckCircle2, Clock, Code, XCircle } from "lucide-react";

interface StatisticsViewProps {
  statistics: any; // Replace with proper type from your data
}

export const StatisticsView = ({ statistics }: StatisticsViewProps) => {
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

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Time Metrics */}
      <motion.div variants={item}>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Time Analysis</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(statistics.timeMetrics).map(([key, value]) => (
              <div key={key} className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </div>
                <div className="text-2xl font-bold mt-1">{value}</div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Interaction Metrics */}
      <motion.div variants={item}>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Interaction Analysis</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Clarifying Questions</h4>
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span>Questions Asked</span>
                  <span className="text-2xl font-bold">
                    {statistics.interactionMetrics.clarifyingQuestions.count}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Quality Score</span>
                  <span className="text-2xl font-bold">
                    {statistics.interactionMetrics.clarifyingQuestions.quality}/5
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {statistics.interactionMetrics.clarifyingQuestions.examples.map(
                  (q: string, i: number) => (
                    <div key={i} className="text-sm text-muted-foreground">
                      • {q}
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Follow-up Questions</h4>
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span>Questions Asked</span>
                  <span className="text-2xl font-bold">
                    {statistics.interactionMetrics.followUpQuestions.totalAsked}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Correctly Answered</span>
                  <span className="text-2xl font-bold text-green-500">
                    {statistics.interactionMetrics.followUpQuestions.correctlyAnswered}/
                    {statistics.interactionMetrics.followUpQuestions.totalAsked}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {statistics.interactionMetrics.followUpQuestions.examples.map(
                  (q: any, i: number) => (
                    <div key={i} className="p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        {q.wasCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium text-sm">{q.question}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 ml-6">{q.response}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Code Metrics */}
      <motion.div variants={item}>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Code className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold">Code Analysis</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Lines of Code</div>
                  <div className="text-2xl font-bold">{statistics.codeMetrics.linesOfCode}</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Comment Lines</div>
                  <div className="text-2xl font-bold">{statistics.codeMetrics.commentLines}</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Syntax Errors</div>
                  <div className="text-2xl font-bold">{statistics.codeMetrics.syntaxErrors}</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Compilations</div>
                  <div className="text-2xl font-bold">{statistics.codeMetrics.timesToCompile}</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Test Cases</h4>
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span>Coverage</span>
                  <span className="text-2xl font-bold">
                    {statistics.codeMetrics.testCases.coverage}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Pass Rate</span>
                  <span className="text-2xl font-bold text-green-500">
                    {statistics.codeMetrics.testCases.passed}/
                    {statistics.codeMetrics.testCases.total}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Behavioral Metrics */}
      <motion.div variants={item}>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold">Behavioral Analysis</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Stress Handling</div>
                  <div className="text-2xl font-bold">
                    {statistics.behavioralMetrics.stressHandling}/5
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Communication Clarity</div>
                  <div className="text-2xl font-bold">
                    {statistics.behavioralMetrics.communicationClarity}/5
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Technical Articulation</div>
                  <div className="text-2xl font-bold">
                    {statistics.behavioralMetrics.technicalArticulation}/5
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Problem Solving Approach</h4>
              <div className="space-y-2">
                {Object.entries(statistics.behavioralMetrics.problemSolvingApproach).map(
                  ([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      {value ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};
