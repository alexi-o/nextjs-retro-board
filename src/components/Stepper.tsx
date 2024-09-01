import React from "react";
import { cn } from "@/utils/cn";

interface StepperProps {
  currentStep: string;
  onStepChange: (step: string) => void;
}

const steps = [
  { name: "Reflect", path: "reflect" },
  { name: "Group", path: "group" },
  { name: "Vote", path: "vote" },
  { name: "Discuss", path: "discuss" },
];

export const Stepper: React.FC<StepperProps> = ({
  currentStep,
  onStepChange,
}) => {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.path} className="flex items-center">
          <button
            onClick={() => onStepChange(step.path)}
            className={cn(
              "px-4 py-2 rounded-full transition-colors",
              currentStep === step.path
                ? "bg-blue-500 text-white"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            )}
          >
            {step.name}
          </button>
          {index < steps.length - 1 && (
            <div className="w-6 h-px bg-gray-400 mx-2"></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Stepper;
