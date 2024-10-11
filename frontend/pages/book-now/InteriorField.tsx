import React from "react";
import { Col, Form, Row } from "react-bootstrap";

const InteriorField = ({ field, register, errors, watch, isSubmitted }) => {
  // Watch the checkbox values to validate that at least one is selected
  const paintWall = watch(`paint_${field.key}_wall`);
  const paintBase = watch(`paint_${field.key}_base`);
  const paintCeiling = watch(`paint_${field.key}_ceiling`);
  const paintCloset = watch(`paint_${field.key}_closet`);
  const paintDoor = watch(`paint_${field.key}_door`);

  const isAtLeastOneSelected =
    paintWall || paintBase || paintCeiling || paintCloset || paintDoor;

  return (
    <div className="mb-4">
      <Form.Label className="fw-bold">{field.name}</Form.Label>

      <Row>
        {/* First Column for "Include" Yes/No */}
        <Col md={6}>
          <p className="p-0 m-0 fw-bold text-secondary">
            Include ({field.name})
          </p>
          <div>
            <Form.Check
              inline
              label="Yes"
              type="radio"
              value="Yes"
              {...register(`include_${field.key}`, { required: true })}
            />
            <Form.Check
              inline
              label="No"
              type="radio"
              value="No"
              {...register(`include_${field.key}`, { required: true })}
            />
            {errors[`include_${field.key}`] && (
              <p className="text-danger">Required</p>
            )}
          </div>
        </Col>

        {/* Second Column for "Paint Code" */}
        <Col md={6}>
          <p className="p-0 m-0 fw-bold text-secondary">
            Paint Code ({field.name})
          </p>
          <div>
            <Form.Check
              inline
              label="Wall"
              type="checkbox"
              {...register(`paint_${field.key}_wall`)}
            />
            <Form.Check
              inline
              label="Base"
              type="checkbox"
              {...register(`paint_${field.key}_base`)}
            />
            <Form.Check
              inline
              label="Ceiling"
              type="checkbox"
              {...register(`paint_${field.key}_ceiling`)}
            />
            <Form.Check
              inline
              label="Closet"
              type="checkbox"
              {...register(`paint_${field.key}_closet`)}
            />
            <Form.Check
              inline
              label="Door"
              type="checkbox"
              {...register(`paint_${field.key}_door`)}
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

export default InteriorField;
