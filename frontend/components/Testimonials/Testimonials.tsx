import styles from "./Testimonial.module.css";
import React, { useEffect, useRef, useState } from "react";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

// Styled heading for the testimonials section
const StyledTypography = styled(Typography)(({ theme }) => ({
  color: "#323232",
  fontSize: "1.8rem",
  fontWeight: "bold",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  textAlign: "center",
  padding: theme.spacing(2),
  background: "linear-gradient(45deg, #719E37, #F7F7F9)",
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  margin: "2rem auto",
}));

const TESTIMONIAL_DELAY = 5000; // 5-second delay for auto-slide

const Testimonial = ({ testimonialData }: any) => {
  const [index, setIndex] = useState<number>(0);
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    const nextSlide = () =>
      setIndex((prevIndex) =>
        prevIndex === testimonialData.length - 1 ? 0 : prevIndex + 1
      );

    timeoutRef.current = setTimeout(nextSlide, TESTIMONIAL_DELAY);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [index, testimonialData.length]);

  return (
    <div className={styles.testimonialSection}>
      <StyledTypography variant="h4">Testimonials</StyledTypography>

      <div className={styles.carousel}>
        <div
          className={styles.carouselInner}
          style={{ transform: `translateX(-${index * 105}%)` }} // Slide effect
        >
          {testimonialData.map((testimonial: any, i: number) => (
            <div className={`${styles.testimonialCard}`} key={i}>
              <p className={styles.testimonialText}>{testimonial.testimonial}</p>
              <h5 className={styles.testimonialAuthor}>~ {testimonial.author}</h5>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Dots */}
      <div className={styles.dotContainer}>
        {testimonialData.map((_: any, i: number) => (
          <span
            key={i}
            className={`${styles.dot} ${i === index ? styles.activeDot : ""}`}
            onClick={() => setIndex(i)} // Allow manual selection of slides
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(Testimonial);
