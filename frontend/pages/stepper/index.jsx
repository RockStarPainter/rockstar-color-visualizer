import React, { useState } from "react";
import { ProgressBar, Step } from "react-step-progress-bar";
import "react-step-progress-bar/styles.css";

const stepes = [
  <div className="p-3 bg-light">Step 1: Introduction</div>,
  <div className="p-3 bg-light">Step 2: Personal Information</div>,
  <div className="p-3 bg-light">Step 3: Address Details</div>,
  <div className="p-3 bg-light">Step 4: Review & Submit</div>,
];

const StepperPage = ({ steps=stepes }) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Function to move to the next step
  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  // Function to move to the previous step
  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">
        Step {currentStep + 1} of {steps.length}
      </h2>
      <ProgressBar
        percent={(currentStep / (steps.length - 1)) * 100}
        filledBackground="linear-gradient(to right, #4caf50, #81c784)"
      >
        {steps.map((_, index) => (
          <Step key={index}>
            {({ accomplished }) => (
              <div
                className={`text-center ${
                  accomplished ? "bg-success text-white" : "bg-light"
                } p-2 rounded`}
                style={{
                  width: "100%",
                  transition: "background-color 0.3s ease",
                }}
              >
                Step {index + 1}
              </div>
            )}
          </Step>
        ))}
      </ProgressBar>

      <div className="mt-4">{steps[currentStep]}</div>

      <div className="d-flex justify-content-between mt-4">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="btn btn-secondary"
        >
          Previous
        </button>
        <button
          onClick={nextStep}
          disabled={currentStep === steps.length - 1}
          className="btn btn-primary"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StepperPage;
