import React, { useContext, useState, useRef, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import AppContext from "../../utils/hooks/createContext";
import Loading from "../../components/Loading/Loading";

const ImageMaskComponent = ({
  selectedColor,
  clearMasksSignal,
  setDownloadableImage,
}: any) => {
  const {
    image: [image],
    texture: [texture, setTexture],
    color: [color, setColor],
  } = useContext(AppContext)!;

  const [segments, setSegments] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState({ x: 1, y: 1 });
  const [naturalDimensions, setNaturalDimensions] = useState({
    width: 0,
    height: 0,
  });

  const DISPLAY_WIDTH = 800;
  const DISPLAY_HEIGHT = 550;

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
        setScale({
          x: naturalDimensions.width / DISPLAY_WIDTH,
          y: naturalDimensions.height / DISPLAY_HEIGHT,
        });
      };

      updateScale();
      window.addEventListener("resize", updateScale);
      return () => window.removeEventListener("resize", updateScale);
    }
  }, [naturalDimensions]);

  useEffect(() => {
    if (clearMasksSignal) {
      setSegments([]);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [clearMasksSignal]);

  const convertSrcToFile = async (src: string, fileName = "image.jpg") => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      return new File([blob], fileName, { type: blob.type });
    } catch (error) {
      console.error("Error converting src to file:", error);
      throw error;
    }
  };

  const adjustColorOpacity = (color: string, opacity: number) => {
    if (color.startsWith("#")) {
      const hex = color.replace("#", "");
      const bigint = parseInt(hex, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
  };

  const exportImage = async () => {
    if (!canvasRef.current || !image?.src) return;

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");

    tempCanvas.width = naturalDimensions.width;
    tempCanvas.height = naturalDimensions.height;

    const baseImage = document.createElement("img");
    baseImage.src = image.src;

    await new Promise((resolve) => {
      baseImage.onload = () => {
        if (!tempCtx) return;
        tempCtx.drawImage(baseImage, 0, 0, tempCanvas.width, tempCanvas.height);

        if (canvasRef.current) {
          tempCtx.drawImage(canvasRef.current, 0, 0);
        }

        const combinedImageData = tempCanvas.toDataURL("image/png");
        setDownloadableImage(combinedImageData);
        resolve(null);
      };
    });
  };

  const drawSegmentsOnCanvas = (allSegments: any) => {
    if (!canvasRef.current || !allSegments) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = naturalDimensions.width;
    canvas.height = naturalDimensions.height;

    ctx?.clearRect(0, 0, canvas.width, canvas.height);

    allSegments.forEach(({ segmentData, color }: any) => {
      segmentData.forEach((row: any, y: any) => {
        row.forEach((value: any, x: any) => {
          if (value) {
            ctx!.fillStyle = color;
            ctx!.fillRect(x, y, 1, 1);
          }
        });
      });
    });

    exportImage();
  };

  const handleClick = async (e: any) => {
    if (!image?.src || !imageRef.current) {
      console.error("No image selected or invalid image source.");
      return;
    }

    const rect = imageRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * scale.x);
    const y = Math.floor((e.clientY - rect.top) * scale.y);

    try {
      const file = await convertSrcToFile(image.src, "uploaded-image.jpg");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sample_prediction", "false");
      formData.append("x", x.toString());
      formData.append("y", y.toString());

      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/upload/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { segment: segmentData } = response.data;
      if (segmentData) {
        const colorWithOpacity = adjustColorOpacity(selectedColor, 0.7);
        const newSegment = { segmentData, color: colorWithOpacity };
        const updatedSegments = [...segments, newSegment];
        setSegments(updatedSegments);
        drawSegmentsOnCanvas(updatedSegments);
      } else {
        console.warn("Segment data is null or undefined.");
      }
    } catch (error) {
      console.error("Error fetching mask or segment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ position: "relative", display: "inline-block" }}>
        <Image
          ref={imageRef}
          src={image?.src || ""}
          alt="Interactive Image"
          width={DISPLAY_WIDTH}
          height={DISPLAY_HEIGHT}
          onClick={handleClick}
          style={{ cursor: "pointer", objectFit: "contain" }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none",
            width: `${DISPLAY_WIDTH}px`,
            height: `${DISPLAY_HEIGHT}px`,
          }}
        />
      </div>

      {loading && <Loading message={""} />}
    </>
  );
};

export default ImageMaskComponent;
