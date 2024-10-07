"use client";
import React, { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  FaPhone,
  FaEnvelope,
  FaClock,
  FaMapMarkerAlt,
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaPinterest,
  FaPalette,
} from "react-icons/fa"; // Added FaPalette for Color Visualizer
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons"; // Removed faInfoCircle and faCog
import styles from "./Footer.module.css";

const Footer = () => {
  const year = new Date().getFullYear();
  const controls = useAnimation();
  const footerRef = useRef(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.2,
        when: "beforeChildren",
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          controls.start("visible");
        }
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, [controls]);

  return (
    <>
    <motion.footer
      ref={footerRef}
      initial="hidden"
      animate={controls}
      variants={containerVariants}
      className={`${styles.footer} bg-black/25`}
    >
      <div className={styles.container}>
        {/* Left Section: Logo */}
        <motion.div variants={itemVariants} className={styles.logo} style={{ display: "flex", flexDirection: "column" }}>
          <Link href="/">
            <Image
              src="/images/rockstar-logo.png"
              alt="Logo"
              width={192}
              height={64}
              className={styles.image}
              quality={100}
            />
          </Link>
          
        </motion.div>

        {/* Center Section: Features */}
        <motion.div variants={itemVariants} className={styles.features}>
          <h3 className={styles.heading}>Features</h3>
          <Link href="/" style={{ textDecoration: "none" }}>
            <p className={styles.link}>
              <FontAwesomeIcon icon={faHome} className={styles.icon} /> Home
            </p>
          </Link>
          <Link href="/contact" style={{ textDecoration: "none" }}>
            <p className={styles.link}>
              <FaEnvelope className={styles.icon} /> Contact Us
            </p>
          </Link>
          <Link href="/colorvisualiser" style={{ textDecoration: "none" }}>
            <p className={styles.link}>
              <FaPalette className={styles.icon} /> Color Visualizer
            </p>
          </Link>
        </motion.div>

        {/* Right Section: Contact Us */}
        <motion.div variants={itemVariants} className={styles.contact}>
          <h3 className={styles.heading}>Contact Us</h3>
          <div className={styles.contactItem}>
            <FaPhone className={styles.icon} />
            <a href="tel:+18134269257"> (720) 771-5791</a>
          </div>
          <div className={styles.contactItem}>
            <FaEnvelope className={styles.icon} />
            <a href="mailto:example@example.com">rockstarpainting33@gmail.com</a>
          </div>
          <div className={styles.contactItem}>
            <FaClock className={styles.icon} />
            <span>Mon to Sat (8AM - 7PM)</span>
          </div>
          <div className={styles.contactItem}>
            <FaClock className={styles.icon} />
            <span>Sunday Off</span>
          </div>
          <div className={styles.contactItem}>
            <FaMapMarkerAlt className={styles.icon} />
            <span>Denver, CO 80247</span>
          </div>

          <div className={styles.socialIcons}>
            <a
              href="https://www.facebook.com/rockstarpaintingco/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://www.instagram.com/rockstarpaint/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram />
            </a>
            <a
              href="https://www.tiktok.com/@rockstarpainting?lang=en"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTiktok />
            </a>
            <a
              href="https://www.youtube.com/@RockstarPaintingDenver0"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaYoutube />
            </a>
            <a
              href="https://www.pinterest.com/rockstarpainting33/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaPinterest />
            </a>
          </div>
        </motion.div>
      </div>

      <div className={styles.footerBottom}>
        <motion.div
          className={styles.footerAnimation}
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          <video src="/videos/paint-footer.mp4" width="70px" height="70px" autoPlay loop muted />
        </motion.div>
      </div>

      <div className={styles.footerInfo}>
        <p className={styles.company}>Rockstar Painting</p>
        <Image
         
            src="/images/rockstar-footer-image.png"
            alt="Second Logo"
            width={100}
            height={64}
            className={` `}
            quality={100}
          />
        <p className={styles.copyright}>Copyright {year}</p>
      </div>
    </motion.footer>
    </>
  );
};

export default Footer;
