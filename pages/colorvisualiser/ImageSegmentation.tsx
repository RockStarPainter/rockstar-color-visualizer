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
import ErrorMessage from "../../components/ErrorMessage";

interface Dimensions {
  width: number;
  height: number;
}

interface WallMask {
  wall_id: string;
  mask_data: boolean[][];
  area: number;
  bbox: number[];
  score: number;
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
  const ZOOM_LEVEL = 2;
  const ZOOM_SIZE = 150;

  const {
    image: [image],
  } = useContext(AppContext)!;

  // Wall masks and colored state
  const [wallMasks, setWallMasks] = useState<WallMask[]>([]);
  const [wallColors, setWallColors] = useState<Record<string, string>>({}); // wall_id -> color
  const [loading, setLoading] = useState(false);
  const [naturalDimensions, setNaturalDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });
  const [isMobile, setIsMobile] = useState(false);
  // Removed error and info states to prevent display issues

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Zoom state
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

  // Fetch wall masks from backend on image load/change
  useEffect(() => {
    if (!image?.src) return;
    console.log("Backend URL:", process.env.NEXT_PUBLIC_BACKEND_URL);
    console.log("Complete API URL:", `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/segment-walls/`);
    setLoading(true);
    setWallMasks([]);
    setWallColors({});
    // Helper to convert src to File
    const convertSrcToFile = async (src: string, fileName = "image.jpg"): Promise<File> => {
      const response = await fetch(src);
      const blob = await response.blob();
      return new File([blob], fileName, { type: blob.type });
    };
    (async () => {
      try {
        console.log("Starting wall segmentation for image:", image.src);
        const file = await convertSrcToFile(image.src);
        console.log("Converted image to file:", file.name, file.size);
        const formData = new FormData();
        formData.append("image", file);
        console.log("FormData created, sending to:", `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/segment-walls/`);
        // Call the wall segmentation endpoint
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/segment-walls/`,
          formData,
          { 
            headers: { "Content-Type": "multipart/form-data" },
            timeout: 30000 // 30 second timeout
          }
        );
        console.log("API response received:", response.status, response.data);
        // Support new backend format: single mask_data and segment_id
        const { mask_data, segment_id, image_dimensions } = response.data;
        console.log("Extracted data:", { mask_data_length: mask_data?.length, segment_id, image_dimensions });
        if (!mask_data || mask_data.length === 0) {
          // Silent handling for no wall regions
        } else {
          setWallMasks([
            {
              wall_id: segment_id,
              mask_data: mask_data,
              area: mask_data.flat().filter(Boolean).length,
              bbox: [],
              score: 1,
            },
          ]);
          // Removed info message to prevent display issues
        }
        if (image_dimensions) {
          setNaturalDimensions(image_dimensions);
        }
      } catch (err: any) {
        console.error("Error in wall segmentation:", err);
        console.error("Error details:", err.response?.data || err.message);
        // Silent error handling
      } finally {
        setLoading(false);
      }
    })();
  }, [image?.src]);

  // Clear masks/colors when signal changes
  useEffect(() => {
    if (!clearMasksSignal) return;
    setWallColors({});
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }, [clearMasksSignal]);

  // Draw colored walls on canvas
  const drawWallsOnCanvas = useCallback(() => {
    if (!canvasRef.current || wallMasks.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    canvas.width = displayDimensions.width;
    canvas.height = displayDimensions.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the original image first
    if (image?.src) {
      const img = new window.Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = image.src;
    }
  }, [wallMasks, displayDimensions, image?.src]);

  // Redraw on wallColors or wallMasks change
  useEffect(() => {
    drawWallsOnCanvas();
  }, [drawWallsOnCanvas]);

  // Utility: convert hex color to RGB
  const hexToRgb = useCallback((hex: string) => {
    if (!hex || hex === "") return { r: 255, g: 0, b: 0 };
    
    // Handle rgb() format
    if (hex.startsWith('rgb(')) {
      const matches = hex.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (matches) {
        return {
          r: parseInt(matches[1]),
          g: parseInt(matches[2]),
          b: parseInt(matches[3])
        };
      }
    }
    
    // Handle hex format (with or without #)
    let hexValue = hex;
    if (hexValue.startsWith('#')) {
      hexValue = hexValue.substring(1);
    }
    
    // Handle 3-digit hex
    if (hexValue.length === 3) {
      hexValue = hexValue.split('').map(char => char + char).join('');
    }
    
    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexValue);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 0, b: 0 };
  }, []);

  // Check if a pixel is a wall pixel
  const isWallPixel = useCallback((x: number, y: number) => {
    if (!wallMasks.length) return false;
    // Convert canvas coordinates to mask coordinates
    const maskX = Math.floor((x * naturalDimensions.width) / displayDimensions.width);
    const maskY = Math.floor((y * naturalDimensions.height) / displayDimensions.height);
    
    for (const mask of wallMasks) {
      if (mask.mask_data[maskY] && mask.mask_data[maskY][maskX] === true) {
        return true;
      }
    }
    return false;
  }, [wallMasks, naturalDimensions, displayDimensions]);

  // Flood fill algorithm restricted by mask (similar to Django code)
  const floodFillCanvas = useCallback((startX: number, startY: number, fillColor: { r: number, g: number, b: number }) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    const startPos = (startY * width + startX) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];
    
    const tolerance = 40; // Color tolerance for flood fill
    const pixelStack: [number, number][] = [[startX, startY]];
    const visited = new Uint8Array(width * height);
    
    while (pixelStack.length > 0) {
      const [x, y] = pixelStack.pop()!;
      
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      if (!isWallPixel(x, y)) continue;
      
      const idx = y * width + x;
      if (visited[idx]) continue;
      
      const pos = idx * 4;
      const r = data[pos];
      const g = data[pos + 1];
      const b = data[pos + 2];
      
      if (Math.abs(r - startR) <= tolerance && 
          Math.abs(g - startG) <= tolerance && 
          Math.abs(b - startB) <= tolerance) {
        
        data[pos] = fillColor.r;
        data[pos + 1] = fillColor.g;
        data[pos + 2] = fillColor.b;
        // Keep alpha unchanged
        visited[idx] = 1;
        
        // Add neighboring pixels to stack
        pixelStack.push([x + 1, y]);
        pixelStack.push([x - 1, y]);
        pixelStack.push([x, y + 1]);
        pixelStack.push([x, y - 1]);
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }, [isWallPixel]);

  // Handle user click: color wall if clicked inside a wall mask
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || wallMasks.length === 0) return;
      if (!selectedColor || selectedColor === "") {
        // Silent feedback for no color selected
        return;
      }
      
      // Clear any existing messages
      
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      // Convert to canvas coordinates
      const x = Math.round((clickX * canvas.width) / rect.width);
      const y = Math.round((clickY * canvas.height) / rect.height);
      
      console.log('Click at canvas coordinates:', { x, y });
      console.log('Selected color:', selectedColor);
      console.log('Is wall pixel:', isWallPixel(x, y));
      
      if (isWallPixel(x, y)) {
        // Apply flood fill coloring
        const rgbColor = hexToRgb(selectedColor);
        console.log('Applying RGB color:', rgbColor);
        floodFillCanvas(x, y, rgbColor);
        // Success feedback handled by toast in parent component
              } else {
          // Silent feedback for non-wall clicks
        }
    },
    [wallMasks, selectedColor, isWallPixel, floodFillCanvas, hexToRgb]
  );

  // Add zoom-related handlers (fixed positioning)
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate zoom window position relative to the container
      let zoomX = x - ZOOM_SIZE / 2;
      let zoomY = y - ZOOM_SIZE / 2;
      
      // Keep zoom window within canvas bounds
      zoomX = Math.max(0, Math.min(zoomX, rect.width - ZOOM_SIZE));
      zoomY = Math.max(0, Math.min(zoomY, rect.height - ZOOM_SIZE));
      
      setMousePosition({ x, y });
      setZoomPosition({ x: zoomX, y: zoomY });
    },
    []
  );

  // Create a separate canvas ref for the zoom overlay (unchanged)
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
          maxWidth: "100%",
        }}
      >
        <Image
          ref={imageRef}
          src={image?.src || ""}
          alt="Interactive Image"
          fill
          style={{
            objectFit: "contain",
          }}
          className="p-0"
          sizes={`(max-width: 768px) ${MAX_MOBILE_WIDTH}px, ${MAX_DESKTOP_WIDTH}px`}
          priority
        />
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setShowZoom(true)}
          onMouseLeave={() => setShowZoom(false)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            cursor: wallMasks.length > 0 && selectedColor ? "crosshair" : "not-allowed",
            pointerEvents: wallMasks.length > 0 ? "auto" : "none",
            borderRadius: "8px",
            boxShadow: wallMasks.length > 0 ? "0 0 10px rgba(0,0,0,0.1)" : "none",
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
              border: "3px solid #fff",
              boxShadow: "0 0 15px rgba(0,0,0,0.5)",
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
                alt=""
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
          <Loading message="Segmenting walls..." />
        </div>
      )}
      {/* Removed error and info displays to prevent image display issues */}
    </div>
  );
};

export default ImageMaskComponent;