import { Container, Row, Col } from "react-bootstrap";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import ProjectItem from "../components/ProjectItem/ProjectItem";
import Testimonials from "../components/Testimonials/Testimonials";
import imgdata from "../utils/imgdata";
import testimonialdata from "../utils/testimonialdata.json";
import NavBar from "../components/NavBar/NavBar";
import Footer from "../components/Footer/Footer";
import styles from "../styles/Home.module.css"; // Import the CSS module
import HowItWorks from "./HowItWorks";
import FeatureHighlights from "./FeatureHighlights";
import BrandShowcase from "./BrandShowcase";
import Image from "next/image";
import Services from "./Services";
import AboutUs from "./AboutUs";

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
const Headline = styled(Typography)(({ theme }) => ({
  color: "#ffffff",
  fontWeight: "bold",
  textAlign: "center",
  marginBottom: theme.spacing(2),
  zIndex: 5,
  fontSize: "1.8rem", // Default for small screens
  [theme.breakpoints.up("md")]: {
    fontSize: "2.5rem", // For medium and larger screens
  },
}));


const IntroParagraph = styled(Typography)(({ theme }) => ({
  color: "#f0f0f0",
  fontSize: "1.2rem",
  textAlign: "center",
  maxWidth: "800px",
  margin: "0 auto",
  zIndex: 5,
}));
// Styled paragraph for service description
const ServiceDescription = styled(Typography)(({ theme }) => ({
  color: "#555",
  fontSize: "1.1rem",
  textAlign: "center",
  marginBottom: theme.spacing(4),
  padding: theme.spacing(0, 2),
}));

export default function Home(props: any) {
  return (
    <>
      <Container fluid className="p-0">
        {/* Image and Video Overlay Section */}
        <div className={styles.mediaContainer}>
          {/* Updated Image */}
          <img
            src="/images/before-after.webp"
            alt="Before and After Painting"
            className={styles.image}
          />
          {/* Headline and Intro Paragraph */}
          <div className={styles.textOverlay}>
            <Headline>
              Transform Your Home’s Look Instantly with Our AI-Powered Color
              Visualizer
            </Headline>
            <IntroParagraph>
              Welcome to Rockstar Painting Color Visualizer – a cutting-edge
              tool designed to help you reimagine your home with ease. Whether
              you’re looking to refresh your home’s exterior or add a pop of
              color to your interior, our AI-powered technology lets you upload
              images of your space and experiment with endless color
              combinations in real-time.
            </IntroParagraph>
          </div>

          {/* Video */}
          <video
            className={styles.video}
            autoPlay
            loop
            muted
            playsInline
            src="/videos/Color Palette.mp4"
          />
        </div>

        <HowItWorks />
        <FeatureHighlights />
        <BrandShowcase />
        <AboutUs />
        {/* Our Services Section */}
        <Container fluid className="py-5">
          <SectionTitle variant="h2">Our Services</SectionTitle>
          <Services />
        </Container>

        {/* Testimonials Section */}
        <Testimonials testimonialData={testimonialdata} />
      </Container>
    </>
  );
}
