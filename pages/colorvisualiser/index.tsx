import React, { useEffect, useState } from "react";
import Stepper from "../../components/Stepper";
import ImageSelection from "./ImageSelection";
import ColorSelection from "./ColorSelection";
import VisualizeRoom from "./VisualizeRoom";
import OrderPaints from "./OrderPaints";
import { FaArrowLeft } from "react-icons/fa"; // Import the icon

function ColorVisualizer() {
  const [currentStep, setCurrentStep] = useState(0);
  const [initialMasks, setInitialMasks] = useState<any>(); // State to trigger mask reset
  const [maskedImageWithColors, setMaskedImageWithColors] = useState<any>(); // State to trigger mask reset
  const [isPreloaded, setIsPreloaded] = useState<boolean>(false); // To track preloaded images
  const [imageFile, setImageFile] = useState<any>(null);
  
  // 🚀 NEW: Comprehensive state persistence for segmented images
  const [segmentedImageState, setSegmentedImageState] = useState<{
    imageSrc: string | null;
    wallMasks: any[];
    naturalDimensions: any;
    paintedPixels: Map<string, string>;
    wallColors: Record<string, string>;
    originalImageData: any;
    downloadableImage: string | null;
    isProcessed: boolean;
  } | null>(null);
  


  // Function to move to the next step
  const nextStep = () => {
    if (currentStep < stepList.length - 1) setCurrentStep((prev) => prev + 1);
    console.log("Moving to next step: ", currentStep);
  };

  // Function to move to the previous step
  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  // Function to move to a specific step
  const moveToStep = (step: number) => {
    if (currentStep > 0 && currentStep < stepList.length - 1)
      setCurrentStep(step);
  };

  // 🚀 NEW: Function to save segmented image state
  const saveSegmentedImageState = (state: any) => {
    console.log("Saving segmented image state:", state);
    setSegmentedImageState(state);
  };

  // 🚀 NEW: Function to restore segmented image state
  const restoreSegmentedImageState = () => {
    return segmentedImageState;
  };

  // 🚀 NEW: Function to check if we have a processed image
  const hasProcessedImage = () => {
    return segmentedImageState && segmentedImageState.isProcessed;
  };

  const stepList = [
    {
      label: "Select Image",
      content: (
        <div className="">
          <ImageSelection
            nextStep={nextStep}
            setInitialMasks={setInitialMasks}
            setMaskedImageWithColors={setMaskedImageWithColors}
            isPreloaded={isPreloaded}
            setIsPreloaded={setIsPreloaded}
          />
        </div>
      ),
    },
    {
      label: "Select Colors",
      content: (
        <div className="pt-2">
          {/* Add Previous button */}
          <button onClick={prevStep} className="btn btn-secondary mt-4 ms-2">
            <FaArrowLeft className="me-2" />
            Back
          </button>

          <ColorSelection nextStep={nextStep} />
        </div>
      ),
    },
    {
      label: "Visualize Room",
      content: (
        <div className="mt-4">
          {/* Add Previous button */}
          <button onClick={prevStep} className="btn btn-secondary mt-4">
            <FaArrowLeft className="me-2" />
            Back
          </button>

          <VisualizeRoom
            nextStep={nextStep}
            prevStep={prevStep}
            moveToStep={moveToStep}
            initialMasks={initialMasks}
            setMaskedImageWithColors={setMaskedImageWithColors}
            isPreloaded={isPreloaded}
            imageFile={imageFile}
            saveSegmentedImageState={saveSegmentedImageState}
            restoreSegmentedImageState={restoreSegmentedImageState}
            hasProcessedImage={hasProcessedImage}
          />

          
        </div>
      ),
    },
    {
      label: "Book your service",
      content: (
        <div>
          {/* Add Previous button */}
          <button onClick={prevStep} className="btn btn-secondary mt-4 ms-3">
            <FaArrowLeft className="me-2" />
            Back
          </button>

          <OrderPaints
            nextStep={nextStep}
            maskedImageWithColors={maskedImageWithColors}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <Stepper stepList={stepList} currentStep={currentStep} />
    </>
  );
}

export default ColorVisualizer;
