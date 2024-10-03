import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import styles from "../styles/Services.module.css";

// Services Data
const services = [
  {
    video: "/videos/Paint Brush.mp4", // Video instead of image for icon
    title: "Exterior Painting",
    description: "Enhancing homes with fresh, high-quality exterior paintwork.",
  },
  {
    video: "/videos/Home Painting.mp4", // Same video for all services
    title: "Interior Painting",
    description:
      "Revitalizing interiors with expert color selection and application.",
  },
  {
    video: "/videos/Paint Cans.mp4", // Video icon for service
    title: "Drywall Repair",
    description: "Fixing dents, holes, and cracks for smooth, flawless walls.",
  },
  {
    video: "/videos/Painter painting wall.mp4",
    title: "Commercial Painting",
    description: "Professional painting services tailored for businesses.",
  },
  {
    video: "/videos/Paint Brush.mp4",
    title: "Deck Staining",
    description:
      "Preserving and beautifying outdoor spaces with expert staining.",
  },
  {
    video: "/videos/3D Archeitectural Modeling.mp4",
    title: "Popcorn Ceiling Removal",
    description: "Modernizing interiors by removing outdated ceilings.",
  },
];

const Services = () => {
  return (
    <Container fluid className={styles.servicesContainer}>
      <Row>
        {services.map((service, index) => (
          <Col md={4} key={index} className={styles.serviceCol}>
            <Card className={styles.serviceCard}>
              {/* Video for service icon */}
              <div className={styles.serviceVideoWrapper}>
                <video
                  className={styles.serviceVideoIcon}
                  autoPlay
                  loop
                  muted
                  playsInline
                  src={service.video}
                />
              </div>
              <Card.Body>
                <Card.Title className={styles.serviceTitle}>
                  {service.title}
                </Card.Title>
                <Card.Text className={styles.serviceDescription}>
                  {service.description}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Services;
