import React from "react";
import styles from "../styles/FeatureHighlights.module.css";

function FeatureCard({ icon, title, description }: any) {
  return (
    <div className={`${styles.step} border shadow-sm rounded-3`}>
      {icon}
      {/* Using SVG as a component */}
      <h3 className={styles.stepTitle}>{title}</h3>
      <p className={styles.stepDescription}>{description}</p>
    </div>
  );
}

export default FeatureCard;
