import { useRouter } from "next/navigation";
import React from "react";
import StepProgressBar from "react-step-progress";
import "react-step-progress/dist/index.css";

// Stepper Component
const Stepper = ({ stepList, currentStep }) => {
  // Create validators for each step (optional)
  const validators = stepList.map(() => () => true);

  const router = useRouter()

  const navigateToHome = () => {
    router.push('/')
  }

  return (
    <div className=" mt-2">
      <StepProgressBar
        key={currentStep} // Force re-render when currentStep changes
        startingStep={currentStep}
        steps={stepList.map((step, index) => ({
          label: step.label,
          subtitle: step.subtitle || "", // Optional subtitle
          content: step.content,
          validator: validators[index],
        }))}
        onSubmit={navigateToHome}
      />
    </div>
  );
};

export default Stepper;
