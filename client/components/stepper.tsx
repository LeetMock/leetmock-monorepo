import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="relative flex items-start justify-between">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div key={index} className={cn("flex flex-col items-center w-full")}>
            {/* Step Circle */}
            <div className="flex items-center justify-center w-full">
              <div className="h-0.5 bg-muted border-muted flex-1 mr-4" />
              <div
                className={cn(
                  "relative z-10 flex items-center justify-center w-8 h-8 rounded-full select-none",
                  isCompleted
                    ? "bg-primary border border-primary text-primary-foreground"
                    : isActive
                      ? "border border-primary text-primary"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              <div className="h-0.5 bg-muted border-muted flex-1 ml-4" />
            </div>
            {/* Step Label */}
            <div className="mt-2.5 text-sm font-semibold text-center">{step}</div>
          </div>
        );
      })}
    </div>
  );
};
