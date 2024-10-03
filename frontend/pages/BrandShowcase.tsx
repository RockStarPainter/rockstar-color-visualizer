import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import Image from "next/image";
import styles from "../styles/BrandShowcase.module.css"; // Import the CSS for styling

const BrandShowcase = () => {
  return (
    <section className={styles.brandSection}>
      <Container>
        <h2 className={styles.title}>Our Trusted Brands</h2>
        <p className={styles.description}>
          We collaborate with the top industry brands to bring you high-quality colors and finishes.
        </p>
        <Row className={styles.logoRow}>
          <Col md={6} className="d-flex justify-content-center">
            <Image
              src="/images/Benjamin_Moore_logo.svg"
              alt="Benjamin Moore Logo"
              className={styles.brandLogo}
              width={200}
              height={150}
            />
          </Col>
          <Col md={6} className="d-flex justify-content-center">
            <Image
              src="/images/sherwin.png"
              alt="Sherwin-Williams Logo"
              className={styles.brandLogo}
              width={200}
              height={150}
            />
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default BrandShowcase;
