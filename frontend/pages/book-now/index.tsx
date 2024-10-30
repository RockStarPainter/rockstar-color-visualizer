import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
import useEmail from "../../hooks/useEmail";
import useCloudinaryUpload from "../../hooks/useCloudinaryUpload";
import ErrorMessage from "../../components/ErrorMessage";
import styles from "../../components/Hero/hero.module.css";
import {
  exteriorFields,
  interiorFields,
} from "../../public/order-form-fields/FieldsData";
import Loading from "../../components/Loading/Loading";

const BookingForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
    watch,
    setValue,
    trigger,
    reset,
  } = useForm();
  const [phone, setPhone] = useState("");
  const { sendEmail, loading } = useEmail();
  const { uploadPdfToCloudinary, uploading } = useCloudinaryUpload();

  const personalDetailsRef = useRef<HTMLDivElement>(null);
  const interiorServicesRef = useRef<HTMLDivElement>(null);
  const exteriorServicesRef = useRef<HTMLDivElement>(null);
  const additionalNotesRef = useRef<HTMLDivElement>(null);
  const [loader, setLoader] = useState(false); // Start with loading true

  const handlePhoneChange = (value) => {
    setPhone(value);
    setValue("phone", value);
    trigger("phone");
  };

  const onSubmit = async (data) => {
    setLoader(true);
    if (Object.keys(errors).length > 0) {
      console.warn("Form has errors:", errors);
      return;
    }

    const formData = { ...data, phone };
    await generatePdfAndSendEmail(formData);

    reset();

    setLoader(false);
  };

  // Constants for PDF layout
  const PDF_MARGIN_LEFT = 20; // Left margin in mm
  const PDF_MARGIN_RIGHT = 20; // Right margin in mm
  const PDF_MARGIN_TOP = 20; // Top margin in mm
  const SECTION_SPACING = 15; // Space between sections in mm
  const PAGE_WIDTH = 210; // A4 width in mm
  const PAGE_HEIGHT = 297; // A4 height in mm
  const CONTENT_WIDTH = PAGE_WIDTH - PDF_MARGIN_LEFT - PDF_MARGIN_RIGHT;

  const generateSection = async (
    ref: HTMLDivElement,
    pdf: jsPDF,
    startY: number
  ) => {
    // Apply styling to the section before capturing
    const originalStyle = ref.style.cssText;
    ref.style.padding = "15px";
    ref.style.backgroundColor = "#ffffff";
    ref.style.border = "1px solid #e0e0e0";
    ref.style.borderRadius = "5px";
    ref.style.margin = "20px";

    const canvas = await html2canvas(ref, {
      scale: 2, // Increase quality
      logging: false,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    // Restore original styling
    ref.style.cssText = originalStyle;

    const imgData = canvas.toDataURL("image/png");
    const imgWidth = CONTENT_WIDTH;
    const imgHeight = (canvas.height * CONTENT_WIDTH) / canvas.width;

    // Check if we need a new page
    if (startY + imgHeight > PAGE_HEIGHT - PDF_MARGIN_TOP) {
      pdf.addPage();
      startY = PDF_MARGIN_TOP;
    }

    pdf.addImage(imgData, "PNG", PDF_MARGIN_LEFT, startY, imgWidth, imgHeight);

    return startY + imgHeight + SECTION_SPACING;
  };

  const generatePdfAndSendEmail = async (formData) => {
    try {
      const generatePdf = async () => {
        // Custom dimensions for a taller page
        const pageWidth = 210; // A4 width in mm
        const pageHeight = 400; // Custom height in mm (example: 400mm)

        // const pdf = new jsPDF("p", "mm", "a4", true);
        const pdf = new jsPDF("p", "mm", [pageWidth, pageHeight], true);

        // Set initial Y position after top margin
        let currentY = PDF_MARGIN_TOP;

        // Add title
        pdf.setFontSize(24);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(0, 0, 0);
        const title = "Rockstar Visualizer Order";
        const titleWidth =
          (pdf.getStringUnitWidth(title) * pdf.getFontSize()) /
          pdf.internal.scaleFactor;
        const titleX = (PAGE_WIDTH - titleWidth) / 2;
        pdf.text(title, titleX, currentY);
        currentY += 15;

        // Add date
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");
        const date = new Date().toLocaleDateString();
        pdf.text(`Date: ${date}`, PDF_MARGIN_LEFT, currentY);
        currentY += SECTION_SPACING;

        // Add sections with headers
        const sections = [
          { ref: personalDetailsRef, title: "Personal Details" },
          { ref: interiorServicesRef, title: "Interior Services" },
          { ref: exteriorServicesRef, title: "Exterior Services" },
          { ref: additionalNotesRef, title: "Additional Notes" },
        ];

        for (const section of sections) {
          if (section.ref.current) {
            // Add section header
            pdf.setFontSize(16);
            pdf.setFont("helvetica", "bold");
            // pdf.text(section.title, PDF_MARGIN_LEFT, currentY);
            currentY += 8;

            // Add section content
            currentY = await generateSection(
              section.ref.current,
              pdf,
              currentY
            );
          }
        }

        // // Add footer with page numbers
        // const pageCount = pdf.internal.getNumberOfPages();
        // for (let i = 1; i <= pageCount; i++) {
        //   pdf.setPage(i);
        //   pdf.setFontSize(10);
        //   pdf.setFont("helvetica", "normal");
        //   pdf.text(
        //     `Page ${i} of ${pageCount}`,
        //     PAGE_WIDTH / 2,
        //     PAGE_HEIGHT - 10,
        //     { align: "center" }
        //   );
        // }

        // // download the pdf
        // pdf.save("services pdf.pdf");

        return pdf.output("blob");
      };

      const pdfBlob = await generatePdf();
      const pdfUrl = await uploadPdfToCloudinary(pdfBlob);

      if (!pdfUrl) {
        toast.error("Failed to upload PDF.");
        return;
      }

      const templateParams = {
        customer_name: formData.firstName,
        to_email: formData.email,
        pdf_url: pdfUrl,
      };

      await sendEmail(templateParams);
      toast.success("Order submitted successfully!");
    } catch (error) {
      console.error("Error generating or sending PDF:", error);
      toast.error("Failed to process your order. Please try again.");
    }
  };

  return (
    <>
      {loader && <Loading message={'Placing Your Order'} />}

      <Container
        className="my-5 w-100"
        style={{
          background: `linear-gradient(45deg, rgba(255, 0, 0, 0.3) 0%, rgba(255, 255, 0, 0.3) 25%, rgba(0, 0, 255, 0.3) 50%, rgba(0, 128, 0, 0.3) 75%)`,
        }}
      >
        <Row className="justify-content-center pb-5">
          <Col md={10}>
            <div
              className="p-4 rounded booking-form"
              // style={{
              //   background: `linear-gradient(45deg, rgba(255, 0, 0, 0.3) 0%, rgba(255, 255, 0, 0.3) 25%, rgba(0, 0, 255, 0.3) 50%, rgba(0, 128, 0, 0.3) 75%)`,
              // }}
            >
              <h2
                className="text-center mb-4 fw-bold"
                style={{ color: "black" }}
              >
                Book Your Service Now
              </h2>
              <Form onSubmit={handleSubmit(onSubmit)}>
                {/* Personal Details Section */}
                <div ref={personalDetailsRef} className="bg-white p-4 rounded">
                  <h5 className="mb-4 fw-bold">Personal Details</h5>
                  <div id="personal-details">
                    <Row>
                      <Col md={6}>
                        <Form.Group controlId="formFirstName">
                          <Form.Label>First Name</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="First Name"
                            {...register("firstName", {
                              required: "First Name is required",
                            })}
                            style={{ backgroundColor: "white" }}
                          />
                          <ErrorMessage error={errors.firstName} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group controlId="formLastName">
                          <Form.Label>Last Name</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Last Name"
                            style={{ backgroundColor: "white" }}
                            {...register("lastName", {
                              required: "Last Name is required",
                            })}
                          />
                          <ErrorMessage error={errors.lastName} />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="mt-2">
                      <Col md={6}>
                        <Form.Group controlId="formPhone">
                          <Form.Label>Phone</Form.Label>
                          <PhoneInput
                            country={"us"} // Default country
                            value={phone}
                            onChange={handlePhoneChange}
                            inputStyle={{ width: "100%" }}
                            dropdownStyle={{ color: "#000" }}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group controlId="formEmail">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            placeholder="Your Email"
                            style={{ backgroundColor: "white" }}
                            {...register("email", {
                              required: "Email is required",
                              pattern: {
                                value: /^\S+@\S+$/,
                                message: "Invalid email",
                              },
                            })}
                          />
                          <ErrorMessage error={errors.email} />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group controlId="formAddress">
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Your Address"
                        style={{ backgroundColor: "white" }}
                        {...register("address", {
                          required: "Address is required",
                        })}
                      />
                      <ErrorMessage error={errors.address} />
                    </Form.Group>

                    <Form.Group controlId="formProjectAddress" className="my-3">
                      <Form.Label>Project Address (If Different)</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Project Address (If Different)"
                        style={{ backgroundColor: "white" }}
                        {...register("projectAddress")}
                      />
                    </Form.Group>

                    <Row>
                      <Col md={4}>
                        <Form.Group controlId="formCity">
                          <Form.Label>Your City</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Your City"
                            style={{ backgroundColor: "white" }}
                            {...register("city", {
                              required: "City is required",
                            })}
                          />
                          <ErrorMessage error={errors.city} />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group controlId="formState">
                          <Form.Label>
                            Your State / Province / Region
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Your State / Province / Region"
                            style={{ backgroundColor: "white" }}
                            {...register("state", {
                              required: "State is required",
                            })}
                          />
                          <ErrorMessage error={errors.state} />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group controlId="formZip">
                          <Form.Label>Your ZIP / Postal</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Your ZIP / Postal"
                            style={{ backgroundColor: "white" }}
                            {...register("zip", {
                              required: "ZIP / Postal is required",
                            })}
                          />
                          <ErrorMessage error={errors.zip} />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group controlId="formCheckbox" className="mt-3">
                      <Form.Check
                        type="checkbox"
                        label="I agree to receive SMS communications from Rockstar Painting Denver"
                        className="mt-2"
                        {...register("agree", {
                          required: "You must agree to continue",
                        })}
                      />
                      <ErrorMessage error={errors.agree} />
                    </Form.Group>
                  </div>
                </div>

                {/* Interior Services Section */}
                <div
                  ref={interiorServicesRef}
                  className="bg-white p-4 rounded mt-4"
                >
                  <h5 className="text-center mb-4 fw-bold">
                    Interior Services
                  </h5>
                  {interiorFields.map((field) => (
                    <InteriorField
                      key={field?.key}
                      field={field}
                      register={register}
                      errors={errors}
                      watch={watch}
                      isSubmitted={isSubmitted}
                    />
                  ))}
                </div>

                {/* Exterior Services Section */}
                <div
                  ref={exteriorServicesRef}
                  className="bg-white p-4 rounded mt-4"
                >
                  <h5 className="text-center mb-4 fw-bold">
                    Exterior Services
                  </h5>
                  {exteriorFields.map((field) => (
                    <ExteriorField
                      key={field?.key}
                      field={field}
                      register={register}
                      errors={errors}
                    />
                  ))}
                  <Form.Group controlId="formRepair">
                    <Form.Label className="fw-bold">Repair</Form.Label>
                    <div>
                      {["Siding", "Facial", "Trim", "Soffits", "N/A"].map(
                        (option) => (
                          <Form.Check
                            key={option}
                            inline
                            label={option}
                            type="checkbox"
                            {...register(`repair_${option.toLowerCase()}`)}
                          />
                        )
                      )}
                    </div>
                  </Form.Group>
                </div>

                {/* Additional Notes Section */}
                <div
                  ref={additionalNotesRef}
                  className="bg-white p-4 rounded mt-4"
                >
                  <h5 className="mb-4 fw-bold">Additional Notes</h5>
                  <Form.Group controlId="formNote">
                    <Form.Control
                      as="textarea"
                      rows={4}
                      {...register("note")}
                      placeholder="Add additional information here"
                    />
                  </Form.Group>
                </div>

                <Button
                  className={`${styles.button} mt-4 w-100 py-2`}
                  type="submit"
                  disabled={loading || uploading}
                >
                  {loading || uploading ? "Processing..." : "Submit"}
                </Button>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default BookingForm;

const InteriorField = ({ field, register, errors, watch, isSubmitted }) => {
  const includeInterior = watch(`include_${field?.key}`) === "Yes";

  return (
    <div className="mb-4">
      <Form.Label className="fw-bold">{field?.name}</Form.Label>
      <Row>
        <Col md={6}>
          <p className="p-0 m-0 fw-bold text-secondary">
            Include ({field?.name})
          </p>
          <div>
            <Form.Check
              inline
              label="Yes"
              type="radio"
              value="Yes"
              {...register(`include_${field?.key}`)}
            />
            <Form.Check
              inline
              label="No"
              type="radio"
              value="No"
              {...register(`include_${field?.key}`)}
            />
            {errors[`include_${field?.key}`] && (
              <p className="text-danger">Required</p>
            )}
          </div>
        </Col>
        <Col md={6}>
          <p className="p-0 m-0 fw-bold text-secondary">
            Paint Code ({field?.name})
          </p>
          <div>
            {["Wall", "Base", "Ceiling", "Closet", "Door"].map((option) => (
              <Form.Check
                key={option}
                inline
                label={option}
                type="checkbox"
                disabled={!includeInterior}
                {...register(`paint_${field?.key}_${option.toLowerCase()}`)}
              />
            ))}
          </div>
        </Col>
      </Row>
    </div>
  );
};

function ExteriorField({ field, register, errors }) {
  return (
    <div className="mb-4">
      <Row>
        <Col md={6}>
          <Form.Label className="fw-bold text-end">{field?.name}</Form.Label>
        </Col>
        <Col md={6}>
          <p className="p-0 m-0 fw-bold text-secondary">
            Include ({field?.name})
          </p>
          <div>
            <Form.Check
              inline
              label="Yes"
              type="radio"
              value="Yes"
              {...register(`include_${field?.key}`)}
            />
            <Form.Check
              inline
              label="No"
              type="radio"
              value="No"
              {...register(`include_${field?.key}`)}
            />
            {errors[`include_${field?.key}`] && (
              <p className="text-danger">Required</p>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
}
