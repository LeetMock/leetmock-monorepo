import { Star, ThumbsUp, AlertTriangle, XCircle } from "lucide-react";

export const getHiringRecommendation = (score: number, maxScore: number) => {
  const percentage = (score / maxScore) * 100;

  if (percentage >= 90) return {
    text: "Excellent Performance",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    icon: Star,
    iconColor: "text-green-500",
  };
  if (percentage >= 75) return {
    text: "Strong Performance",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    icon: ThumbsUp,
    iconColor: "text-blue-500",
  };
  if (percentage >= 60) return {
    text: "Shows Promise",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
    icon: AlertTriangle,
    iconColor: "text-yellow-500",
  };
  return {
    text: "Needs Development",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    icon: XCircle,
    iconColor: "text-red-500",
  };
}; 