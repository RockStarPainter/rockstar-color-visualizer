import { Container } from "react-bootstrap";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { useRef } from "react"; // Import useRef for creating a ref
import HowItWorks from "./HowItWorks";
import FeatureHighlights from "./FeatureHighlights";
import BrandShowcase from "./BrandShowcase";
import Services from "./Services";
import AboutUs from "./AboutUs";
import Testimonials from "../components/Testimonials/Testimonials";
import Hero from "../components/Hero/Hero";
import ScrollToTopButton from "../components/ScrollToTopButton";

// Styled Typography for section headings
const SectionTitle = styled(Typography)(({ theme }) => ({
  color: "#323232",
  fontSize: "2rem",
  fontWeight: "bold",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  textAlign: "center",
  marginBottom: theme.spacing(4),
  padding: theme.spacing(2),
  background: "linear-gradient(45deg, #719E37, #F7F7F9)",
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
}));

export default function Home(props: any) {
  const topRef = useRef<HTMLDivElement>(null); // Create the topRef

  return (
    <Container fluid className="p-0">
      {/* Image and Video Overlay Section */}
      <Hero topRef={topRef} /> {/* Pass topRef to Hero */}
      <HowItWorks />
      <BrandShowcase />
      <FeatureHighlights />
      <AboutUs />
      {/* Our Services Section */}
      <Container fluid className="py-5">
        <Services />
      </Container>
      {/* Testimonials Section */}
      <Testimonials />
    </Container>
  );
}
