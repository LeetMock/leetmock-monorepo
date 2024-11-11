"use client";

import React, { useEffect, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

// UI Components from shadcn/ui
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Icons from lucide-react
import { Moon, Star, Sun } from "lucide-react";

// Toggle Switch Component

// Sample Data
interface EvaluationAspect {
  title: string;
  totalPoints: number;
  score: number;
  metrics: Metric[];
}

interface Metric {
  name: string;
  points: number;
  score: number;
  description: string;
  comment: string; // 评语
  evidence: string;
  suggestion: string;
}

const mockData: EvaluationAspect[] = [
  {
    title: "Communication",
    totalPoints: 10,
    score: 8,
    metrics: [
      {
        name: "Clarifying Questions",
        points: 2,
        score: 2,
        description: "Asked meaningful clarification questions.",
        comment: "Excellent understanding of the problem.",
        evidence: "Asked about edge cases and input constraints.",
        suggestion: "Continue to probe deeper into problem requirements.",
      },
      {
        name: "Thought Process Explanation",
        points: 8,
        score: 6,
        description: "Explained thought process effectively.",
        comment: "Good explanation but missed some optimization opportunities.",
        evidence: "Walked through initial solution but didn't consider time complexity.",
        suggestion: "Discuss potential optimizations during explanation.",
      },
    ],
  },
  {
    title: "Problem Solving",
    totalPoints: 10,
    score: 7,
    metrics: [
      {
        name: "Optimal Solution Identification",
        points: 3,
        score: 2,
        description: "Identified a near-optimal solution.",
        comment: "Solution works but not the most efficient.",
        evidence: "Used a nested loop resulting in O(n^2) complexity.",
        suggestion: "Consider using a hash map to reduce complexity.",
      },
      {
        name: "Optimization Process",
        points: 5,
        score: 4,
        description: "Demonstrated systematic optimization.",
        comment: "Improved the solution after hints.",
        evidence: "Refactored code to use a more efficient algorithm.",
        suggestion: "Practice recognizing common optimization patterns.",
      },
      {
        name: "Question-Specific Metrics",
        points: 2,
        score: 1,
        description: "Met most question-specific benchmarks.",
        comment: "Missed handling some edge cases.",
        evidence: "Failed on inputs with empty arrays.",
        suggestion: "Always test code with various input scenarios.",
      },
    ],
  },
  {
    title: "Technical Competency",
    totalPoints: 10,
    score: 9,
    metrics: [
      {
        name: "Syntax & Error Detection",
        points: 2,
        score: 2,
        description: "No syntax errors in code.",
        comment: "Code runs without errors.",
        evidence: "Passed all syntax checks on the first run.",
        suggestion: "Maintain attention to detail.",
      },
      {
        name: "Code Quality & Style",
        points: 5,
        score: 5,
        description: "Used good coding standards.",
        comment: "Code is clean and well-organized.",
        evidence: "Used meaningful variable names and proper indentation.",
        suggestion: "Continue following best coding practices.",
      },
      {
        name: "Coding Timeline",
        points: 3,
        score: 2,
        description: "Completed coding efficiently.",
        comment: "Completed the task in a reasonable time.",
        evidence: "Took 25 minutes to code the solution.",
        suggestion: "Aim to improve speed without sacrificing quality.",
      },
    ],
  },
  {
    title: "Testing",
    totalPoints: 10,
    score: 6,
    metrics: [
      {
        name: "Test Case Coverage",
        points: 5,
        score: 3,
        description: "Passed most test cases.",
        comment: "Good coverage but missed some edge cases.",
        evidence: "Failed on large input sizes.",
        suggestion: "Include stress testing in your test cases.",
      },
      {
        name: "Bug Detection & Debugging",
        points: 3,
        score: 2,
        description: "Effectively debugged code.",
        comment: "Identified and fixed bugs promptly.",
        evidence: "Used console logs to trace issues.",
        suggestion: "Leverage debugging tools for efficiency.",
      },
      {
        name: "Custom Test Case Creation",
        points: 2,
        score: 1,
        description: "Created some custom test cases.",
        comment: "Added basic test cases.",
        evidence: "Tested with standard inputs but not edge cases.",
        suggestion: "Develop a habit of testing edge conditions.",
      },
    ],
  },
];

const getOverallPerformance = (totalScore: number) => {
  if (totalScore >= 35) return "Strong Hire";
  if (totalScore >= 25) return "Hire";
  return "No Hire";
};

const EvaluationPage: React.FC = () => {
  const [theme, setTheme] = useState<string>("light");

  // Load theme from localStorage on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "light";
    setTheme(storedTheme);
    document.documentElement.classList.toggle("dark", storedTheme === "dark");
  }, []);

  // Toggle theme and store preference
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  // Prepare data for Radar Chart
  const radarData = mockData.map((aspect) => ({
    subject: aspect.title,
    Score: aspect.score,
    FullMark: aspect.totalPoints,
  }));

  const totalScore = mockData.reduce((acc, curr) => acc + curr.score, 0);

  const overallPerformance = getOverallPerformance(totalScore);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Theme Toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleTheme}
          className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md focus:outline-none"
        >
          {theme === "light" ? (
            <>
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300 mr-2" />
              <span className="text-gray-800 dark:text-gray-200">Dark Mode</span>
            </>
          ) : (
            <>
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300 mr-2" />
              <span className="text-gray-800 dark:text-gray-200">Light Mode</span>
            </>
          )}
        </button>
      </div>

      <h1 className="text-5xl font-extrabold text-gray-800 dark:text-gray-100 mb-8 text-center">
        Candidate Evaluation Report
      </h1>

      {/* Overall Performance Section */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg p-8 mb-12 shadow-xl">
        <h2 className="text-3xl font-bold mb-4">Overall Performance</h2>
        <p className="text-5xl font-extrabold flex items-center">
          {overallPerformance}
          {overallPerformance === "Strong Hire" && (
            <Star className="w-10 h-10 text-yellow-400 ml-4" />
          )}
        </p>
        <p className="text-xl mt-2">Total Score: {totalScore}/40</p>
      </div>

      {/* Radar Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 mb-12 shadow-lg">
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-6 text-center">
          Skills Overview
        </h2>
        <div className="w-full h-96">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke={theme === "dark" ? "#374151" : "#e5e7eb"} />
              <PolarAngleAxis
                dataKey="subject"
                stroke={theme === "dark" ? "#d1d5db" : "#6b7280"}
                tick={{ fontSize: 16, fill: theme === "dark" ? "#d1d5db" : "#6b7280" }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 10]}
                stroke={theme === "dark" ? "#4b5563" : "#d1d5db"}
                tick={{ fill: theme === "dark" ? "#d1d5db" : "#6b7280" }}
              />
              <Radar
                name="Candidate"
                dataKey="Score"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.7}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === "dark" ? "#1f2937" : "white",
                  borderRadius: "0.5rem",
                  borderColor: theme === "dark" ? "#374151" : "#d1d5db",
                }}
                itemStyle={{ color: theme === "dark" ? "#d1d5db" : "#4b5563" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Aspects in Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <Tabs defaultValue={mockData[0].title}>
          <TabsList className="flex overflow-x-auto border-b dark:border-gray-700 py-4 px-4">
            {mockData.map((aspect) => (
              <TabsTrigger
                key={aspect.title}
                value={aspect.title}
                className="flex-1 text-center text-lg font-semibold px-6 py-2 text-gray-800 dark:text-gray-100"
              >
                {aspect.title}
              </TabsTrigger>
            ))}
          </TabsList>
          {mockData.map((aspect) => (
            <TabsContent key={aspect.title} value={aspect.title}>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                  {aspect.title} -{" "}
                  <span className="text-indigo-600 font-extrabold">
                    {aspect.score}/{aspect.totalPoints}
                  </span>
                </h3>
                {/* Metrics Details */}
                <div className="space-y-6">
                  {aspect.metrics.map((metric) => (
                    <Card key={metric.name} className="bg-gray-50 dark:bg-gray-700">
                      <CardHeader className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-t-lg px-6 py-4">
                        <CardTitle className="text-xl text-gray-700 dark:text-gray-100">
                          {metric.name}
                        </CardTitle>
                        <span className="text-indigo-600 font-bold text-lg">
                          {metric.score}/{metric.points}
                        </span>
                      </CardHeader>
                      <CardContent className="space-y-4 px-6 py-4">
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                            Comment
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300 mt-1">{metric.comment}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                            Evidence
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300 mt-1">{metric.evidence}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                            Suggestion
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300 mt-1">
                            {metric.suggestion}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default EvaluationPage;
