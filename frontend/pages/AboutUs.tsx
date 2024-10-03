"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import styles from "../styles/About.module.css";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Image from "next/image";

// Styled Typography for section headings
const SectionTitle = styled(Typography)(({ theme }) => ({
  color: "#323232",
  fontSize: "2rem",
  fontWeight: "bold",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  textAlign: "center",
  marginBottom: theme.spacing(4),
  padding: theme.spacing(1.5),
  background: "linear-gradient(45deg, #719E37, #F7F7F9)",
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
}));

const AboutUs: React.FC = () => {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setInView(entry.isIntersecting);
      },
      {
        threshold: 0.1, // Trigger when 10% of the component is in view
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <SectionTitle variant="h2">About Us</SectionTitle>
      <div className={styles.container}>
        {/* Text Section */}
        <motion.div
          className={styles.textSection}
          initial={{ x: -100, opacity: 0 }}
          animate={inView ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 0.5 }} // Faster transition
        >
          {/* First Heading and Paragraph */}
          <h2 className={styles.heading}>Our Vision:</h2>
          <motion.p
            className={styles.paragraph}
            initial={{ x: -100, opacity: 0 }}
            animate={inView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }} // Faster transition and reduced delay
          >
            To elevate and enhance every space we touch, bringing beauty and
            inspiration to homes and communities, one expertly crafted project
            at a time.
          </motion.p>

          {/* Second Heading and Paragraph */}
          <h2 className={styles.heading}>Who We Are:</h2>
          <motion.p
            className={styles.paragraph}
            initial={{ x: -100, opacity: 0 }}
            animate={inView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }} // Faster transition and reduced delay
          >
            Rockstar Painting is a Denver-based painting company known for our
            attention to detail, commitment to quality, and exceptional customer
            service. With years of experience in stucco and exterior painting,
            we’ve helped countless homeowners bring their visions to life. Now,
            with our AI-powered Color Visualizer, we’re taking home
            transformations to the next level, giving you the power to
            experiment with colors before you even pick up a paintbrush.Also
            Attach website link to redirect people to website
          </motion.p>

          {/* Third Heading and Paragraph */}
          <h2 className={styles.heading}>Our Heritage:</h2>
          <motion.p
            className={styles.paragraph}
            initial={{ x: -100, opacity: 0 }}
            animate={inView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }} // Faster transition and reduced delay
          >
            Rooted in craftsmanship, Rockstar Painting Denver has built a
            reputation for reliability and excellence, consistently enhancing
            the beauty of Denver properties for years.
          </motion.p>
        </motion.div>

        {/* Video Section */}
        <div className={styles.videoSection}>
          <video autoPlay loop muted playsInline className={styles.video}>
            <source src="/videos/about-us-rockstar.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
