import React, {
  useContext,
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import axios from "axios";
import Image from "next/image";
import AppContext from "../../utils/hooks/createContext";
import Loading from "../../components/Loading/Loading";

interface Dimensions {
  width: number;
  height: number;
}

interface Segment {
  segmentData: boolean[][];
  color: string;
}

interface ImageMaskProps {
  selectedColor: string;
  clearMasksSignal: boolean;
  setDownloadableImage: (imageData: string) => void;
}

const ImageMaskComponent: React.FC<ImageMaskProps> = ({
  selectedColor,
  clearMasksSignal,
  setDownloadableImage,
}) => {
  // Constants
  const MAX_DESKTOP_WIDTH = 800;
  const MAX_MOBILE_WIDTH = 350;
  const MAX_DESKTOP_HEIGHT = 550;
  const MAX_MOBILE_HEIGHT = 450;
  const DEFAULT_OPACITY = 0.7;
  const ZOOM_LEVEL = 2; // Zoom magnification level
  const ZOOM_SIZE = 150; // Size of the zoom window in pixels

  const {
    image: [image],
  } = useContext(AppContext)!;

  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(false);
  const [naturalDimensions, setNaturalDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });
  const [isMobile, setIsMobile] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Add new state for zoom functionality
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Check for mobile and update dimensions
  useEffect(() => {
    const updateDimensions = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Calculate display dimensions while maintaining aspect ratio
  const displayDimensions = useMemo((): Dimensions => {
    if (!naturalDimensions.width || !naturalDimensions.height) {
      return {
        width: isMobile ? MAX_MOBILE_WIDTH : MAX_DESKTOP_WIDTH,
        height: isMobile ? MAX_MOBILE_HEIGHT : MAX_DESKTOP_HEIGHT,
      };
    }

    const maxWidth = isMobile ? MAX_MOBILE_WIDTH : MAX_DESKTOP_WIDTH;
    const maxHeight = isMobile ? MAX_MOBILE_HEIGHT : MAX_DESKTOP_HEIGHT;
    const naturalAspectRatio =
      naturalDimensions.width / naturalDimensions.height;

    let width = maxWidth;
    let height = width / naturalAspectRatio;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * naturalAspectRatio;
    }

    return { width, height };
  }, [naturalDimensions, isMobile]);

  // Load natural image dimensions
  useEffect(() => {
    if (!image?.src) return;

    const tempImage = document.createElement("img");
    tempImage.src = image.src;
    tempImage.onload = () => {
      setNaturalDimensions({
        width: tempImage.naturalWidth,
        height: tempImage.naturalHeight,
      });
    };
  }, [image?.src]);

  // Clear masks when signal changes
  useEffect(() => {
    if (!clearMasksSignal) return;
    setSegments([]);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  }, [clearMasksSignal]);

  const convertSrcToFile = useCallback(
    async (src: string, fileName = "image.jpg"): Promise<File> => {
      try {
        const response = await fetch(src);
        const blob = await response.blob();
        return new File([blob], fileName, { type: blob.type });
      } catch (error) {
        console.error("Error converting src to file:", error);
        throw error;
      }
    },
    []
  );

  const adjustColorOpacity = useCallback(
    (color: string, opacity: number): string => {
      if (!color.startsWith("#")) return color;
      const hex = color.replace("#", "");
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    },
    []
  );

  const exportImage = useCallback(async () => {
    if (!canvasRef.current || !image?.src) return;

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCanvas.width = naturalDimensions.width;
    tempCanvas.height = naturalDimensions.height;

    const baseImage = document.createElement("img");
    baseImage.src = image.src;

    await new Promise<void>((resolve) => {
      baseImage.onload = () => {
        if (!tempCtx) return;
        tempCtx.drawImage(baseImage, 0, 0, tempCanvas.width, tempCanvas.height);

        if (canvasRef.current) {
          const scaleX = naturalDimensions.width / displayDimensions.width;
          const scaleY = naturalDimensions.height / displayDimensions.height;
          tempCtx.scale(scaleX, scaleY);
          tempCtx.drawImage(canvasRef.current, 0, 0);
        }

        setDownloadableImage(tempCanvas.toDataURL("image/png"));
        resolve();
      };
    });
  }, [image?.src, naturalDimensions, displayDimensions, setDownloadableImage]);

  const drawSegmentsOnCanvas = useCallback(
    (allSegments: Segment[]) => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      canvas.width = displayDimensions.width;
      canvas.height = displayDimensions.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Enable image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const scaleX = displayDimensions.width / naturalDimensions.width;
      const scaleY = displayDimensions.height / naturalDimensions.height;

      // Draw each segment independently with its own color
      allSegments.forEach(({ segmentData, color }) => {
        // Create a temporary canvas for the mask
        const maskCanvas = document.createElement("canvas");
        const maskCtx = maskCanvas.getContext("2d", {
          willReadFrequently: true,
        });
        if (!maskCtx) return;

        maskCanvas.width = canvas.width;
        maskCanvas.height = canvas.height;

        // Create a temporary canvas for the colored segment
        const colorCanvas = document.createElement("canvas");
        const colorCtx = colorCanvas.getContext("2d", {
          willReadFrequently: true,
        });
        if (!colorCtx) return;

        colorCanvas.width = canvas.width;
        colorCanvas.height = canvas.height;

        // Draw the segment mask
        const imageData = maskCtx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;

        segmentData.forEach((row, y) => {
          row.forEach((value, x) => {
            if (value) {
              const pixelX = Math.floor(x * scaleX);
              const pixelY = Math.floor(y * scaleY);

              for (let offsetY = -1; offsetY <= 1; offsetY++) {
                for (let offsetX = -1; offsetX <= 1; offsetX++) {
                  const px = pixelX + offsetX;
                  const py = pixelY + offsetY;

                  if (
                    px >= 0 &&
                    px < canvas.width &&
                    py >= 0 &&
                    py < canvas.height
                  ) {
                    const index = (py * canvas.width + px) * 4;
                    data[index] = 255;
                    data[index + 1] = 255;
                    data[index + 2] = 255;
                    data[index + 3] = 255;
                  }
                }
              }
            }
          });
        });

        // Apply the mask
        maskCtx.putImageData(imageData, 0, 0);

        // Apply blur for smoother edges
        maskCtx.filter = "blur(1px)";
        maskCtx.drawImage(maskCanvas, 0, 0);
        maskCtx.filter = "none";

        // Fill the color canvas with the segment color
        colorCtx.fillStyle = color;
        colorCtx.fillRect(0, 0, colorCanvas.width, colorCanvas.height);

        // Apply the mask to the color
        colorCtx.globalCompositeOperation = "destination-in";
        colorCtx.drawImage(maskCanvas, 0, 0);

        // Draw the colored segment onto the main canvas
        ctx.save();
        ctx.globalAlpha = 0.95;
        ctx.drawImage(colorCanvas, 0, 0);
        ctx.restore();
      });

      exportImage();
    },
    [displayDimensions, naturalDimensions, exportImage]
  );

  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLImageElement>) => {
      if (!image?.src || !imageRef.current) {
        console.error("No image selected or invalid image source.");
        return;
      }

      const rect = imageRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const x = Math.floor(
        (clickX * naturalDimensions.width) / displayDimensions.width
      );
      const y = Math.floor(
        (clickY * naturalDimensions.height) / displayDimensions.height
      );

      try {
        setLoading(true);
        const file = await convertSrcToFile(image.src);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("sample_prediction", "false");
        formData.append("x", x.toString());
        formData.append("y", y.toString());

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/upload/`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        const { segment: segmentData } = response.data;
        if (segmentData) {
          const newSegment = {
            segmentData,
            color: adjustColorOpacity(selectedColor, DEFAULT_OPACITY),
          };
          const updatedSegments = [...segments, newSegment];
          setSegments(updatedSegments);
          drawSegmentsOnCanvas(updatedSegments);
        }
      } catch (error) {
        console.error("Error fetching mask or segment:", error);
      } finally {
        setLoading(false);
      }
    },
    [
      image?.src,
      selectedColor,
      segments,
      naturalDimensions,
      displayDimensions,
      convertSrcToFile,
      adjustColorOpacity,
      drawSegmentsOnCanvas,
    ]
  );

  // Add zoom-related handlers
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLImageElement>) => {
      if (!imageRef.current) return;

      const rect = imageRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Calculate zoom window position
      let zoomX = x - ZOOM_SIZE / 2;
      let zoomY = y - ZOOM_SIZE / 2;

      // Keep zoom window within image bounds
      zoomX = Math.max(0, Math.min(zoomX, displayDimensions.width - ZOOM_SIZE));
      zoomY = Math.max(
        0,
        Math.min(zoomY, displayDimensions.height - ZOOM_SIZE)
      );

      setMousePosition({ x, y });
      setZoomPosition({ x: zoomX, y: zoomY });
    },
    [displayDimensions]
  );

  // Create a separate canvas ref for the zoom overlay
  const zoomCanvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div
      ref={containerRef}
      className="d-flex justify-content-center align-items-center p-0"
      style={{
        width: "100%",
        height: isMobile ? "auto" : `${MAX_DESKTOP_HEIGHT}px`,
      }}
    >
      <div
        className="position-relative d-flex justify-content-center align-items-center"
        style={{
          width: `${displayDimensions.width}px`,
          height: `${displayDimensions.height}px`,
          margin: "0 auto",
        }}
      >
        <Image
          ref={imageRef}
          src={image?.src || ""}
          alt="Interactive Image"
          fill
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setShowZoom(true)}
          onMouseLeave={() => setShowZoom(false)}
          style={{
            cursor: "pointer",
            objectFit: "contain",
          }}
          className="p-0"
          sizes={`(max-width: 768px) ${MAX_MOBILE_WIDTH}px, ${MAX_DESKTOP_WIDTH}px`}
          priority
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        />
        {showZoom && (
          <div
            style={{
              position: "absolute",
              left: `${zoomPosition.x}px`,
              top: `${zoomPosition.y}px`,
              width: `${ZOOM_SIZE}px`,
              height: `${ZOOM_SIZE}px`,
              border: "2px solid #fff",
              boxShadow: "0 0 10px rgba(0,0,0,0.3)",
              overflow: "hidden",
              borderRadius: "50%",
              pointerEvents: "none",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                position: "absolute",
                width: `${displayDimensions.width * ZOOM_LEVEL}px`,
                height: `${displayDimensions.height * ZOOM_LEVEL}px`,
                transform: `translate(${
                  -mousePosition.x * ZOOM_LEVEL + ZOOM_SIZE / 2
                }px, ${-mousePosition.y * ZOOM_LEVEL + ZOOM_SIZE / 2}px)`,
              }}
            >
              <Image
                src={image?.src || ""}
                alt="Zoomed Image"
                fill
                style={{
                  objectFit: "contain",
                }}
                sizes={`${MAX_DESKTOP_WIDTH * ZOOM_LEVEL}px`}
                priority
              />
              <canvas
                ref={zoomCanvasRef}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>
        )}
      </div>
      {loading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75"
          style={{ zIndex: 1000 }}
        >
          <Loading message="" />
        </div>
      )}
    </div>
  );
};

export default ImageMaskComponent;
