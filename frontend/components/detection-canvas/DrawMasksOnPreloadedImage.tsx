import React, { useState, useEffect, useRef } from "react";

const DrawMasksOnPreloadedImage = ({
  imgSrc,
  masks,
  selectedColor,
  clearMasksSignal,
  setDownloadableImage,
}: any) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [currentMaskColors, setCurrentMaskColors] = useState<string[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  const getSegmentColor = (segmentIndex: number) => {
    const defaultColors: { [key: number]: string } = {
      0: "rgba(255, 0, 0, 0.5)", // Red for walls
      1: "rgba(0, 255, 0, 0.5)", // Green for ceiling
    };

    return (
      currentMaskColors[segmentIndex] ||
      defaultColors[segmentIndex] ||
      "rgba(0, 0, 255, 0.5)"
    );
  };

  const calculateCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, scaleX: 1, scaleY: 1 };

    const rect = canvas.getBoundingClientRect();
    
    // Calculate scale factors
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Calculate actual canvas coordinates
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    // Calculate mask scaling factors
    const maskScaleX = canvas.width / imageDimensions.width;
    const maskScaleY = canvas.height / imageDimensions.height;

    return { x, y, scaleX: maskScaleX, scaleY: maskScaleY };
  };

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageLoaded || !masks?.length) return;

    const { x, y, scaleX, scaleY } = calculateCoordinates(
      event.clientX,
      event.clientY
    );

    // Check each mask segment
    for (let segmentIndex = 0; segmentIndex < masks.length; segmentIndex++) {
      const maskSegment = masks[segmentIndex];
      if (isPointInMask(x, y, maskSegment, scaleX, scaleY)) {
        const updatedColors = [...currentMaskColors];
        updatedColors[segmentIndex] = selectedColor;
        setCurrentMaskColors(updatedColors);
        break; // Exit after finding the first matching mask
      }
    }
  };

  const isPointInMask = (
    x: number,
    y: number,
    maskSegment: [number, number][],
    scaleX: number,
    scaleY: number
  ): boolean => {
    if (!maskSegment?.length) return false;

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return false;

    ctx.save();
    ctx.beginPath();

    // Create path from mask points with correct scaling
    maskSegment.forEach(([maskY, maskX]: [number, number], index) => {
      const scaledX = maskX * scaleX;
      const scaledY = maskY * scaleY;
      
      if (index === 0) {
        ctx.moveTo(scaledX, scaledY);
      } else {
        ctx.lineTo(scaledX, scaledY);
      }
    });

    ctx.closePath();
    const isInside = ctx.isPointInPath(x, y);
    ctx.restore();

    return isInside;
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageLoaded || !masks?.length) return;

    const canvas = canvasRef.current;
    const { x, y, scaleX, scaleY } = calculateCoordinates(
      event.clientX,
      event.clientY
    );

    let cursorOnMask = false;
    for (const maskSegment of masks) {
      if (isPointInMask(x, y, maskSegment, scaleX, scaleY)) {
        cursorOnMask = true;
        break;
      }
    }

    if (canvas) {
      canvas.style.cursor = cursorOnMask ? "pointer" : "default";
    }
  };

  const drawMasks = (
    ctx: CanvasRenderingContext2D,
    scaleX: number,
    scaleY: number
  ) => {
    if (!masks?.length) return;

    masks.forEach((maskSegment: [number, number][], segmentIndex: number) => {
      if (!maskSegment?.length) return;

      const segmentColor = getSegmentColor(segmentIndex);
      ctx.fillStyle = segmentColor;
      ctx.beginPath();

      // Draw mask with correct scaling
      maskSegment.forEach(([maskY, maskX]: [number, number], index) => {
        const scaledX = maskX * scaleX;
        const scaledY = maskY * scaleY;
        
        if (index === 0) {
          ctx.moveTo(scaledX, scaledY);
        } else {
          ctx.lineTo(scaledX, scaledY);
        }
      });

      ctx.closePath();
      ctx.fill();
    });
  };

  const drawImageAndMasks = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;

    if (!canvas || !image || !imageLoaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions maintaining aspect ratio
    const aspectRatio = image.width / image.height;
    // canvas.width = 640;
    // canvas.height = Math.round(640 / aspectRatio);

    canvas.width = 640
    canvas.height = 450

    // Clear canvas and draw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Calculate scale factors
    const scaleX = canvas.width / imageDimensions.width;
    const scaleY = canvas.height / imageDimensions.height;

    // Draw masks
    drawMasks(ctx, scaleX, scaleY);

    // Export the result
    exportImage();
  };

  const exportImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const imageData = canvas.toDataURL("image/png");
      setDownloadableImage(imageData);
    }
  };

  // Handle image loading
  useEffect(() => {
    if (imgSrc) {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = imgSrc;

      image.onload = () => {
        imageRef.current = image;
        setImageDimensions({ width: image.width, height: image.height });
        setImageLoaded(true);
      };

      image.onerror = (error) => {
        console.error("Failed to load the image:", error);
        setImageLoaded(false);
      };
    }
  }, [imgSrc]);

  // Handle drawing
  useEffect(() => {
    if (imageLoaded && masks) {
      drawImageAndMasks();
    }
  }, [imageLoaded, masks, currentMaskColors]);

  // Handle clear masks signal
  useEffect(() => {
    if (clearMasksSignal) {
      setCurrentMaskColors([]);
    }
  }, [clearMasksSignal]);

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    </div>
  );
};

export default DrawMasksOnPreloadedImage;