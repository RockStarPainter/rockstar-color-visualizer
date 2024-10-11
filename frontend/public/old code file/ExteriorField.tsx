import React from "react";
import { Col, Form, Row } from "react-bootstrap";

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

export default ExteriorField;
