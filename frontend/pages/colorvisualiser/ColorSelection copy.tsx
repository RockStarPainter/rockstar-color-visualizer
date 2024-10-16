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
import { FaCheckCircle, FaLongArrowAltRight, FaSearch } from "react-icons/fa";
import { useColorContext } from "../../contexts/ColorContext";
import { MdOutlineDeleteOutline } from "react-icons/md";

const colorCategories = [
  { name: "Orange", key: "orange" },
  { name: "Yellow", key: "yellow" },
  { name: "Green", key: "green" },
  { name: "Blue", key: "blue" },
  { name: "Red", key: "red" },
  { name: "Purple", key: "purple" },
  { name: "Neutral", key: "neutral" },
  { name: "White", key: "white" },
];

const ColorSelection = ({ handleCloseColorModal, nextStep }: any) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("orange");
  const [companyPaints, setCompanyPaints] = useState<any>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedLogo, setSelectedLogo] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const router = useRouter();
  const { selectedColors, addColor, removeColor } = useColorContext();

  useEffect(() => {
    if (paints.length > 0) {
      const firstCompany = paints[0];
      setSelectedCompany(firstCompany.companyName);
      setSelectedLogo(firstCompany.logo);
      setCompanyPaints(firstCompany.paints);
    }
  }, []);

  const handleCompanySelection = (company: any) => {
    setSelectedCompany(company.companyName);
    setSelectedLogo(company.logo);
    setCompanyPaints(company.paints);
  };

  const handlePaintSelection = (paint: any) => {
    if (selectedColors.some((p) => p.code === paint.code)) {
      removeColor(paint.code);
    } else {
      addColor(paint);
    }
  };

  const handleCategorySelection = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Ensure companyPaints is not null before filtering
  const filteredPaints = companyPaints?.[selectedCategory]?.filter(
    (paint: any) =>
      paint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paint.code.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
                  // borderRadius: "5px",
                }}
                className="p-1"
              >
                <span className="fw-bold" style={{ fontSize: ".9rem" }}>
                  {paint.name}
                </span>
                <br />
                <span style={{ fontSize: ".8rem" }}>{paint.code}</span>
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
    <Container fluid className="p-0 m-0">
      <Row className="my-3 justify-content-between">
        <Col>
          <h4 className="fw-bold mt-3">Browse Paint Colors</h4>
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
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

      {/* Saved Colors Section Moved to Top */}
      <Row className="mb-4">
        <Col xs={12}>
          <div className="saved-colors bg-light p-3">
            <Button
              variant="primary"
              className="w-100 mb-3"
              onClick={nextStep}
              disabled={selectedColors.length === 0}
            >
              Visualize Room <FaLongArrowAltRight className="fs-3 ms-2" />
            </Button>
            <h5 className="fw-bold">Saved Colors</h5>
            <ul className="list-group">
              {selectedColors.map((paint, index) => (
                <li
                  key={index}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div className="d-flex items-center pt-2">
                    <div
                      style={{
                        backgroundColor: paint.hex,
                        width: "20px",
                        height: "20px",
                        marginRight: "10px",
                        borderRadius: "50%",
                      }}
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

      {/* Paint Grid Section */}
      <Row>{renderPaints()}</Row>
    </Container>
  );
};

export default ColorSelection;
