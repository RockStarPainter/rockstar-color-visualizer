import { useRouter } from "next/navigation";
import React from "react";
import StepProgressBar from "react-step-progress";
import "react-step-progress/dist/index.css";

// Stepper Component
const Stepper = ({ stepList, nextStep, prevStep, currentStep }) => {
  // Create validators for each step (optional)
  const validators = stepList.map(() => () => true);

  const router = useRouter()

  const navigateToHome = () => {
    router.push('/')
  }

  return (
    <div className="container mt-2">
      <StepProgressBar
        startingStep={currentStep}
        steps={stepList.map((step, index) => ({
          label: step.label,
          subtitle: step.subtitle || "", // Optional subtitle
          content: step.content,
          validator: validators[index],
        }))}
        onSubmit={navigateToHome}
      />

      {/* <div className="d-flex justify-content-between mt-4">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="btn btn-secondary"
        >
          Previous
        </button>
        <button
          onClick={nextStep}
          disabled={currentStep === stepList.length - 1}
          className="btn btn-primary"
        >
          Next
        </button>
      </div> */}
    </div>
  );
};

export default Stepper;
