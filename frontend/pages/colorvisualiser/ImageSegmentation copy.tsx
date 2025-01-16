import React, { useContext, useState, useRef, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import AppContext from "../../utils/hooks/createContext";

const ImageMaskComponent = ({
  selectedColor,
  clearMasksSignal,
  setDownloadableImage,
}: any) => {
  const {
    image: [image],
    texture: [texture, setTexture],
    color: [color, setColor],
  } = useContext(AppContext);

  const [segments, setSegments] = useState([]); // Store all segments with colors
  const [loading, setLoading] = useState(false);
  const imageRef = useRef(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState({ x: 1, y: 1 });
  const [naturalDimensions, setNaturalDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (image?.src) {
      const tempImage = document.createElement("img");
      tempImage.src = image.src;
      tempImage.onload = () => {
        setNaturalDimensions({
          width: tempImage.naturalWidth,
          height: tempImage.naturalHeight,
        });
      };
    }
  }, [image?.src]);

  useEffect(() => {
    if (
      imageRef.current &&
      naturalDimensions.width &&
      naturalDimensions.height
    ) {
      const updateScale = () => {
        const displayWidth = imageRef.current.clientWidth;
        const displayHeight = imageRef.current.clientHeight;

        setScale({
          x: displayWidth / naturalDimensions.width,
          y: displayHeight / naturalDimensions.height,
        });
      };

      updateScale();
      window.addEventListener("resize", updateScale);
      return () => window.removeEventListener("resize", updateScale);
    }
  }, [naturalDimensions, image]);

  useEffect(() => {
    if (clearMasksSignal) {
      // Clear all segments when the clearMasksSignal is triggered
      setSegments([]);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [clearMasksSignal]);

  const convertSrcToFile = async (src, fileName = "image.jpg") => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      return new File([blob], fileName, { type: blob.type });
    } catch (error) {
      console.error("Error converting src to file:", error);
      throw error;
    }
  };

  const adjustColorOpacity = (color, opacity) => {
    // Convert HEX color to RGBA with the desired opacity
    if (color.startsWith("#")) {
      const hex = color.replace("#", "");
      const bigint = parseInt(hex, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color; // If already RGBA or other format, return as is
  };

  // Function to create downloadable image from canvas and pass it to parent component
  const exportImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const imageData = canvas.toDataURL("image/png"); // Convert canvas to a base64 image
      setDownloadableImage(imageData); // Pass the image data to the parent via the prop
    }
  };

  const drawSegmentsOnCanvas = (allSegments) => {
    if (!canvasRef.current || !allSegments) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set canvas dimensions to match the image
    canvas.width = naturalDimensions.width;
    canvas.height = naturalDimensions.height;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each segment with its corresponding color
    allSegments.forEach(({ segmentData, color }) => {
      segmentData.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value) {
            ctx.fillStyle = color; // Use the assigned color
            ctx.fillRect(x, y, 1, 1); // Draw a single pixel
          }
        });
      });
    });

    exportImage();
  };

  const handleClick = async (e) => {
    if (!image?.src || !imageRef.current) {
      console.error("No image selected or invalid image source.");
      return;
    }

    const rect = imageRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / scale.x);
    const y = Math.floor((e.clientY - rect.top) / scale.y);

    try {
      const file = await convertSrcToFile(image.src, "uploaded-image.jpg");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sample_prediction", "false");
      formData.append("x", x.toString());
      formData.append("y", y.toString());

      setLoading(true);
      const response = await axios.post(
        // "https://a9cf-202-163-76-177.ngrok-free.app/image/upload/",
        "https://rockstarcolorvisualizer.xyz/image/upload/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { segment: segmentData } = response.data;
      console.log("Server Response:", response.data); // Debugging log
      if (segmentData) {
        const colorWithOpacity = adjustColorOpacity(selectedColor, 0.5); // Adjust color opacity to 0.5
        const newSegment = { segmentData, color: colorWithOpacity }; // Add new segment with the adjusted color
        const updatedSegments = [...segments, newSegment];
        setSegments(updatedSegments); // Update state with all segments
        drawSegmentsOnCanvas(updatedSegments); // Draw all segments
      } else {
        console.warn("Segment data is null or undefined.");
      }
    } catch (error) {
      console.error("Error fetching mask or segment:", error);
    } finally {
      exportImage();
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <Image
        ref={imageRef}
        src={image?.src || ""}
        alt="Interactive Image"
        width={naturalDimensions.width || 512}
        height={naturalDimensions.height || 512}
        onClick={handleClick}
        style={{ cursor: "pointer" }}
      />

      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
        }}
      />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <p className="text-white">Loading mask...</p>
        </div>
      )}
    </div>
  );
};

export default ImageMaskComponent;
