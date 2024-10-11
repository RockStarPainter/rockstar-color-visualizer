import React from "react";

// Custom ErrorMessage component
const ErrorMessage = ({ error }: any) => {
  if (!error) {
    return null;
  }

  return (
    <p
      className="text-danger"
      style={{ fontSize: "0.875rem", marginTop: "5px" }}
    >
      {error.message}
    </p>
  );
};

export default ErrorMessage;
