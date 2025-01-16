import React from "react";

const FullScreenSpinner = () => {
  return (
    <div style={overlayStyles}>
      <div
        className="spinner-border text-primary"
        role="status"
        style={spinnerStyles}
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

const overlayStyles = {
  position: "fixed" as "fixed", // Position fixed to cover the whole screen
  top: 0,
  left: 0,
  width: "100vw", // Full width
  height: "100vh", // Full height
  backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent black background
  display: "flex",
  justifyContent: "center",
  alignItems: "center", // Center the spinner
  zIndex: 9999, // Make sure the overlay is on top of other content
};

const spinnerStyles = {
  width: "3rem",
  height: "3rem",
};

export default FullScreenSpinner;
