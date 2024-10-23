import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faRobot, faPalette, faEye, faArrowsAlt, faFillDrip } from "@fortawesome/free-solid-svg-icons";
import styles from "../styles/FeatureHighlights.module.css";
import EasyToUseIcon from "../public/images/easy-to-use.svg"; 
import Ai from "../public/images/ai-powered.svg"; 
import Paint from "../public/images/paint-palette.svg"; 
import Interactive from "../public/images/interactive-display.svg"; 
import Customize from "../public/images/customizable-orders.svg"; 
import Eye from "../public/images/real-time-analytics.svg"; 

const FeatureHighlights = () => {
  return (
    <section className={styles.featureHighlightsSection}>
      <h2 className={styles.sectionTitle} style={{color:"#022e97"}}>Key Features</h2>
      <div className={styles.stepsContainer}>
        {/* Step 1 - Easy-to-use */}
        <div className={styles.step}>
          <EasyToUseIcon className={styles.icon} />  {/* Using SVG as a component */}
          <h3 className={styles.stepTitle}>Easy-to-use</h3>
          <p className={styles.stepDescription}>
            Intuitive design makes it simple to upload images and choose colors.
          </p>
        </div>

        {/* Step 2 - AI-powered */}
        <div className={styles.step}>
        <Ai className={styles.icon} /> 
          <h3 className={styles.stepTitle}>AI-powered</h3>
          <p className={styles.stepDescription}>
            Our AI automatically detects surfaces for accurate color visualization.
          </p>
        </div>

        {/* Step 3 - Multiple Color Schemes */}
        <div className={styles.step}>
        <Paint className={styles.icon} />
          <h3 className={styles.stepTitle}>Multiple Color Schemes</h3>
          <p className={styles.stepDescription}>
            Compare different color palettes instantly.
          </p>
        </div>

        {/* Step 4 - Real-time Preview */}
        <div className={styles.step}>
          <Eye className={styles.icon} />
          <h3 className={styles.stepTitle}>Real-time Preview</h3>
          <p className={styles.stepDescription}>
            See the changes in real-time as you apply colors.
          </p>
        </div>

        {/* Step 5 - Interactive Visualization */}
        <div className={styles.step}>
        <Interactive className={styles.icon} />
          <h3 className={styles.stepTitle}>Interactive Visualization</h3>
          <p className={styles.stepDescription}>
            Click and drag to customize colors on different surfaces.
          </p>
        </div>

        {/* Step 6 - Customizable Themes */}
<div className={styles.step}>
  <Customize className={styles.icon} /> {/* Use your own SVG or component for the icon */}
  <h3 className={styles.stepTitle}>Customizable Themes</h3>
  <p className={styles.stepDescription}>
    Apply various themes and styles to instantly transform the look and feel of your space.
  </p>
</div>

       
      </div>
    </section>
  );
};

export default FeatureHighlights;
