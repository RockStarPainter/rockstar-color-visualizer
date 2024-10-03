import React, { createContext, useContext, useState } from "react";

// Define the type for the context state
interface ColorContextType {
  selectedColors: any[];
  addColor: (color: any) => void;
  removeColor: (colorCode: string) => void;
  clearColors: () => void;
}

// Create the context with default values
const ColorContext = createContext<ColorContextType | undefined>(undefined);

// Context provider component
export const ColorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedColors, setSelectedColors] = useState<any[]>([]);

  // Function to add a new color
  const addColor = (color: any) => {
    setSelectedColors((prevColors) =>
      prevColors.some((p) => p.code === color.code)
        ? prevColors
        : [...prevColors, color]
    );
  };

  // Function to remove a color
  const removeColor = (colorCode: string) => {
    setSelectedColors((prevColors) =>
      prevColors.filter((p) => p.code !== colorCode)
    );
  };

  // Function to clear all colors
  const clearColors = () => {
    setSelectedColors([]);
  };

  return (
    <ColorContext.Provider
      value={{ selectedColors, addColor, removeColor, clearColors }}
    >
      {children}
    </ColorContext.Provider>
  );
};

// Custom hook to use the ColorContext
export const useColorContext = () => {
  const context = useContext(ColorContext);
  if (context === undefined) {
    throw new Error("useColorContext must be used within a ColorProvider");
  }
  return context;
};
