import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faRobot,
  faPalette,
  faEye,
  faArrowsAlt,
  faFillDrip,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../styles/FeatureHighlights.module.css";
import EasyToUseIcon from "../public/images/easy-to-use.svg";
import Ai from "../public/images/ai-powered.svg";
import Paint from "../public/images/paint-palette.svg";
import Interactive from "../public/images/interactive-display.svg";
import Customize from "../public/images/customizable-orders.svg";
import Eye from "../public/images/real-time-analytics.svg";
import FeatureCard from "../components/FeatureCard";

const featureCards = [
  {
    icon: <EasyToUseIcon className={styles.icon} />,
    title: "Easy-to-use",
    description:
      "Intuitive design makes it simple to upload images and choose colors.",
  },
  {
    icon: <Ai className={styles.icon} />,
    title: "AI-powered",
    description:
      "Our AI automatically detects surfaces for accurate color visualization.",
  },
  {
    icon: <Paint className={styles.icon} />,
    title: "Multiple Color Schemes",
    description: "Compare different color palettes instantly.",
  },
  {
    icon: <Eye className={styles.icon} />,
    title: "Real-time Preview",
    description: "See the changes in real-time as you apply colors.",
  },
  {
    icon: <Interactive className={styles.icon} />,
    title: "Interactive Visualization",
    description: "Click and drag to customize colors on different surfaces.",
  },
  {
    icon: <Customize className={styles.icon} />,
    title: "Customizable Themes",
    description:
      "Apply various themes and styles to instantly transform the look and feel of your space.",
  },
];

const FeatureHighlights = () => {
  return (
    <section className={styles.featureHighlightsSection}>
      <h2 className={styles.sectionTitle} style={{ color: "#022e97" }}>
        Key Features
      </h2>
      <div className={`${styles.stepsContainer} px-5`}>
        {featureCards.map((card, index) => (
          <div
            key={index}
            className={`${styles.step} border shadow-sm rounded-3`}
          >
            {card.icon}
            <h3 className={styles.stepTitle}>{card.title}</h3>
            <p className={styles.stepDescription}>{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeatureHighlights;
