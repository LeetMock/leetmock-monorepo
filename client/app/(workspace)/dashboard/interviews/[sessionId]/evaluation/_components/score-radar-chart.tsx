"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface ScoreRadarChartProps {
  data: {
    category: string;
    score: number;
    fullMark: number;
  }[];
}

export const ScoreRadarChart = ({ data }: ScoreRadarChartProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col bg-background">
        <div className="p-4 border-b backdrop-blur-sm">
          <h3 className="font-semibold">Performance Overview</h3>
        </div>
        <div className="flex-1 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="category" tick={{ fill: "currentColor", fontSize: 12 }} />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: "currentColor", fontSize: 10 }}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#3b82f6"
                fill="#60a5fa"
                fillOpacity={0.3}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
};
