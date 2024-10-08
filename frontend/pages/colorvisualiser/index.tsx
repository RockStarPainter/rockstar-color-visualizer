import React, { useState } from "react";
import Stepper from "../../components/Stepper";
import ImageSelection from "./ImageSelection";

function ColorVisualizer() {
  const [currentStep, setCurrentStep] = useState(0);

  // Function to move to the next step
  const nextStep = () => {
    if (currentStep < stepList.length - 1) setCurrentStep(currentStep + 1);
  };

  // Function to move to the previous step
  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  // Define the steps (can be dynamic)
  const stepList = [
    {
      label: "Select Image",
      // subtitle: "Intro",
      content: (
        <div className="">
          <ImageSelection nextStep={nextStep} />
        </div>
      ),
    },
    {
      label: "Select Colors",
      // subtitle: "Personal Info",
      content: <div className="p-3 bg-light">Step 2: Select Colors</div>,
    },
    {
      label: "Visualize Room",
      // subtitle: "Address",
      content: <div className="p-3 bg-light">Step 3: Visualize Room</div>,
    },
    {
      label: "Order Paint",
      // subtitle: "Final Step",
      content: <div className="p-3 bg-light">Step 4: Order Paint</div>,
    },
  ];

  return (
    <>
      {/* Pass the stepList, currentStep, nextStep, and prevStep as props */}
      <Stepper
        stepList={stepList}
        currentStep={currentStep}
        nextStep={nextStep}
        prevStep={prevStep}
      />
    </>
  );
}

export default ColorVisualizer;
