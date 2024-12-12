import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getHiringRecommendation } from "@/lib/evaluation-utils";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Criterion {
  id: number;
  description: string;
  met: boolean;
  importance: "critical" | "high" | "medium";
}

interface PillarScore {
  name: string;
  internalName: string;
  score: number;
  maxScore: number;
}

interface ScoreCardProps {
  totalScore: number;
  overallFeedback: string;
  // criteria: Criterion[];
  pillarScores: PillarScore[];
  onPillarClick: (displayName: string, internalName: string) => void;
}

export const ScoreCard = ({
  totalScore,
  overallFeedback,
  // criteria,
  pillarScores,
  onPillarClick,
}: ScoreCardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "from-green-500 to-emerald-700 text-white";
    if (score >= 80) return "from-blue-500 to-blue-700 text-white";
    if (score >= 70) return "from-yellow-500 to-yellow-700 text-white";
    return "from-red-500 to-red-700 text-white";
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "critical":
        return "text-red-500 dark:text-red-400";
      case "high":
        return "text-orange-500 dark:text-orange-400";
      case "medium":
        return "text-blue-500 dark:text-blue-400";
      default:
        return "text-gray-500";
    }
  };

  // Get the overall recommendation
  const overallRecommendation = getHiringRecommendation(totalScore, 100);
  const Icon = overallRecommendation.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className={cn("p-6 lg:col-span-2 bg-gradient-to-br", getScoreColor(totalScore))}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex flex-col items-center justify-center h-full"
            >
              <h3 className="text-2xl font-semibold mb-2 opacity-90">Overall Score</h3>
              <div className="text-5xl font-bold mb-4">{totalScore}</div>
              <div className="text-lg mb-6 opacity-90">out of 100</div>
              <div className="flex items-center gap-3 mb-8">
                <Icon className="h-6 w-6" />
                <h4 className="text-xl font-semibold">{overallRecommendation.text}</h4>
              </div>

              {/* Pillar Scores */}
              <div className="w-full grid grid-cols-2 gap-3">
                {pillarScores.map((pillar, index) => (
                  <motion.div
                    key={pillar.internalName}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    className="group relative cursor-pointer"
                    onClick={() => onPillarClick(pillar.name, pillar.internalName)}
                  >
                    <div className="absolute inset-0 bg-black/20 rounded-lg transform transition-all duration-200 group-hover:bg-black/10" />
                    <div className="relative p-3 rounded-lg border border-white/20 backdrop-blur-sm">
                      <div className="text-sm font-medium opacity-80 mb-1">{pillar.name}</div>
                      <div className="text-xl font-bold">
                        {Math.round((pillar.score / pillar.maxScore) * 100)}%
                      </div>
                      <div className="text-xs font-medium mt-1 bg-white/20 rounded-full px-2 py-0.5 inline-block">
                        {getHiringRecommendation(pillar.score, pillar.maxScore).text}
                      </div>
                      <div className="h-1 w-full bg-white/20 rounded-full mt-2">
                        <div
                          className="h-full bg-white rounded-full transition-all duration-300 group-hover:bg-opacity-90"
                          style={{ width: `${(pillar.score / pillar.maxScore) * 100}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="p-6 lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Don't need this for now, will add back in later version<div>
                <h4 className="text-lg font-semibold mb-4">Problem-Solving Criteria</h4>
                <div className="grid gap-3">
                  <TooltipProvider>
                    {criteria.map((criterion) => (
                      <motion.div
                        key={criterion.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * criterion.id }}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg",
                          criterion.met
                            ? "bg-green-50 dark:bg-green-950/30"
                            : "bg-red-50 dark:bg-red-950/30"
                        )}
                      >
                        <Tooltip>
                          <TooltipTrigger>
                            <AlertCircle
                              className={cn(
                                "h-4 w-4 shrink-0",
                                getImportanceColor(criterion.importance)
                              )}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Importance: {criterion.importance}</p>
                          </TooltipContent>
                        </Tooltip>
                        <span className="flex-1 text-sm">{criterion.description}</span>
                        {criterion.met ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                        )}
                      </motion.div>
                    ))}
                  </TooltipProvider>
                </div>
              </div> */}
              <div>
                <h4 className="font-medium text-muted-foreground mb-4">Overall Feedback</h4>
                <div className="text-base leading-relaxed">
                  <ReactMarkdown>{overallFeedback}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
