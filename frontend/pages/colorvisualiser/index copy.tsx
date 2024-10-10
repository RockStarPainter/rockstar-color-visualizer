import React, { useEffect, useState } from "react";
import Stepper from "../../components/Stepper";
import ImageSelection from "./ImageSelection";
import ColorSelection from "./ColorSelection";
import VisualizeRoom from "./VisualizeRoom";
import OrderPaints from "./OrderPaints";

function ColorVisualizer() {
  const [currentStep, setCurrentStep] = useState(0);
  const [initialMasks, setInitialMasks] = useState<any>(); // State to trigger mask reset

  // Function to move to the next step
  const nextStep = () => {
    if (currentStep < stepList.length - 1) setCurrentStep((prev) => prev + 1);
    console.log("Moving to next step: ", currentStep);
  };

  // Function to move to the previous step
  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  // Function to move to the previous step
  const moveToStep = (step: number) => {
    if (currentStep > 0 && currentStep < stepList.length - 1) setCurrentStep(step);
  };

  const stepList = [
    {
      label: "Select Image",
      content: (
        <div className="">
          <ImageSelection
            nextStep={nextStep}
            setInitialMasks={setInitialMasks}
          />
        </div>
      ),
    },
    {
      label: "Select Colors",
      content: (
        <div className="pt-2">
          <ColorSelection nextStep={nextStep} />
        </div>
      ),
    },
    {
      label: "Visualize Room",
      content: (
        <div className="mt-4">
          <VisualizeRoom
            nextStep={nextStep}
            prevStep={prevStep}
            moveToStep={moveToStep}
            initialMasks={initialMasks}
          />
        </div>
      ),
    },
    {
      label: "Order Paint",
      content: <OrderPaints nextStep={nextStep} />,
    },
  ];

  return (
    <>
      <Stepper stepList={stepList} currentStep={currentStep} />
    </>
  );
}

export default ColorVisualizer;
