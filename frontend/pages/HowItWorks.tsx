import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faPalette, faEye } from "@fortawesome/free-solid-svg-icons";
import styles from "../styles/HowItWorks.module.css"; // Custom styles

const HowItWorks = () => {
  return (
    <section className={styles.howItWorksSection}>
      <h2 className={styles.sectionTitle}>How It Works</h2>
      <div className={styles.stepsContainer}>
        {/* Step 1 - Upload Image */}
        <div className={styles.step}>
          <FontAwesomeIcon icon={faUpload} className={styles.icon} />
          <h3 className={styles.stepTitle}>Upload Image</h3>
          <p className={styles.stepDescription}>
            Start by uploading an image of your home or space.
          </p>
        </div>

        {/* Step 2 - Choose Colors */}
        <div className={styles.step}>
          <FontAwesomeIcon icon={faPalette} className={styles.icon} />
          <h3 className={styles.stepTitle}>Choose Colors</h3>
          <p className={styles.stepDescription}>
            Pick from a wide variety of colors to visualize.
          </p>
        </div>

        {/* Step 3 - Visualize Results */}
        <div className={styles.step}>
          <FontAwesomeIcon icon={faEye} className={styles.icon} />
          <h3 className={styles.stepTitle}>Visualize Results</h3>
          <p className={styles.stepDescription}>
            See how your selected colors transform your space in real time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
