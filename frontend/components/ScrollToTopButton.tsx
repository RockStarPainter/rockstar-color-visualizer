import React, { useEffect, useState } from "react";

const ScrollToTopButton = ({
  threshold = 300,
  style = {},
  className = "",
}: {
  threshold?: number;
  style?: React.CSSProperties;
  className?: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Monitor scroll position to toggle button visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  // Scroll to top functionality
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      style={{
        position: "fixed",
        bottom: "50px",
        right: "50px",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "50%",
        padding: "7px 15px",
        fontSize: "20px",
        cursor: "pointer",
        boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
        zIndex: 1000,
        ...style,
      }}
      className={className}
    >
      ↑
    </button>
  );
};

export default ScrollToTopButton;
