import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
import useEmail from "../../hooks/useEmail";
import useCloudinaryUpload from "../../hooks/useCloudinaryUpload"; // Import the Cloudinary hook
import ErrorMessage from "../../components/ErrorMessage";
import styles from "../../components/Hero/hero.module.css";
import {
  exteriorFields,
  interiorFields,
} from "../../public/order-form-fields/FieldsData";

const BookingForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
    watch,
  } = useForm();
  const [phone, setPhone] = useState("");
  const { sendEmail, loading } = useEmail();
  const { uploadPdfToCloudinary, uploading } = useCloudinaryUpload();
  const pageRef = useRef<HTMLDivElement>(null);
  const [serviceType, setServiceType] = useState("interior");

  const handleServiceTypeChange = (event: any) => {
    setServiceType(event.target.value);
  };

  // Form submission handler
  const onSubmit = async (data) => {

    // Check if there are any form validation errors
  if (Object.keys(errors).length < 0) {
    console.warn("Form has errors:", errors);
    return;
  }

    const formData = { ...data, phone };
    console.log(formData);
    await generatePdfAndSendEmail(formData);
  };


  const generatePdfAndSendEmail = async (formData) => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      let yPosition = 10; // Vertical position on the PDF

      // Add a colorful header
      pdf.setFontSize(22);
      pdf.setTextColor(255, 0, 0); // Red color
      pdf.text("Service Booking Confirmation", 10, yPosition);
      yPosition += 10;

      pdf.setTextColor(0, 0, 0); // Reset to black
      pdf.setFontSize(12);

      // Add customer information
      pdf.text(`Customer Name: ${formData.firstName} ${formData.lastName}`, 10, yPosition);
      yPosition += 10;
      pdf.text(`Phone: ${formData.phone}`, 10, yPosition);
      yPosition += 10;
      pdf.text(`Email: ${formData.email}`, 10, yPosition);
      yPosition += 10;
      pdf.text(`Address: ${formData.address}`, 10, yPosition);
      yPosition += 10;

      if (formData.projectAddress) {
        pdf.text(`Project Address: ${formData.projectAddress}`, 10, yPosition);
        yPosition += 10;
      }

      pdf.text(`City: ${formData.city}`, 10, yPosition);
      yPosition += 10;
      pdf.text(`State: ${formData.state}`, 10, yPosition);
      yPosition += 10;
      pdf.text(`ZIP: ${formData.zip}`, 10, yPosition);
      yPosition += 10;

      pdf.setFontSize(16);
      pdf.setTextColor(0, 128, 255); // Blue color
      pdf.text(`Selected Service: ${formData.serviceType}`, 10, yPosition);
      yPosition += 10;

      // Conditional rendering for interior and exterior services
      if (formData.serviceType === "interior") {
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0); // Black color
        pdf.text("Interior Services Selected:", 10, yPosition);
        yPosition += 10;

        interiorFields.forEach((field) => {
          const includeField = formData[`include_${field.key}`];
          const paintOptions = [];

          if (formData[`paint_${field.key}_wall`]) paintOptions.push("Wall");
          if (formData[`paint_${field.key}_base`]) paintOptions.push("Base");
          if (formData[`paint_${field.key}_ceiling`]) paintOptions.push("Ceiling");
          if (formData[`paint_${field.key}_closet`]) paintOptions.push("Closet");
          if (formData[`paint_${field.key}_door`]) paintOptions.push("Door");

          pdf.text(`${field.name}: ${includeField}`, 10, yPosition);
          yPosition += 10;
          pdf.text(`Paint Options: ${paintOptions.join(", ")}`, 10, yPosition);
          yPosition += 10;
        });
      } else if (formData.serviceType === "exterior") {
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0); // Black color
        pdf.text("Exterior Services Selected:", 10, yPosition);
        yPosition += 10;

        exteriorFields.forEach((field) => {
          const includeField = formData[`include_${field.key}`];
          pdf.text(`${field.name}: ${includeField}`, 10, yPosition);
          yPosition += 10;
        });

        // Add repair options if selected
        pdf.text("Repair Options:", 10, yPosition);
        yPosition += 10;
        const repairs = [];
        if (formData.repair_siding) repairs.push("Siding");
        if (formData.repair_facial) repairs.push("Facial");
        if (formData.repair_trim) repairs.push("Trim");
        if (formData.repair_soffits) repairs.push("Soffits");
        if (formData.repair_na) repairs.push("N/A");

        pdf.text(repairs.join(", "), 10, yPosition);
        yPosition += 10;
      }

      // Add the note field, if available
      if (formData.note) {
        pdf.setFontSize(14);
        pdf.setTextColor(0, 128, 0); // Green color
        pdf.text("Additional Notes:", 10, yPosition);
        yPosition += 10;

        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0); // Black color
        pdf.text(formData.note, 10, yPosition);
        yPosition += 10;
      }

      // Generate the PDF Blob
      const pdfBlob = pdf.output("blob");

      // Upload the PDF to Cloudinary
      const pdfUrl = await uploadPdfToCloudinary(pdfBlob);

      if (!pdfUrl) {
        toast.error("Failed to upload PDF.");
        return;
      }

      console.log("PDF uploaded to Cloudinary:", pdfUrl); // Confirm the upload

      // Prepare email template parameters
      const templateParams = {
        customer_name: formData.firstName,
        to_email: formData.email,
        pdf_url: pdfUrl, // Include the uploaded PDF URL
      };

      // Send email with the PDF URL
      await sendEmail(templateParams);
    } catch (error) {
      console.error("Error generating or sending PDF:", error);
      toast.error("Failed to send the PDF.");
    }
  };

  return (
    <Container className="my-5" ref={pageRef}>

      <Row className="justify-content-center">
        <Col md={10}>
          <div
            className="p-4 rounded booking-form"
            style={{
              background: `linear-gradient(45deg, 
              rgba(255, 0, 0, 0.3) 0%,    
              rgba(255, 255, 0, 0.3) 25%, 
              rgba(0, 0, 255, 0.3) 50%,   
              rgba(0, 128, 0, 0.3) 75%    
            )`,
            }}
          >
            <h2 className="text-center mb-4 fw-bold" style={{ color: "black" }}>
              Book Your Service Now
            </h2>
            <Form onSubmit={handleSubmit(onSubmit)}>
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
                        onChange={(phone) => setPhone(phone)}
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
                        {...register("city", { required: "City is required" })}
                      />
                      <ErrorMessage error={errors.city} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="formState">
                      <Form.Label>Your State / Province / Region</Form.Label>
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

              <Form.Group controlId="formServices" className="my-3">
                <Form.Label>What Services You Want</Form.Label>
                <div>
                  <Form.Check
                    inline
                    type="radio"
                    label="Interior"
                    value="interior"
                    checked={serviceType === "interior"}
                    onChange={handleServiceTypeChange}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    label="Exterior"
                    value="exterior"
                    checked={serviceType === "exterior"}
                    onChange={handleServiceTypeChange}
                  />
                </div>
                <ErrorMessage error={errors.service} />
              </Form.Group>

              {/* Dynamically render fields based on selected service type */}
              <div id="interior-services">
                {serviceType === "interior" &&
                  interiorFields.map((field) => (
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

              <div id="exterior-services">
                {serviceType === "exterior" &&
                  exteriorFields.map((field) => (
                    <ExteriorField
                      key={field?.key}
                      field={field}
                      register={register}
                      errors={errors}
                    />
                  ))}

                {/* Conditionally render the Repair field for exterior */}
                {serviceType === "exterior" && (
                  <Form.Group controlId="formRepair">
                    <Form.Label className="fw-bold">Repair</Form.Label>
                    <div>
                      <Form.Check
                        inline
                        label="Siding"
                        type="checkbox"
                        {...register("repair_siding", { required: true })}
                      />
                      <Form.Check
                        inline
                        label="Facial"
                        type="checkbox"
                        {...register("repair_facial", { required: true })}
                      />
                      <Form.Check
                        inline
                        label="Trim"
                        type="checkbox"
                        {...register("repair_trim", { required: true })}
                      />
                      <Form.Check
                        inline
                        label="Soffits"
                        type="checkbox"
                        {...register("repair_soffits", { required: true })}
                      />
                      <Form.Check
                        inline
                        label="N/A"
                        type="checkbox"
                        {...register("repair_na", { required: true })}
                      />
                      {errors.repair_siding && !watch("repair_siding") && (
                        <p className="text-danger">
                          Please select at least one repair option.
                        </p>
                      )}
                    </div>
                  </Form.Group>
                )}
              </div>

              {/* Conditionally render the Note field for both interior and exterior */}
              <div id="additional-notes">
                <Form.Group controlId="formNote" className="mt-4">
                  <Form.Label className="fw-bold">Note</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    style={{ backgroundColor: "white" }}
                    {...register("note")}
                    placeholder="Add additional information here"
                  />
                </Form.Group>
              </div>

              <Button
                className={`${styles.button} mt-4 w-100 py-2`}
                type="submit"
              >
                {loading ? 'Processing...':'Submit'}
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default BookingForm;

const InteriorField = ({
  field,
  register,
  errors,
  watch,
  isSubmitted,
}: any) => {
  // Watch the checkbox values to validate that at least one is selected
  const paintWall = watch(`paint_${field?.key}_wall`);
  const paintBase = watch(`paint_${field?.key}_base`);
  const paintCeiling = watch(`paint_${field?.key}_ceiling`);
  const paintCloset = watch(`paint_${field?.key}_closet`);
  const paintDoor = watch(`paint_${field?.key}_door`);

  const isAtLeastOneSelected =
    paintWall || paintBase || paintCeiling || paintCloset || paintDoor;

  return (
    <div className="mb-4">
      <Form.Label className="fw-bold">{field?.name}</Form.Label>

      <Row>
        {/* First Column for "Include" Yes/No */}
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
              {...register(`include_${field?.key}`, { required: true })}
            />
            <Form.Check
              inline
              label="No"
              type="radio"
              value="No"
              {...register(`include_${field?.key}`, { required: true })}
            />
            {errors[`include_${field?.key}`] && (
              <p className="text-danger">Required</p>
            )}
          </div>
        </Col>

        {/* Second Column for "Paint Code" */}
        <Col md={6}>
          <p className="p-0 m-0 fw-bold text-secondary">
            Paint Code ({field?.name})
          </p>
          <div>
            <Form.Check
              inline
              label="Wall"
              type="checkbox"
              {...register(`paint_${field?.key}_wall`)}
            />
            <Form.Check
              inline
              label="Base"
              type="checkbox"
              {...register(`paint_${field?.key}_base`)}
            />
            <Form.Check
              inline
              label="Ceiling"
              type="checkbox"
              {...register(`paint_${field?.key}_ceiling`)}
            />
            <Form.Check
              inline
              label="Closet"
              type="checkbox"
              {...register(`paint_${field?.key}_closet`)}
            />
            <Form.Check
              inline
              label="Door"
              type="checkbox"
              {...register(`paint_${field?.key}_door`)}
            />
          </div>
          {/* Validation for at least one checkbox selection, only show error after submit */}
          {!isAtLeastOneSelected && isSubmitted && (
            <p className="text-danger">
              Please select at least one Paint Code option.
            </p>
          )}
        </Col>
      </Row>
    </div>
  );
};

function ExteriorField({ field, register, errors }: any) {
  return (
    <div className="mb-4">
      <Row>
        {/* first colmun for title  */}
        <Col md={6}>
          <Form.Label className="fw-bold text-end">{field?.name}</Form.Label>
        </Col>
        {/* second Column for "Include" Yes/No */}
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
              {...register(`include_${field?.key}`, { required: true })}
            />
            <Form.Check
              inline
              label="No"
              type="radio"
              value="No"
              {...register(`include_${field?.key}`, { required: true })}
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
