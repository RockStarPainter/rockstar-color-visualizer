import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Container,
  Row,
  Col,
  Form,
  Image,
  InputGroup,
} from "react-bootstrap";
import { useRouter } from "next/navigation";
import { paints } from "../../public/paints";
import { FaCheckCircle, FaLongArrowAltRight, FaSearch } from "react-icons/fa"; // Import search icon
import { useColorContext } from "../../contexts/ColorContext";
import { MdOutlineDeleteOutline } from "react-icons/md";

const colorCategories = [
  { name: "Red", key: "red" },
  { name: "Orange", key: "orange" },
  { name: "Yellow", key: "yellow" },
  { name: "Green", key: "green" },
  { name: "Blue", key: "blue" },
  { name: "Purple", key: "purple" },
  { name: "Gray", key: "gray" },
  { name: "Neutral", key: "neutral" },
  { name: "White", key: "white" },
];

const ColorSelection = ({ handleCloseColorModal, nextStep }: any) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("red");
  const [companyPaints, setCompanyPaints] = useState<any>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedLogo, setSelectedLogo] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

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

  // Handle search input
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Filter paints by name or code based on search term
  const filteredPaints = companyPaints[selectedCategory]?.filter(
    (paint: any) =>
      paint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paint.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderPaints = () => {
    return (
      <div className="d-flex flex-wrap justify-content-center">
        {filteredPaints?.map((paint: any, index: number) => (
          <div
            key={index}
            style={{
              // padding: "5px",
              boxSizing: "border-box",
            }}
            className="paint_cards"
          >
            <Card
              className={`position-relative paint_card ${
                selectedColors.some((p) => p.code === paint.code) ? "selected" : ""
              }`}
              onClick={() => handlePaintSelection(paint)}
              style={{ 
                cursor: "pointer", 
                border: "none", 
                boxShadow: "0px 1px 5px rgba(0,0,0,0.1)", 
                transition: "transform 0.2s ease-in-out" // Smooth transition for scaling
              }}
            >
              <div
                style={{
                  backgroundColor: paint.hex,
                  height: "8rem",
                  width: "100%",
                  borderRadius: "3px",
                }}
                className="p-2"
              >
                <span className="fw-semibold" style={{ fontSize: ".9rem" }}>
                  {paint.name}
                </span>
                <br />
                <span style={{ fontSize: ".8rem" }}>{paint.code}</span>


                {/* for testing  */}

                <br />
                <br />
                <span className="fw-semibold " style={{ fontSize: ".8rem" }}>{paint.hex}</span>


              </div>
  
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
          </div>
        ))}
      </div>
    );
  };

  return (
    <Container fluid className="">
      <Row className="my-3 justify-content-between">
        <Col>
          <h4 className="fw-bold mt-3">Browse Paint Colors</h4>
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
          {/* Search field with icon */}
          <InputGroup>
            <InputGroup.Text id="search-addon">
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search paints"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </InputGroup>
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

      {/* Saved Colors Section - Sticky with its own scroll */}
      <Row className="custom-scrollbar mb-5">
  <div className="saved-colors bg-light p-3 h-100 pt-5">
    {/* "Paint Your Room" Button inside the saved colors section */}
    <Button
      variant="primary"
      className="w-100 mb-3"
      onClick={nextStep}
      disabled={selectedColors.length === 0}
    >
      Visualize Room <FaLongArrowAltRight className="fs-3 ms-2" />
    </Button>

    <h5 className="fw-bold">Saved Colors</h5>
    <div className="row">
      {selectedColors.map((paint, index) => (
        <div key={index} className="col-12 col-sm-6 mb-2">
          <li className="list-group-item d-flex justify-content-between align-items-center bg-white p-1 rounded border">
            <div className="d-flex align-items-center pt-2">
              <div
                style={{
                  display: "inline-block",
                  backgroundColor: paint.hex,
                  width: "2rem",
                  height: "2rem",
                  marginRight: "10px",
                  borderRadius: "10%",
                }}
                className="ms-3 mb-1"
              ></div>
              <div
                className="fw-bold block pb-2"
                style={{ fontSize: ".9rem" }}
              >
                {paint.name}
              </div>
            </div>
            <Button
              variant="danger"
              className="rounded-3 me-5"
              size="sm"
              onClick={() => removeColor(paint?.code)}
            >
              <MdOutlineDeleteOutline />
            </Button>
          </li>
        </div>
      ))}
    </div>
  </div>
</Row>


      
      {/* Paint Grid */}
      <Row>{renderPaints()}</Row>
    </Container>
  );
};

export default ColorSelection;
