import React, { useState, useEffect, useRef } from "react";

const ImageMaskOverlay = ({
  imgSrc,
  maskData,
  selectedColor,
  clearMasksSignal,
  setDownloadableImage, // New prop to pass the canvas image data
}: {
  imgSrc: any;
  maskData: any;
  selectedColor: string;
  clearMasksSignal: boolean;
  setDownloadableImage: (imageData: string) => void; // Add this prop to pass image data
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentMaskColors, setCurrentMaskColors] = useState<string[]>([]); // Array to store mask colors

  // Function to map segment index to color or selectedColor if clicked
  const getSegmentColor = (segmentIndex: any) => {
    const defaultColors: any = {
      0: "rgba(255, 0, 0, 0.5)", // Red for walls
      1: "rgba(0, 255, 0, 0.5)", // Green for ceiling
      // Add more segments as needed
    };

    return currentMaskColors[segmentIndex] || defaultColors[segmentIndex] || "rgba(0, 0, 255, 0.5)";
  };

  // Function to handle click and update mask color
  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (canvas && ctx && maskData?.masks?.length) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Check which mask segment contains the clicked coordinates
      for (let segmentIndex = 0; segmentIndex < maskData.masks.length; segmentIndex++) {
        const maskSegment = maskData.masks[segmentIndex];

        if (maskSegment.some(([maskX, maskY]: [number, number]) => maskX === Math.floor(x) && maskY === Math.floor(y))) {
          // User clicked on this mask, update its color with selectedColor
          const updatedColors = [...currentMaskColors];
          updatedColors[segmentIndex] = selectedColor; // Set the color to the selected color
          setCurrentMaskColors(updatedColors);

          // After updating the mask color, export the updated image
          exportImage(); // Capture the updated canvas as a downloadable image
          break;
        }
      }
    }
  };

  // Function to handle mouse move to change cursor
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (canvas && ctx && maskData?.masks?.length) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      let cursorOnMask = false;

      // Check if the mouse is over any mask segment
      for (let segmentIndex = 0; segmentIndex < maskData.masks.length; segmentIndex++) {
        const maskSegment = maskData.masks[segmentIndex];

        if (maskSegment.some(([maskX, maskY]: [number, number]) => maskX === Math.floor(x) && maskY === Math.floor(y))) {
          cursorOnMask = true;
          break;
        }
      }

      // Change cursor style based on whether it's over a mask
      if (cursorOnMask) {
        canvas.style.cursor = "pointer";
      } else {
        canvas.style.cursor = "default";
      }
    }
  };

  // Function to clear all the painted masks
  const clearMasks = () => {
    setCurrentMaskColors([]); // Reset the mask colors
  };

  // If clearMasksSignal is triggered, clear the masks
  useEffect(() => {
    if (clearMasksSignal) {
      clearMasks(); // Clear the masks
    }
  }, [clearMasksSignal]);

  // Function to create downloadable image from canvas and pass it to parent component
  const exportImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const imageData = canvas.toDataURL("image/png"); // Convert canvas to a base64 image
      setDownloadableImage(imageData); // Pass the image data to the parent via the prop
    }
  };

  // Draw the image and masks on the canvas
  const drawImageAndMasks = () => {
    const canvas = canvasRef.current;
    const ctx = canvas!.getContext("2d");
    const image = new Image();

    // Load the uploaded image into the canvas
    image.src = imgSrc;

    image.onload = () => {
      // Set canvas size based on image dimensions
      const aspectRatio = image.width / image.height;
      canvas!.width = 640; // Fixed width
      canvas!.height = 670 / aspectRatio; // Adjust height to maintain aspect ratio
      ctx!.drawImage(image, 0, 0, canvas!.width, canvas!.height); // Draw the image on the canvas

      // Ensure mask data is available
      if (maskData?.masks?.length) {
        // Draw each mask segment
        maskData.masks.forEach((maskSegment: any, segmentIndex: any) => {
          const segmentColor = getSegmentColor(segmentIndex); // Get color based on the segment
          ctx!.fillStyle = segmentColor;

          maskSegment.forEach(([x, y]: [number, number]) => {
            // Ensure the point is within canvas bounds
            if (x >= 0 && y >= 0 && x < canvas!.width && y < canvas!.height) {
              ctx!.fillRect(x, y, 1, 1); // Draw small mask pixels for clarity
            }
          });
        });
      } else {
        console.error("No valid mask data available.");
      }

      // Export the image whenever it's redrawn
      exportImage(); // Export the canvas as an image and pass to parent
    };
  };

  // Redraw the image and masks whenever mask data, imgSrc, or currentMaskColors changes
  useEffect(() => {
    if (maskData && imgSrc) {
      drawImageAndMasks();
    }
  }, [maskData, imgSrc, currentMaskColors]);

  return (
    <div>
      {/* Canvas to display the image and masks */}
      <canvas
        ref={canvasRef}
        onClick={handleClick} // Handle click events
        onMouseMove={handleMouseMove} // Handle mouse move events
        style={{ border: "1px solid black", width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default ImageMaskOverlay;





// import React, { useState, useEffect, useRef } from "react";

// const ImageMaskOverlay = ({
//   imgSrc,
//   maskData,
//   selectedColor,
//   clearMasksSignal,
//   setDownloadableImage, // New prop to pass the canvas image data
// }: {
//   imgSrc: any;
//   maskData: any;
//   selectedColor: string;
//   clearMasksSignal: boolean;
//   setDownloadableImage: (imageData: string) => void; // Add this prop to pass image data
// }) => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const [currentMaskColors, setCurrentMaskColors] = useState<string[]>([]); // Array to store mask colors

//   // Function to map segment index to color or selectedColor if clicked
//   const getSegmentColor = (segmentIndex: any) => {
//     const defaultColors: any = {
//       0: "rgba(255, 0, 0, 0.5)", // Red for walls
//       1: "rgba(0, 255, 0, 0.5)", // Green for ceiling
//       // Add more segments as needed
//     };

//     return currentMaskColors[segmentIndex] || defaultColors[segmentIndex] || "rgba(0, 0, 255, 0.5)";
//   };

//   // Function to handle click and update mask color
//   const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
//     const canvas = canvasRef.current;
//     const ctx = canvas?.getContext("2d");

//     if (canvas && ctx && maskData?.masks?.length) {
//       const rect = canvas.getBoundingClientRect();
//       const x = event.clientX - rect.left;
//       const y = event.clientY - rect.top;

//       // Check which mask segment contains the clicked coordinates
//       for (let segmentIndex = 0; segmentIndex < maskData.masks.length; segmentIndex++) {
//         const maskSegment = maskData.masks[segmentIndex];

//         if (maskSegment.some(([maskX, maskY]: [number, number]) => maskX === Math.floor(x) && maskY === Math.floor(y))) {
//           // User clicked on this mask, update its color with selectedColor
//           const updatedColors = [...currentMaskColors];
//           updatedColors[segmentIndex] = selectedColor; // Set the color to the selected color
//           setCurrentMaskColors(updatedColors);
//           break;
//         }
//       }
//     }
//   };

//   // Function to handle mouse move to change cursor
//   const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
//     const canvas = canvasRef.current;
//     const ctx = canvas?.getContext("2d");

//     if (canvas && ctx && maskData?.masks?.length) {
//       const rect = canvas.getBoundingClientRect();
//       const x = event.clientX - rect.left;
//       const y = event.clientY - rect.top;

//       let cursorOnMask = false;

//       // Check if the mouse is over any mask segment
//       for (let segmentIndex = 0; segmentIndex < maskData.masks.length; segmentIndex++) {
//         const maskSegment = maskData.masks[segmentIndex];

//         if (maskSegment.some(([maskX, maskY]: [number, number]) => maskX === Math.floor(x) && maskY === Math.floor(y))) {
//           cursorOnMask = true;
//           break;
//         }
//       }

//       // Change cursor style based on whether it's over a mask
//       if (cursorOnMask) {
//         canvas.style.cursor = "pointer";
//       } else {
//         canvas.style.cursor = "default";
//       }
//     }
//   };

//   // Function to clear all the painted masks
//   const clearMasks = () => {
//     setCurrentMaskColors([]); // Reset the mask colors
//   };

//   // If clearMasksSignal is triggered, clear the masks
//   useEffect(() => {
//     if (clearMasksSignal) {
//       clearMasks(); // Clear the masks
//     }
//   }, [clearMasksSignal]);

//   // Function to create downloadable image from canvas and pass it to parent component
//   const exportImage = () => {
//     const canvas = canvasRef.current;
//     if (canvas) {
//       const imageData = canvas.toDataURL("image/png"); // Convert canvas to a base64 image
//       setDownloadableImage(imageData); // Pass the image data to the parent via the prop
//     }
//   };

//   // Draw the image and masks on the canvas
//   const drawImageAndMasks = () => {
//     const canvas = canvasRef.current;
//     const ctx = canvas!.getContext("2d");
//     const image = new Image();

//     // Load the uploaded image into the canvas
//     image.src = imgSrc;

//     image.onload = () => {
//       // Set canvas size based on image dimensions
//       const aspectRatio = image.width / image.height;
//       canvas!.width = 640; // Fixed width
//       canvas!.height = 670 / aspectRatio; // Adjust height to maintain aspect ratio
//       ctx!.drawImage(image, 0, 0, canvas!.width, canvas!.height); // Draw the image on the canvas

//       // Ensure mask data is available
//       if (maskData?.masks?.length) {
//         // Draw each mask segment
//         maskData.masks.forEach((maskSegment: any, segmentIndex: any) => {
//           const segmentColor = getSegmentColor(segmentIndex); // Get color based on the segment
//           ctx!.fillStyle = segmentColor;

//           maskSegment.forEach(([x, y]: [number, number]) => {
//             // Ensure the point is within canvas bounds
//             if (x >= 0 && y >= 0 && x < canvas!.width && y < canvas!.height) {
//               ctx!.fillRect(x, y, 1, 1); // Draw small mask pixels for clarity
//             }
//           });
//         });
//       } else {
//         console.error("No valid mask data available.");
//       }

//       // Export the image whenever it's redrawn
//       exportImage(); // Export the canvas as an image and pass to parent
//     };
//   };

//   // Redraw the image and masks whenever mask data, imgSrc, or currentMaskColors changes
//   useEffect(() => {
//     if (maskData && imgSrc) {
//       drawImageAndMasks();
//     }
//   }, [maskData, imgSrc, currentMaskColors]);

//   return (
//     <div>
//       {/* Canvas to display the image and masks */}
//       <canvas
//         ref={canvasRef}
//         onClick={handleClick} // Handle click events
//         onMouseMove={handleMouseMove} // Handle mouse move events
//         style={{ border: "1px solid black", width: "100%", height: "100%" }}
//       />
//     </div>
//   );
// };

// export default ImageMaskOverlay;
