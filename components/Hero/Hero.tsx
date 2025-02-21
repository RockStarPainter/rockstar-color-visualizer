import React, { RefObject } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import styles from "./hero.module.css";

interface HeroProps {
  topRef: RefObject<HTMLDivElement>;
}

const Hero: React.FC<HeroProps> = ({ topRef }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2 },
    },
  };

  const videoVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 3,
        ease: "easeInOut",
        repeat: Infinity,
      },
    },
  };

  return (
    <div ref={topRef} className={styles.heroContainer}>
      {/* Video section */}
      <motion.div
        className={styles.videoWrapper}
        variants={videoVariants}
        animate="animate"
      >
        <motion.video
          className="rounded-lg"
          autoPlay
          loop
          muted
          playsInline
          controls={false}
        >
          <source src="/videos/hero-section-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </motion.video>
      </motion.div>

      {/* Text section */}
      <motion.div
        className={styles.textWrapper}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.h2 className={styles.title} variants={itemVariants}>

        <span className="font-petit" style={{ color: "#ffc022" }}>
        WELCOME TO{" "}
          </span>
          
          <span className="font-petit" style={{ color: "#059f41" }}>
            <span style={{ color: "#d20609" }}>Rock</span>
            star{" "}
          </span>
          <span className="font-petit p-1 rounded" style={{ color:'#022e97' }}>
            Color Visualiser
          </span>
          {/* <span className="font-petit" style={{ color: "#022e97" }}>
            Visualiser
          </span> */}
        </motion.h2>
        <motion.p
          className="text-gray-600 leading-relaxed"
          variants={itemVariants}
        >
          Best Painting Services in Denver | Painting Contractors in Denver
        </motion.p>
        <motion.p className="text-gray-600 mt-2" variants={itemVariants}>
          Discover our range of painting services Denver, from residential to
          commercial, where we turn your vision into reality. With attention to
          detail and skilled professionals, we bring vibrant energy to every
          space.
        </motion.p>
        <motion.div className="mt-8" variants={itemVariants}>
          <Link href="/colorvisualiser">
            <button className={styles.button}>COLOR VISUALISER</button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Hero;
