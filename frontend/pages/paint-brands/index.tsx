import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Container,
  Row,
  Col,
  Form,
  Image,
} from "react-bootstrap";
import { useRouter } from "next/navigation";
import { paints } from "../../public/paints";
import { FaCheckCircle } from "react-icons/fa"; // For tick icon
import { useColorContext } from "../../contexts/ColorContext";
import { MdOutlineDeleteOutline } from "react-icons/md";

const colorCategories = [
  { name: "Red", key: "red" },
  { name: "Orange", key: "orange" },
  { name: "Yellow", key: "yellow" },
  { name: "Green", key: "green" },
  { name: "Blue", key: "blue" },
  { name: "Purple", key: "purple" },
  { name: "Neutral", key: "neutral" },
  { name: "White", key: "white" },
];

interface PaintSelectionPageProps {
  handleCloseColorModal: () => void;
}

const PaintSelectionPage: React.FC<PaintSelectionPageProps> = ({
  handleCloseColorModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("red");
  const [companyPaints, setCompanyPaints] = useState<any>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedLogo, setSelectedLogo] = useState<string>("");

  const router = useRouter();

  const { selectedColors, addColor, removeColor } = useColorContext(); // Use the context

  // Set default company on load
  useEffect(() => {
    if (paints.length > 0) {
      const firstCompany = paints[0];
      setSelectedCompany(firstCompany.companyName);
      setSelectedLogo(firstCompany.logo);
      setCompanyPaints(firstCompany.paints);
    }
  }, []);

  // Handle company selection change
  const handleCompanySelection = (company: any) => {
    setSelectedCompany(company.companyName);
    setSelectedLogo(company.logo);
    setCompanyPaints(company.paints);
  };

  if (!companyPaints) {
    return <div>Loading...</div>;
  }

  // Handle paint selection
  const handlePaintSelection = (paint: any) => {
    if (selectedColors.some((p) => p.code === paint.code)) {
      removeColor(paint.code); // Remove color from the context
    } else {
      addColor(paint); // Add color to the context
    }
  };

  // Handle category selection
  const handleCategorySelection = (category: string) => {
    setSelectedCategory(category);
  };

  const renderPaints = () => {
    return companyPaints[selectedCategory]?.map((paint: any, index: number) => (
      <Col key={index} xs={6} sm={4} md={3} lg={2} className="mb-4">
        <Card
          className={`p-2 paint-card position-relative ${
            selectedColors.some((p) => p.code === paint.code) ? "selected" : ""
          }`}
          onClick={() => handlePaintSelection(paint)}
          style={{ cursor: "pointer" }}
        >
          <div
            style={{
              backgroundColor: paint.hex,
              height: "60px",
              width: "100%",
              borderRadius: "8px",
            }}
          ></div>
          <div className="mt-2 text-center">
            <strong>{paint.name}</strong>
            <br />
            {paint.code}
          </div>

          {/* Show tick on selected paints */}
          {selectedColors.some((p) => p.code === paint.code) && (
            <FaCheckCircle
              size={24}
              color="black"
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
              }}
            />
          )}
        </Card>
      </Col>
    ));
  };

  return (
    <Container fluid className="">
      <Row className="mb-3">
        <Col>
          <h3 className="fw-bold">Browse Paint Colors</h3>
        </Col>
      </Row>

      {/* Company Logos Row */}
      <Row className="mb-4 justify-content-center">
        {paints.map((company, index) => (
          <Col
            key={index}
            xs={6}
            sm={4}
            md={3}
            className="text-center d-flex flex-column align-items-center"
          >
            <div
              style={{
                border:
                  selectedCompany === company.companyName
                    ? "3px solid #007bff"
                    : "none",
                borderRadius: "5%",
                padding: "10px",
                background:
                  selectedCompany === company.companyName
                    ? "#f8f9fa"
                    : "transparent",
                cursor: "pointer",
              }}
              onClick={() => handleCompanySelection(company)}
            >
              <Image
                src={company.logo}
                alt={company.companyName}
                fluid
                style={{
                  width: "50px", // Set fixed width
                  height: "50px", // Set fixed height
                  objectFit: "contain", // Ensure the image scales while maintaining aspect ratio
                }}
              />

              {/* Centered company name below the logo */}
              <h6
                style={{
                  marginTop: "10px",
                  color:
                    selectedCompany === company.companyName
                      ? "#007bff"
                      : "black",
                }}
              >
                {company.companyName}
              </h6>
            </div>
          </Col>
        ))}
      </Row>

      {/* Color Categories */}
      <Row className="mb-4">
        {colorCategories.map((category) => (
          <Col key={category.key} xs={6} sm={4} md={2}>
            <Button
              variant={selectedCategory === category.key ? "dark" : "light"}
              onClick={() => handleCategorySelection(category.key)}
              className="w-100 mb-2"
            >
              {category.name}
            </Button>
          </Col>
        ))}
      </Row>

      <Row>
        {/* Main Paints Grid that scrolls with the page */}
        <Col xs={12} md={9} className="px-5 py-3">
          {/* Paint Grid */}
          <Row>{renderPaints()}</Row>
        </Col>

        {/* Saved Colors Section - Sticky with its own scroll */}
        <Col
          xs={12}
          md={3}
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            overflowY: "auto",
          }}
          className="custom-scrollbar"
        >
          <div className="saved-colors bg-light p-3 h-100 pt-5">
            {/* "Paint Your Room" Button inside the saved colors section */}
            <Button
              variant="primary"
              className="w-100 mb-3"
              onClick={handleCloseColorModal}
              disabled={selectedColors.length === 0}
            >
              Paint Your Room
            </Button>

            <h5 className="fw-bold">Saved Colors</h5>
            <ul className="list-group">
              {selectedColors.map((paint, index) => (
                <li
                  key={index}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <span>
                    <div
                      style={{
                        display: "inline-block",
                        backgroundColor: paint.hex,
                        width: "20px",
                        height: "20px",
                        marginRight: "10px",
                        borderRadius: "50%",
                      }}
                    ></div>
                    {paint.name}
                  </span>
                  <Button
                    variant="danger"
                    className="rounded-3"
                    size="sm"
                    onClick={() => removeColor(paint?.code)}
                  >
                    <MdOutlineDeleteOutline />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default PaintSelectionPage;
