import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import styles from "../styles/Services.module.css";

// Services Data
const services = [
  {
    video: "/videos/exterior-painting.mp4", // Video instead of image for icon
    title: "Exterior Painting",
    description: "Rockstar Painting is here to make your home shine brilliantly from the outside. Our exterior painting services are designed to give your home a fresh look.",
  },
  {
    video: "/videos/interior-painting.mp4", // Same video for all services
    title: "Interior Painting",
    description:
      "Let us unleash the potential of your interior spaces with our exceptional interior painting services. Our expert team understands that the colors.",
  },
  {
    video: "/videos/drywall-repair.mp4", // Video icon for service
    title: "Drywall Repair",
    description: "Say goodbye to unsightly dents, holes, and cracks on your walls with our drywall repair Denver. Our experts are skilled in delivering seamless solutions.",
  },
  
];

const Services = () => {
  return (
    <Container fluid className={styles.servicesContainer}>
         <h2 style={{ 
  fontSize: '2.5rem', 
  fontWeight: 'bold', 
  marginBottom: '40px', 
  color: '#022e97',
  textAlign: 'center',
  backgroundColor: '#f9f9f9'  // camelCase and no semicolon
}}
>
  Our Services
</h2>
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
  <Card.Body className={styles.serviceCardBody}>
    <Card.Title className={styles.serviceTitle}>{service.title}</Card.Title>
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
