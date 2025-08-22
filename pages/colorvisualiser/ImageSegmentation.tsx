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
  preProcessedSegmentation?: any; // Add this prop
  saveSegmentedImageState: (state: any) => void; // Save state function
  restoreSegmentedImageState: () => any; // Restore state function
  hasProcessedImage: () => boolean; // Check if image is processed
  setCanUndo: (canUndo: boolean) => void; // Set undo availability
  setUndoFunction: (undoFn: (() => void) | null) => void; // Set undo function
}

const ImageMaskComponent: React.FC<ImageMaskProps> = ({
  selectedColor,
  clearMasksSignal,
  setDownloadableImage,
  preProcessedSegmentation, // Add this prop
  saveSegmentedImageState,
  restoreSegmentedImageState,
  hasProcessedImage,
  setCanUndo,
  setUndoFunction,
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
  const [paintedPixels, setPaintedPixels] = useState<Map<string, string>>(new Map()); // Track painted pixels as "x,y" -> color mapping
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null); // Store original image data
  const [loading, setLoading] = useState(false);
  const [naturalDimensions, setNaturalDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });
  const [isMobile, setIsMobile] = useState(false);
  
  // Cache for processed images to prevent unnecessary API calls
  const [processedImagesCache, setProcessedImagesCache] = useState<Map<string, any>>(new Map());
  const [isImageProcessed, setIsImageProcessed] = useState(false);
  
  // 🚀 NEW: Step-by-step undo system
  const [paintingHistory, setPaintingHistory] = useState<Array<{
    id: string;
    timestamp: number;
    action: 'paint' | 'clear';
    pixels: Set<string>;
    color: string;
    originalPixelData: Map<string, { r: number; g: number; b: number }>;
  }>>([]);
  // Removed error and info states to prevent display issues

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const processedImagesRef = useRef<Set<string>>(new Set()); // Track processed images by URL

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

  // 🚀 NEW: Check for existing segmented image state on mount
  useEffect(() => {
    if (image?.src && hasProcessedImage()) {
      const existingState = restoreSegmentedImageState();
      if (existingState && existingState.imageSrc === image.src) {
        console.log("Restoring existing segmented image state:", existingState);
        
        // Restore all the state
        setWallMasks(existingState.wallMasks || []);
        setNaturalDimensions(existingState.naturalDimensions || { width: 0, height: 0 });
        setPaintedPixels(existingState.paintedPixels || new Map());
        setWallColors(existingState.wallColors || {});
        setOriginalImageData(existingState.originalImageData);
        setIsImageProcessed(true);
        
        // Mark as processed to prevent API calls
        if (image.src) {
          processedImagesRef.current.add(image.src);
        }
        
        // Update downloadable image
        if (existingState.downloadableImage) {
          setDownloadableImage(existingState.downloadableImage);
        }
        
        console.log("Successfully restored segmented image state - no API call needed");
        return;
      }
    }
  }, [image?.src, hasProcessedImage, restoreSegmentedImageState]);



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
    
    // Check if this image has already been processed
    const imageKey = image.src;
    
    // Use ref to check if image was already processed (prevents infinite loops)
    if (processedImagesRef.current.has(imageKey)) {
      console.log("Image already processed, skipping API call:", imageKey);
      return; // Skip API call
    }
    
    const cachedData = processedImagesCache.get(imageKey);
    
    if (cachedData) {
      console.log("Using cached data for image:", imageKey);
      // Restore cached data
      setWallMasks(cachedData.wallMasks);
      setNaturalDimensions(cachedData.naturalDimensions);
      setPaintedPixels(cachedData.paintedPixels || new Map());
      setWallColors(cachedData.wallColors || {});
      setOriginalImageData(cachedData.originalImageData);
      setIsImageProcessed(true);
      
      // Update downloadable image
      if (cachedData.downloadableImage) {
        setDownloadableImage(cachedData.downloadableImage);
      }
      return; // Skip API call
    }
    
    console.log("Processing new image:", imageKey);
    console.log("Backend URL:", process.env.NEXT_PUBLIC_BACKEND_URL);
    console.log("Complete API URL:", `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/segment-walls/`);
    
    console.log("Setting loading to true for new image");
    setLoading(true);
    setWallMasks([]);
    setWallColors({});
    setPaintedPixels(new Map()); // Clear painted pixels when new image loads
    setOriginalImageData(null); // Clear original image data when new image loads
    setIsImageProcessed(false);
    
    // Reset downloadable image to new image
    if (image?.src) {
      setDownloadableImage(image.src);
    }
    
    // Clear cache for new image
    setProcessedImagesCache(new Map());
    processedImagesRef.current.clear(); // Clear processed images tracking
    
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
        
        const newWallMasks = [];
        if (!mask_data || mask_data.length === 0) {
          // Silent handling for no wall regions
        } else {
          newWallMasks.push({
            wall_id: segment_id,
            mask_data: mask_data,
            area: mask_data.flat().filter(Boolean).length,
            bbox: [],
            score: 1,
          });
          setWallMasks(newWallMasks);
        }
        
        if (image_dimensions) {
          setNaturalDimensions(image_dimensions);
        }
        
        // Cache the processed data
        const dataToCache = {
          wallMasks: newWallMasks,
          naturalDimensions: image_dimensions || naturalDimensions,
          paintedPixels: new Map(),
          wallColors: {},
          originalImageData: null, // Will be set later when canvas is drawn
          downloadableImage: image.src
        };
        
        setProcessedImagesCache(prev => new Map(prev).set(imageKey, dataToCache));
        setIsImageProcessed(true);
        
        // Mark this image as processed to prevent future API calls
        processedImagesRef.current.add(imageKey);
        
        // 🚀 NEW: Save state to parent component after successful API call
        if (saveSegmentedImageState) {
          const stateToSave = {
            imageSrc: image.src,
            wallMasks: newWallMasks,
            naturalDimensions: image_dimensions || naturalDimensions,
            paintedPixels: new Map(),
            wallColors: {},
            originalImageData: null, // Will be set later when canvas is drawn
            downloadableImage: image.src,
            isProcessed: true
          };
          saveSegmentedImageState(stateToSave);
        }
        
      } catch (err: any) {
        console.error("Error in wall segmentation:", err);
        console.error("Error details:", err.response?.data || err.message);
        // Silent error handling
      } finally {
        console.log("API call completed, setting loading to false");
        setLoading(false);
      }
    })();
  }, [image?.src]); // Removed problematic dependencies

  // Separate effect to restore cached data when available
  useEffect(() => {
    if (!image?.src || !isImageProcessed) return;
    
    const imageKey = image.src;
    const cachedData = processedImagesCache.get(imageKey);
    
    if (cachedData) {
      console.log("Restoring cached data for image:", imageKey);
      // Restore cached data
      setWallMasks(cachedData.wallMasks);
      setNaturalDimensions(cachedData.naturalDimensions);
      setPaintedPixels(cachedData.paintedPixels || new Map());
      setWallColors(cachedData.wallColors || {});
      setOriginalImageData(cachedData.originalImageData);
      
      // Update downloadable image
      if (cachedData.downloadableImage) {
        setDownloadableImage(cachedData.downloadableImage);
      }
    }
  }, [image?.src, isImageProcessed, processedImagesCache]);

  // Clear masks/colors when signal changes
  useEffect(() => {
    if (!clearMasksSignal) return;
    setWallColors({});
    setPaintedPixels(new Map()); // Clear painted pixels tracking
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      // Restore original image if available
      if (originalImageData) {
        ctx.putImageData(originalImageData, 0, 0);
      }
    }
    
    // Update downloadable image to show cleared state
    if (originalImageData) {
      // Create a temporary function to avoid dependency issues
      const tempCapture = () => {
        if (!canvasRef.current) return null;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        
        try {
          const captureCanvas = document.createElement("canvas");
          captureCanvas.width = canvas.width;
          captureCanvas.height = canvas.height;
          const captureCtx = captureCanvas.getContext("2d");
          
          if (!captureCtx) return null;
          captureCtx.drawImage(canvas, 0, 0);
          return captureCanvas.toDataURL("image/png", 0.9);
        } catch (error) {
          console.error("Error capturing canvas:", error);
          return null;
        }
      };
      
      const clearedImageData = tempCapture();
      if (clearedImageData) {
        setDownloadableImage(clearedImageData);
        
        // Update cache with cleared state
        if (image?.src) {
          const imageKey = image.src;
          setProcessedImagesCache(prev => {
            const currentCache = prev.get(imageKey);
            if (currentCache) {
              const updatedCache = { 
                ...currentCache, 
                paintedPixels: new Map(),
                wallColors: {},
                downloadableImage: clearedImageData
              };
              return new Map(prev).set(imageKey, updatedCache);
            }
            return prev;
          });
        }
      }
    }
  }, [clearMasksSignal, originalImageData, setDownloadableImage]);

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
        
        // Store original image data for restoration purposes
        if (!originalImageData) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          setOriginalImageData(imageData);
          
          // Update cache with original image data
          if (image?.src) {
            const imageKey = image.src;
            setProcessedImagesCache(prev => {
              const currentCache = prev.get(imageKey);
              if (currentCache) {
                const updatedCache = { ...currentCache, originalImageData: imageData };
                return new Map(prev).set(imageKey, updatedCache);
              }
              return prev;
            });
            
            // 🚀 NEW: Update parent state with original image data
            if (saveSegmentedImageState) {
              const currentState = restoreSegmentedImageState();
              if (currentState && currentState.imageSrc === image.src) {
                const updatedState = {
                  ...currentState,
                  originalImageData: imageData
                };
                saveSegmentedImageState(updatedState);
              }
            }
          }
        }
      };
      img.src = image.src;
    }
  }, [wallMasks, displayDimensions, image?.src, originalImageData]);

  // Redraw on wallColors or wallMasks change
  useEffect(() => {
    drawWallsOnCanvas();
  }, [drawWallsOnCanvas]);

  // Utility: convert hex color to RGB
  // Convert hex or rgb() string to RGB object
const hexToRgb = useCallback((hex: string) => {
  if (!hex || hex === "") return { r: 255, g: 0, b: 0 };

  // Handle rgb() format
  if (hex.startsWith("rgb(")) {
    const matches = hex.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (matches) {
      return {
        r: parseInt(matches[1]),
        g: parseInt(matches[2]),
        b: parseInt(matches[3]),
      };
    }
  }

  // Handle hex format (with or without #)
  let hexValue = hex.startsWith("#") ? hex.substring(1) : hex;

  // Handle 3-digit hex
  if (hexValue.length === 3) {
    hexValue = hexValue
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexValue);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 255, g: 0, b: 0 };
}, []);

// ✅ Check if pixel is part of wall
const isWallPixel = useCallback(
  (x: number, y: number) => {
    if (!wallMasks.length) return false;

    const maskX = Math.floor(
      (x * naturalDimensions.width) / displayDimensions.width
    );
    const maskY = Math.floor(
      (y * naturalDimensions.height) / displayDimensions.height
    );

    for (const mask of wallMasks) {
      if (mask.mask_data[maskY] && mask.mask_data[maskY][maskX] === true) {
        return true;
      }
    }
    return false;
  },
  [wallMasks, naturalDimensions, displayDimensions]
);

// ✅ Check if pixel has already been painted
const isPaintedPixel = useCallback(
  (x: number, y: number) => {
    return paintedPixels.has(`${x},${y}`);
  },
  [paintedPixels]
);

// ✅ Check if pixel has already been painted with the same color
const isPaintedWithSameColor = useCallback(
  (x: number, y: number, color: string) => {
    const pixelKey = `${x},${y}`;
    return paintedPixels.has(pixelKey) && paintedPixels.get(pixelKey) === color;
  },
  [paintedPixels]
);

  // Function to capture the painted canvas and convert to downloadable image
  const capturePaintedCanvas = useCallback(() => {
    if (!canvasRef.current) return null;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    try {
      // Create a new canvas with the same dimensions
      const captureCanvas = document.createElement("canvas");
      captureCanvas.width = canvas.width;
      captureCanvas.height = canvas.height;
      const captureCtx = captureCanvas.getContext("2d");
      
      if (!captureCtx) return null;

      // Draw the current canvas content (with all the painting)
      captureCtx.drawImage(canvas, 0, 0);
      
      // Convert to data URL for download
      return captureCanvas.toDataURL("image/png", 0.9);
    } catch (error) {
      console.error("Error capturing canvas:", error);
      return null;
    }
  }, []);

  // 🚀 NEW: Undo last painting action
  const undoLastAction = useCallback(() => {
    if (!canvasRef.current || paintingHistory.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Get the last action
    const lastAction = paintingHistory[paintingHistory.length - 1];
    console.log("Undoing action:", lastAction);
    
    if (lastAction.action === 'paint') {
      // Restore original pixel colors for painted pixels
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      lastAction.pixels.forEach(pixelKey => {
        const [x, y] = pixelKey.split(',').map(Number);
        const idx = y * canvas.width + x;
        const pos = idx * 4;
        
        const originalPixel = lastAction.originalPixelData.get(pixelKey);
        if (originalPixel) {
          data[pos] = originalPixel.r;     // Red
          data[pos + 1] = originalPixel.g; // Green
          data[pos + 2] = originalPixel.b; // Blue
          // Alpha stays the same
        }
      });
      
      ctx.putImageData(imageData, 0, 0);
      
      // Remove the undone pixels from paintedPixels
      setPaintedPixels(prev => {
        const newMap = new Map(prev);
        lastAction.pixels.forEach(pixelKey => {
          newMap.delete(pixelKey);
        });
        return newMap;
      });
      
      // Remove the undone colors from wallColors
      setWallColors(prev => {
        const newColors = { ...prev };
        lastAction.pixels.forEach(pixelKey => {
          delete newColors[pixelKey];
        });
        return newColors;
      });
      
    } else if (lastAction.action === 'clear') {
      // Restore the cleared pixels
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      lastAction.pixels.forEach(pixelKey => {
        const [x, y] = pixelKey.split(',').map(Number);
        const idx = y * canvas.width + x;
        const pos = idx * 4;
        
        const originalPixel = lastAction.originalPixelData.get(pixelKey);
        if (originalPixel) {
          data[pos] = originalPixel.r;     // Red
          data[pos + 1] = originalPixel.g; // Green
          data[pos + 2] = originalPixel.b; // Blue
          // Alpha stays the same
        }
      });
      
      ctx.putImageData(imageData, 0, 0);
      
      // Restore the cleared pixels to paintedPixels
      setPaintedPixels(prev => {
        const newMap = new Map(prev);
        lastAction.pixels.forEach(pixelKey => {
          newMap.set(pixelKey, lastAction.color);
        });
        return newMap;
      });
      
      // Restore the cleared colors to wallColors
      setWallColors(prev => {
        const newColors = { ...prev };
        lastAction.pixels.forEach(pixelKey => {
          newColors[pixelKey] = lastAction.color;
        });
        return newColors;
      });
    }
    
    // Remove the last action from history
    setPaintingHistory(prev => prev.slice(0, -1));
    
    // Update undo button state
    setCanUndo(paintingHistory.length > 1);
    
    console.log("Undo completed successfully");
  }, [paintingHistory, setCanUndo]);

  // 🚀 NEW: Set undo function for parent component
  useEffect(() => {
    if (setUndoFunction) {
      setUndoFunction(() => undoLastAction);
    }
  }, [setUndoFunction, undoLastAction]);

// ✅ Flood fill with blending (opacity paint)

const floodFillCanvas = useCallback(
  (
    startX: number,
    startY: number,
    fillColor: { r: number; g: number; b: number },
    colorHex: string, // Add the hex color string for tracking
    alpha: number = 0.7 // Increased opacity for better color coverage
  ) => {
    if (!canvasRef.current || !originalImageData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get current canvas state
    const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const currentData = currentImageData.data;
    const originalData = originalImageData.data;
    const width = currentImageData.width;
    const height = currentImageData.height;

    const startPos = (startY * width + startX) * 4;
    const startR = currentData[startPos];
    const startG = currentData[startPos + 1];
    const startB = currentData[startPos + 2];

    const tolerance = 40;
    const pixelStack: [number, number][] = [[startX, startY]];
    const visited = new Uint8Array(width * height);
    const newPaintedPixels = new Map<string, string>(); // Track newly painted pixels with their colors

    while (pixelStack.length > 0) {
      const [x, y] = pixelStack.pop()!;

      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      if (!isWallPixel(x, y)) continue;
      
      // Skip if already painted with the SAME color (prevent same-color repainting)
      if (isPaintedWithSameColor(x, y, colorHex)) continue;

      const idx = y * width + x;
      if (visited[idx]) continue;

      const pos = idx * 4;
      const r = currentData[pos];
      const g = currentData[pos + 1];
      const b = currentData[pos + 2];

      // Check if pixel is within tolerance of starting color
      if (
        Math.abs(r - startR) <= tolerance &&
        Math.abs(g - startG) <= tolerance &&
        Math.abs(b - startB) <= tolerance
      ) {
        // 🎨 ENHANCED COLOR WITH 3D LIQUID EFFECT
        const originalR = originalData[pos];
        const originalG = originalData[pos + 1];
        const originalB = originalData[pos + 2];
        
        // Step 1: Make colors brighter (simple multiplication)
        const brightness = 1.2; // 20% brighter
        const brightR = Math.min(255, Math.round(fillColor.r * brightness));
        const brightG = Math.min(255, Math.round(fillColor.g * brightness));
        const brightB = Math.min(255, Math.round(fillColor.b * brightness));
        
        // Step 2: Add simple 3D lighting effect
        const centerX = width / 2;
        const centerY = height / 2;
        const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
        const lightingFactor = 1 + (0.1 * (1 - distanceFromCenter / maxDistance)); // Subtle 3D effect
        
        const lightedR = Math.min(255, Math.round(brightR * lightingFactor));
        const lightedG = Math.min(255, Math.round(brightG * lightingFactor));
        const lightedB = Math.min(255, Math.round(brightB * lightingFactor));
        
        // Step 3: Apply with original alpha blending (unchanged)
        currentData[pos]     = Math.round(originalR * (1 - alpha) + lightedR * alpha);
        currentData[pos + 1] = Math.round(originalG * (1 - alpha) + lightedG * alpha);
        currentData[pos + 2] = Math.round(originalB * (1 - alpha) + lightedB * alpha);
        
        // Step 4: Add liquid-like gloss effect (very subtle)
        const glossIntensity = 0.05; // Very subtle gloss
        const glossFactor = 1 + (glossIntensity * (1 - distanceFromCenter / maxDistance));
        
        // Apply gloss only to the final blended color
        currentData[pos]     = Math.min(255, Math.round(currentData[pos] * glossFactor));
        currentData[pos + 1] = Math.min(255, Math.round(currentData[pos + 1] * glossFactor));
        currentData[pos + 2] = Math.min(255, Math.round(currentData[pos + 2] * glossFactor));

        visited[idx] = 1;
        newPaintedPixels.set(`${x},${y}`, colorHex); // Mark this pixel as painted with this color

        // Push neighbors
        pixelStack.push([x + 1, y]);
        pixelStack.push([x - 1, y]);
        pixelStack.push([x, y + 1]);
        pixelStack.push([x, y - 1]);
      }
    }

    ctx.putImageData(currentImageData, 0, 0);

    // Update painted pixels state with newly painted pixels
    if (newPaintedPixels.size > 0) {
      setPaintedPixels(prev => {
        const newMap = new Map(prev);
        newPaintedPixels.forEach((color, pixel) => {
          newMap.set(pixel, color);
        });
        return newMap;
      });
      
      // 🚀 NEW: Record painting action in history for undo functionality
      const actionId = `paint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const originalPixelData = new Map<string, { r: number; g: number; b: number }>();
      
      // Capture original pixel colors before painting
      newPaintedPixels.forEach((color, pixelKey) => {
        const [x, y] = pixelKey.split(',').map(Number);
        const idx = y * currentImageData.width + x;
        const pos = idx * 4;
        
        // Get original colors from the original image data
        if (originalImageData) {
          const origPos = pos;
          originalPixelData.set(pixelKey, {
            r: originalImageData.data[origPos],
            g: originalImageData.data[origPos + 1],
            b: originalImageData.data[origPos + 2]
          });
        }
      });
      
      const newAction = {
        id: actionId,
        timestamp: Date.now(),
        action: 'paint' as const,
        pixels: new Set(newPaintedPixels.keys()),
        color: colorHex,
        originalPixelData: originalPixelData
      };
      
      setPaintingHistory(prev => [...prev, newAction]);
      setCanUndo(true);
      
      // Update downloadable image with the newly painted canvas
      const updatedImageData = capturePaintedCanvas();
      if (updatedImageData) {
        setDownloadableImage(updatedImageData);
        
        // Update cache with current painting state
        if (image?.src) {
          const imageKey = image.src;
          setProcessedImagesCache(prev => {
            const currentCache = prev.get(imageKey);
            if (currentCache) {
              const updatedCache = { 
                ...currentCache, 
                paintedPixels: new Map([...Array.from(paintedPixels), ...Array.from(newPaintedPixels)]),
                wallColors: { ...wallColors },
                downloadableImage: updatedImageData
              };
              return new Map(prev).set(imageKey, updatedCache);
            }
            return prev;
          });
        }
        
        // 🚀 NEW: Save state to parent component for persistence
        if (image?.src && saveSegmentedImageState) {
          const stateToSave = {
            imageSrc: image.src,
            wallMasks: wallMasks,
            naturalDimensions: naturalDimensions,
            paintedPixels: new Map([...Array.from(paintedPixels), ...Array.from(newPaintedPixels)]),
            wallColors: { ...wallColors },
            originalImageData: originalImageData,
            downloadableImage: updatedImageData,
            isProcessed: true
          };
          saveSegmentedImageState(stateToSave);
        }
      }
    }
  },
  [isWallPixel, isPaintedWithSameColor, setPaintedPixels, originalImageData, capturePaintedCanvas, setDownloadableImage, image?.src, wallColors, saveSegmentedImageState, wallMasks, naturalDimensions, paintedPixels]);


// ✅ Handle user click → apply transparent paint
const handleClick = useCallback(
  (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || wallMasks.length === 0) return;
    if (!selectedColor || selectedColor === "") return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const x = Math.round((clickX * canvas.width) / rect.width);
    const y = Math.round((clickY * canvas.height) / rect.height);

    if (isWallPixel(x, y)) {
      // Check if this area is already painted with the SAME color
      if (isPaintedWithSameColor(x, y, selectedColor)) {
        // Optional: Show a message that this area is already painted with this color
        console.log("This area is already painted with this color!");
        return;
      }

      const rgbColor = hexToRgb(selectedColor);

      // 👇 opacity here controls how "transparent" the paint looks
      const opacity = 0.6; // Increased for better color coverage and complete replacement

      floodFillCanvas(x, y, rgbColor, selectedColor, opacity);
    }
  },
  [wallMasks, selectedColor, isWallPixel, isPaintedWithSameColor, floodFillCanvas, hexToRgb]
);


  // Create a separate canvas ref for the zoom overlay (unchanged)
  const zoomCanvasRef = useRef<HTMLCanvasElement>(null);

  // Function to update zoom canvas with current canvas content
  const updateZoomCanvas = useCallback(() => {
    console.log('updateZoomCanvas called');
    if (!zoomCanvasRef.current || !canvasRef.current) {
      console.log('Missing refs:', { zoomCanvas: !!zoomCanvasRef.current, mainCanvas: !!canvasRef.current });
      return;
    }
    
    const zoomCanvas = zoomCanvasRef.current;
    const mainCanvas = canvasRef.current;
    const zoomCtx = zoomCanvas.getContext('2d');
    const mainCtx = mainCanvas.getContext('2d');
    
    if (!zoomCtx || !mainCtx) {
      console.log('Missing contexts:', { zoomCtx: !!zoomCtx, mainCtx: !!mainCtx });
      return;
    }
    
    // Set zoom canvas dimensions
    zoomCanvas.width = displayDimensions.width * ZOOM_LEVEL;
    zoomCanvas.height = displayDimensions.height * ZOOM_LEVEL;
    
    console.log('Drawing main canvas to zoom canvas:', {
      mainCanvasSize: { width: mainCanvas.width, height: mainCanvas.height },
      zoomCanvasSize: { width: zoomCanvas.width, height: zoomCanvas.height }
    });
    
    // Draw the current main canvas content (with colors) to the zoom canvas
    zoomCtx.imageSmoothingEnabled = false; // Disable smoothing for pixel-perfect zoom
    zoomCtx.drawImage(mainCanvas, 0, 0, zoomCanvas.width, zoomCanvas.height);
    console.log('Zoom canvas updated successfully');
  }, [displayDimensions, ZOOM_LEVEL]);

  // Add zoom-related handlers (fixed positioning)
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // 🟢 SAFE: Use appropriate zoom size for mobile vs desktop
      const currentZoomSize = isMobile ? 80 : ZOOM_SIZE;
      
      // Calculate zoom window position relative to the container
      let zoomX = x - currentZoomSize / 2;
      let zoomY = y - currentZoomSize / 2;
      
      // Keep zoom window within canvas bounds
      zoomX = Math.max(0, Math.min(zoomX, rect.width - currentZoomSize));
      zoomY = Math.max(0, Math.min(zoomY, rect.height - currentZoomSize));
      
      setMousePosition({ x, y });
      setZoomPosition({ x: zoomX, y: zoomY });
      
      // Update zoom canvas every time mouse moves to ensure current state is shown
      if (showZoom && !isMobile) {
        console.log('Mouse move with zoom visible, updating zoom canvas...');
        // Use setTimeout to ensure this runs after the current render cycle
        setTimeout(() => {
          updateZoomCanvas();
        }, 0);
      }
    },
    [isMobile, showZoom, updateZoomCanvas]
  );

  // Update zoom canvas when colors change or zoom is shown
  useEffect(() => {
    if (showZoom && !isMobile) {
      updateZoomCanvas();
    }
  }, [showZoom, isMobile, updateZoomCanvas]);

  // Update zoom canvas when wallColors change (colors are applied)
  useEffect(() => {
    if (showZoom && !isMobile) {
      updateZoomCanvas();
    }
  }, [wallColors, showZoom, isMobile, updateZoomCanvas]);

  // Update downloadable image whenever painting changes
  useEffect(() => {
    if (paintedPixels.size > 0) {
      const imageData = capturePaintedCanvas();
      if (imageData) {
        setDownloadableImage(imageData);
        
        // Update cache with current painting state
        if (image?.src) {
          const imageKey = image.src;
          setProcessedImagesCache(prev => {
            const currentCache = prev.get(imageKey);
            if (currentCache) {
              const updatedCache = { 
                ...currentCache, 
                paintedPixels: new Map(paintedPixels),
                wallColors: { ...wallColors },
                downloadableImage: imageData
              };
              return new Map(prev).set(imageKey, updatedCache);
            }
            return prev;
          });
        }
        
        // 🚀 NEW: Save state to parent component for persistence
        if (image?.src && saveSegmentedImageState) {
          const stateToSave = {
            imageSrc: image.src,
            wallMasks: wallMasks,
            naturalDimensions: naturalDimensions,
            paintedPixels: new Map(paintedPixels),
            wallColors: { ...wallColors },
            originalImageData: originalImageData,
            downloadableImage: imageData,
            isProcessed: true
          };
          saveSegmentedImageState(stateToSave);
        }
      }
    }
  }, [paintedPixels, capturePaintedCanvas, setDownloadableImage, image?.src, wallColors, saveSegmentedImageState, wallMasks, naturalDimensions, originalImageData]);

  return (
    <div
      ref={containerRef}
      className="d-flex justify-content-center align-items-center p-0"
      style={{
        width: "100%",
        height: isMobile ? "auto" : `${MAX_DESKTOP_HEIGHT}px`,
      }}
    >
      {/* 🟢 SAFE: Mobile-specific CSS for better touch experience */}
      <style jsx>{`
        @media (max-width: 768px) {
          canvas {
            touch-action: none !important;
            -webkit-touch-callout: none !important;
            -webkit-user-select: none !important;
            -khtml-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
          }
          
          /* Ensure smooth touch scrolling is disabled on canvas */
          .position-relative {
            -webkit-overflow-scrolling: touch;
          }
          
          /* 🟢 SAFE: Mobile magnifier optimizations */
          [style*="width: 80px"] {
            transition: all 0.1s ease !important;
            transform-origin: center !important;
          }
        }
        
        /* 🟢 SAFE: Prevent text selection on mobile */
        @media (pointer: coarse) {
          * {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }
        }
      `}</style>
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
          onMouseEnter={() => !isMobile && setShowZoom(true)} // 🟢 SAFE: Disable magnifier on mobile
          onMouseLeave={() => !isMobile && setShowZoom(false)} // 🟢 SAFE: Disable magnifier on mobile
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
        {showZoom && !isMobile && (
          <div
            style={{
              position: "absolute",
              left: `${zoomPosition.x}px`,
              top: `${zoomPosition.y}px`,
              width: isMobile ? "80px" : `${ZOOM_SIZE}px`, // 🟢 SAFE: Smaller magnifier on mobile
              height: isMobile ? "80px" : `${ZOOM_SIZE}px`, // 🟢 SAFE: Thinner border on mobile
              border: isMobile ? "2px solid #fff" : "3px solid #fff", // 🟢 SAFE: Thinner border on mobile
              boxShadow: isMobile ? "0 0 8px rgba(0,0,0,0.3)" : "0 0 15px rgba(0,0,0,0.5)", // 🟢 SAFE: Softer shadow on mobile
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
                  -mousePosition.x * ZOOM_LEVEL + (isMobile ? 40 : ZOOM_SIZE / 2)
                }px, ${-mousePosition.y * ZOOM_LEVEL + (isMobile ? 40 : ZOOM_SIZE / 2)}px)`,
              }}
            >
              {/* Use canvas instead of Image to show current state with colors */}
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