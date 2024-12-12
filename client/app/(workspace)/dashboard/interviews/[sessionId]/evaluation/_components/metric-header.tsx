"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { HelpCircle } from "lucide-react";

interface MetricHeaderProps {
  title: string;
  description: string;
}

export const MetricHeader = ({ title, description }: MetricHeaderProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 cursor-help group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <h4 className="font-medium capitalize text-lg">{title}</h4>
        <HelpCircle className="h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 left-0 top-full mt-2 p-4 bg-popover/95 backdrop-blur-sm border rounded-lg shadow-lg w-[300px]"
          >
            <p className="text-sm text-muted-foreground">{description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
