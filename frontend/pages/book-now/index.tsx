// BookingForm.js
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css"; // Import the CSS for react-phone-input-2

import ErrorMessage from "../../components/ErrorMessage";
import ExteriorField from "./ExteriorField";
import InteriorField from "./InteriorField";
import { exteriorFields, interiorFields } from "./FieldsData";

const BookingForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
    watch,
  } = useForm();
  const [serviceType, setServiceType] = useState("interior");
  const [phone, setPhone] = useState("");

  const onSubmit = (data) => {
    console.log({ ...data, phone });
    // You can process form submission here, like sending it to a server
  };

  const handleServiceTypeChange = (event) => {
    setServiceType(event.target.value);
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={10}>
          <div
            className="p-4 rounded booking-form"
            style={{ backgroundColor: "#7ced4a" }}
          >
            <h2 className="text-center mb-4">Book Your Service Now</h2>
            <Form onSubmit={handleSubmit(onSubmit)}>
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
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Your Email"
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
                  {...register("address", { required: "Address is required" })}
                />
                <ErrorMessage error={errors.address} />
              </Form.Group>

              <Form.Group controlId="formProjectAddress" className="my-3">
                <Form.Label>Project Address (If Different)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Project Address (If Different)"
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
                      {...register("state", { required: "State is required" })}
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
                  {...register("agree", {
                    required: "You must agree to continue",
                  })}
                />
                <ErrorMessage error={errors.agree} />
              </Form.Group>

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
              {serviceType === "interior" &&
                interiorFields.map((field) => (
                  <InteriorField
                    key={field.key}
                    field={field}
                    register={register}
                    errors={errors}
                    watch={watch}
                    isSubmitted={isSubmitted}
                  />
                ))}

              {serviceType === "exterior" &&
                exteriorFields.map((field) => (
                  <ExteriorField
                    key={field.key}
                    field={field}
                    register={register}
                    errors={errors}
                    watch={watch}
                    isSubmitted={isSubmitted}
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

              {/* Conditionally render the Note field for both interior and exterior */}
              <Form.Group controlId="formNote" className="mt-4">
                <Form.Label className="fw-bold">Note</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  {...register("note")}
                  placeholder="Add additional information here"
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="mt-4 w-100">
                Submit
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default BookingForm;
