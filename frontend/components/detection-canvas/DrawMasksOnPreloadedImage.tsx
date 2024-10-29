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

    // Calculate scale factors based on original image dimensions
    const scaleX = canvas.width / imageDimensions.width;
    const scaleY = canvas.height / imageDimensions.height;

    // Calculate normalized coordinates
    const x = (clientY - rect.top) * (canvas.height / rect.height);
    const y = (clientX - rect.left) * (canvas.width / rect.width);

    return { x, y, scaleX, scaleY };
  };

  const handleClick = (event: any) => {
    if (!imageLoaded || !masks?.length) return;

    const { x, y, scaleX, scaleY } = calculateCoordinates(
      event.clientX,
      event.clientY
    );

    masks.forEach((maskSegment: any, segmentIndex: any) => {
      if (isPointInMask(x, y, maskSegment, scaleX, scaleY)) {
        const updatedColors = [...currentMaskColors];
        updatedColors[segmentIndex] = selectedColor;
        setCurrentMaskColors(updatedColors);
      }
    });
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

    if (!ctx) {
      console.error("Canvas context is not available.");
      return false;
    }

    ctx.save();
    ctx.beginPath();

    // Scale mask coordinates to match canvas dimensions
    const [firstY, firstX] = maskSegment[0];
    ctx.moveTo(firstX * scaleX, firstY * scaleY);

    maskSegment.forEach(([pointY, pointX]: [number, number]) => {
      ctx.lineTo(pointX * scaleX, pointY * scaleY);
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

    const cursorOnMask = masks.some((maskSegment: [number, number][]) =>
      isPointInMask(x, y, maskSegment, scaleX, scaleY)
    );

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

      const [firstY, firstX] = maskSegment[0];
      ctx.moveTo(firstX * scaleX, firstY * scaleY);

      maskSegment.forEach(([pointY, pointX]: [number, number]) => {
        ctx.lineTo(pointX * scaleX, pointY * scaleY);
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
    if (!ctx) {
      console.error("Failed to get 2D context.");
      return;
    }

    // Set canvas dimensions based on loaded image
    const aspectRatio = image.width / image.height;
    canvas.width = 640;
    canvas.height = Math.round(640 / aspectRatio);

    // Clear and draw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Calculate and store scale factors
    const scaleX = canvas.width / imageDimensions.width;
    const scaleY = canvas.height / imageDimensions.height;

    // Draw masks with correct scaling
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
          // border: "1px solid black",
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    </div>
  );
};

export default DrawMasksOnPreloadedImage;
