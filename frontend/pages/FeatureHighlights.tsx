import React from "react";
import { Container, Row, Col, Carousel } from "react-bootstrap";
import Image from "next/image";
import styles from "../styles/FeatureHighlights.module.css"; // Import CSS

const FeatureHighlights = () => {
  return (
    <section className={styles.featureSection}>
      <Container>
        <Row className={styles.splitScreen}>
          {/* Left Column: Features List */}
          <Col md={6} className={styles.leftCol}>
            <h2 className={styles.featuresTitle}>Key Features</h2>
            <ul className={styles.featuresList}>
              <li>
                <strong>Easy-to-use:</strong> Intuitive design makes it simple to upload images and choose colors.
              </li>
              <li>
                <strong>AI-powered:</strong> Our AI automatically detects surfaces for accurate color visualization.
              </li>
              <li>
                <strong>Multiple Color Schemes:</strong> Compare different color palettes instantly.
              </li>
              <li>
                <strong>Real-time Preview:</strong> See the changes in real-time as you apply colors.
              </li>
              <li>
                <strong>Interactive Visualization:</strong> Click and drag to customize colors on different surfaces.
              </li>
            </ul>
          </Col>

          {/* Right Column: Mockup or Video */}
          <Col md={6} className={styles.rightCol}>
            <video
              className={styles.featureVideo}
              autoPlay
              loop
              muted
              playsInline
              src="/videos/Home Painting.mp4"
            />
          </Col>
        </Row>

        {/* Interactive Color Palette Visualization or Carousel */}
        {/* <div className={styles.paletteSection}>
          <h2 className={styles.paletteTitle}>Color Palette Visualization</h2>
          <Carousel>
            <Carousel.Item>
              <Image
                src="/images/color-option1.png"
                alt="Color Option 1"
                className={styles.carouselImage}
                width={800}
                height={400}
              />
            </Carousel.Item>
            <Carousel.Item>
              <Image
                src="/images/color-option2.png"
                alt="Color Option 2"
                className={styles.carouselImage}
                width={800}
                height={400}
              />
            </Carousel.Item>
            <Carousel.Item>
              <Image
                src="/images/color-option3.png"
                alt="Color Option 3"
                className={styles.carouselImage}
                width={800}
                height={400}
              />
            </Carousel.Item>
          </Carousel>
        </div> */}
      </Container>
    </section>
  );
};

export default FeatureHighlights;
