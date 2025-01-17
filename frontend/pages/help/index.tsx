import React, { useState } from "react";
import Link from "next/link";
import { Accordion, Container, Row, Col, Card } from "react-bootstrap";
import {
  ArrowLeft,
  Upload,
  Palette,
  Eye,
  Calendar,
  HelpCircle,
} from "lucide-react";

const HelpAndFAQ = () => {
  const [activeKey, setActiveKey] = useState("0");

  const steps = [
    {
      icon: <Upload className="mb-3 text-primary" size={32} />,
      title: "Step 1: Select Image",
      description:
        "Upload a clear photo of your room. The tool will automatically crop images to 3:2 aspect ratio for optimal viewing experience.",
      tip: "Use well-lit, clear images for best results",
    },
    {
      icon: <Palette className="mb-3 text-primary" size={32} />,
      title: "Step 2: Select Colors",
      description:
        "Browse through our extensive collection of Sherwin Williams and Benjamin Moore paint colors. Save your favorite colors for visualization.",
      tip: "You can use the search bar to find specific paint colors",
    },
    {
      icon: <Eye className="mb-3 text-primary" size={32} />,
      title: "Step 3: Visualize Room",
      description:
        "Click on the walls or areas you want to paint. Our AI technology will automatically detect and mask the selected area with your chosen color.",
      tip: "Click multiple times for more precise selection",
    },
    {
      icon: <Calendar className="mb-3 text-primary" size={32} />,
      title: "Step 4: Book Service",
      description:
        "Once you're satisfied with the visualization, book our professional painting service to bring your vision to life.",
      tip: "Save your design before booking",
    },
  ];

  const faqItems = [
    {
      question: "How do I upload my room photo?",
      answer:
        "Click on 'Select Image' in Step 1, then either drag and drop your photo or click to browse your files. The tool will automatically adjust your image to the optimal 3:2 aspect ratio for the best visualization experience.",
    },
    {
      question: "What file types are supported?",
      answer:
        "Our tool currently supports JPG, PNG, and JPEG image formats. For best results, we recommend using high-quality images with clear subjects and backgrounds.",
    },
    {
      question: "What paint brands are available?",
      answer:
        "We currently offer colors from Sherwin Williams and Benjamin Moore. You can easily switch between brands using the icons at the top of the color selection page.",
    },
    {
      question: "How does the color visualization work?",
      answer:
        "Our tool uses advanced AI technology to detect walls and surfaces. Simply click on the area you want to paint, and the tool will automatically mask and fill it with your selected color. You can make multiple selections and try different colors until you're satisfied.",
    },
    {
      question: "Can I save my favorite colors?",
      answer:
        "Yes! When browsing colors, you can save your favorites which will appear in the 'Saved Colors' section. This makes it easy to compare and try different color combinations.",
    },
    {
      question: "How do I book a painting service?",
      answer:
        "After visualizing your room, click the 'Book your service' button in Step 4. You'll be able to share your visualization and color choices directly with our team for accurate quoting and scheduling.",
    },

    {
      question: "How does the masking tool work?",
      answer:
        "The tool uses advanced AI segmentation to automatically detect and select regions of similar colors and textures when you click. This makes it easy to select specific areas without manual tracing or complex selection tools.",
    },
    {
      question: "Can I clear my changes?",
      answer:
        "Yes, you can clear all paints and start over using the reset button.",
    },
    // {
    //   question: "What's the maximum image size supported?",
    //   answer:
    //     "We recommend using images up to 4000x4000 pixels. Larger images will be automatically resized to ensure optimal performance while maintaining quality.",
    // },
    {
      question: "How accurate is the masking?",
      answer:
        "Our AI-powered masking is highly accurate for most images. However, very complex patterns or areas with low contrast might require multiple clicks for precise selection.",
    },
    {
      question: "Can I adjust the mask after applying it?",
      answer:
        "Yes, you can refine your selection by clicking additional areas to add to the mask. If you need to start over, use the reset button to clear all masks.",
    },
  ];

  return (
    <Container className="py-5">
      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <Link
            href="/colorvisualiser"
            className="text-decoration-none d-inline-flex align-items-center mb-4"
          >
            <ArrowLeft className="me-2" /> Back to Visualizer
          </Link>
          <div className="d-flex align-items-center mb-3">
            <HelpCircle size={32} className="text-primary me-3" />
            <h1 className="mb-0">Rockstar Color Visualizer Help</h1>
          </div>
          <p className="lead text-muted">
            Learn how to use our color visualization tool to transform your
            space with confidence.
          </p>
        </Col>
      </Row>

      {/* Step by Step Guide */}
      <Row className="mb-5">
        <Col>
          <h2 className="mb-4">How It Works</h2>
          <Row>
            {steps.map((step, index) => (
              <Col key={index} xs={12} md={6} lg={3} className="mb-4">
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="text-center">
                    <div className="rounded-circle bg-light p-3 d-inline-flex mb-3">
                      {step.icon}
                    </div>
                    <h3 className="h5 mb-3">{step.title}</h3>
                    <p className="text-muted mb-3">{step.description}</p>
                    <div className="bg-light p-2 rounded">
                      <small className="text-primary">💡 Tip: {step.tip}</small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* Key Features */}
      <Row className="mb-5">
        <Col>
          <h2 className="mb-4">Key Features</h2>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Row>
                <Col md={4} className="mb-4 mb-md-0">
                  <h3 className="h5 mb-3">AI-Powered Selection</h3>
                  <p className="text-muted">
                    Smart area detection automatically identifies and masks
                    walls and surfaces with a single click.
                  </p>
                </Col>
                <Col md={4} className="mb-4 mb-md-0">
                  <h3 className="h5 mb-3">Premium Paint Colors</h3>
                  <p className="text-muted">
                    Access to complete Sherwin Williams and Benjamin Moore color
                    collections with accurate color rendering.
                  </p>
                </Col>
                <Col md={4}>
                  <h3 className="h5 mb-3">Integrated Booking</h3>
                  <p className="text-muted">
                    Seamlessly schedule professional painting services based on
                    your visualization.
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* FAQ Section */}
      <Row className="mb-5">
        <Col>
          <h2 className="mb-4">Frequently Asked Questions</h2>
          <Accordion
            activeKey={activeKey}
            onSelect={(key) => setActiveKey(key as string || "0")}
          >
            {faqItems.map((item, index) => (
              <Accordion.Item key={index} eventKey={index.toString()}>
                <Accordion.Header>{item.question}</Accordion.Header>
                <Accordion.Body className="text-muted">
                  {item.answer}
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Col>
      </Row>

      {/* Contact Section */}
      <Row className="mt-5">
        <Col className="text-center">
          <Card className="border-0 bg-primary text-white">
            <Card.Body className="py-5">
              <h2 className="h4 mb-4">Need Additional Help?</h2>
              <p className="mb-4">
                Contact our support team Monday to Saturday, 8AM - 7PM
              </p>
              <div className="d-flex justify-content-center gap-4">
                <div>
                  <strong>📞 Phone:</strong>
                  <p className="mb-0">(720) 771-2791</p>
                </div>
                <div>
                  <strong>✉️ Email:</strong>
                  <p className="mb-0">rockstarpainting33@gmail.com</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HelpAndFAQ;
