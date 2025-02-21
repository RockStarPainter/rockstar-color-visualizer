import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faPalette,
  faEye,
  faVolumeMute,
  faVolumeUp,
  faPlay,
  faPause,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../styles/HowItWorks.module.css"; // Custom styles

const VIDEOS = {
  // DESKTOP: "/videos/user-manual-desktop.mp4",
  DESKTOP: "",
  MOBILE: "/videos/user-manual-mobile.mp4",
} as const;

const BREAKPOINT = 768; // Mobile breakpoint in pixels

type VideoPath = (typeof VIDEOS)[keyof typeof VIDEOS];

const HowItWorks = () => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoSrc, setVideoSrc] = useState<VideoPath>(VIDEOS.DESKTOP);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Initial check
    handleResize();

    // Add resize listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleResize = () => {
    if (window.innerWidth <= BREAKPOINT) {
      setVideoSrc(VIDEOS.MOBILE);
    } else {
      setVideoSrc(VIDEOS.DESKTOP);
    }
  };

  const togglePlayPause = (e: React.MouseEvent) => {
    // Prevent toggling if clicking the mute button
    if ((e.target as Element).closest(`.${styles.muteButton}`)) {
      return;
    }

    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section className={styles.howItWorksSection}>
      <h2 className={styles.sectionTitle} style={{ color: "#022e97" }}>
        How It Works
      </h2>
      <div className={styles.stepsContainer}>
        {/* Step 1 - Upload Image */}
        <div className={styles.step}>
          <FontAwesomeIcon
            icon={faUpload}
            className={styles.icon}
            style={{ color: "#ffc022" }}
          />
          <h3 className={styles.stepTitle} style={{ color: "#ffc022" }}>
            Upload Image
          </h3>
          <p className={styles.stepDescription}>
            Start by uploading an image of your home or space.
          </p>
        </div>

        {/* Step 2 - Choose Colors */}
        <div className={styles.step}>
          <FontAwesomeIcon
            icon={faPalette}
            className={styles.icon}
            style={{ color: "#d20609" }}
          />
          <h3 className={styles.stepTitle} style={{ color: "#d20609" }}>
            Choose Colors
          </h3>
          <p className={styles.stepDescription}>
            Pick from a wide variety of colors to visualize.
          </p>
        </div>

        {/* Step 3 - Visualize Results */}
        <div className={styles.step}>
          <FontAwesomeIcon icon={faEye} className={styles.icon} />
          <h3 className={styles.stepTitle} style={{ color: "#059f41" }}>
            Visualize Results
          </h3>
          <p className={styles.stepDescription}>
            See how your selected colors transform your space in real time.
          </p>
        </div>
      </div>

      {/* Video Section */}
      {videoSrc && (
        <div className={styles.videoSection}>
          <h3 className={styles.sectionTitle}>Watch How to Use Our Tool</h3>
          <div className={styles.videoWrapper} onClick={togglePlayPause}>
            <button
              className={styles.muteButton}
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              <FontAwesomeIcon
                icon={isMuted ? faVolumeMute : faVolumeUp}
                className={styles.muteIcon}
              />
            </button>

            {/* Show play icon only when video is paused */}
            {!isPlaying && (
              <div className={styles.playPauseButton}>
                <FontAwesomeIcon icon={faPlay} className={styles.playIcon} />
              </div>
            )}

            <video
              ref={videoRef}
              key={videoSrc}
              className={styles.video}
              src={videoSrc}
              autoPlay
              loop
              playsInline
              muted={isMuted}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default HowItWorks;
