import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import useEmail from "../../hooks/useEmail";
import { Spinner } from "react-bootstrap";

function FeedbackToast() {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [rating, setRating] = useState(0);
  const { sendEmail, loading } = useEmail();

  // Form setup for rating modal
  const {
    register: registerRating,
    handleSubmit: handleSubmitRating,
    formState: { errors: ratingErrors },
    reset: resetRatingForm,
  } = useForm();

  // Form setup for suggestion modal
  const {
    register: registerSuggestion,
    handleSubmit: handleSubmitSuggestion,
    formState: { errors: suggestionErrors },
    reset: resetSuggestionForm,
  } = useForm();

  useEffect(() => {
    toast(
      <div
        className="d-flex flex-column align-items-center"
        style={{
          backgroundColor: "#022e97",
          color: "white",
          padding: "1rem",
          borderRadius: "8px",
          minWidth: "250px",
          textAlign: "center",
        }}
      >
        <p className="mb-3">
          Would you like to give us feedback on your experience?
        </p>
        <div className="d-flex justify-content-center">
          <button
            className="btn me-2"
            style={{
              backgroundColor: "#059f41",
              color: "white",
              padding: "0.3rem 0.8rem",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: "bold",
              border: "none",
            }}
            onClick={() => {
              toast.dismiss();
              setShowRatingModal(true); // Show rating modal on "Yes"
            }}
          >
            Yes
          </button>
          <button
            className="btn"
            style={{
              backgroundColor: "#d20609",
              color: "white",
              padding: "0.3rem 0.8rem",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: "bold",
              border: "none",
            }}
            onClick={() => {
              toast.dismiss();
              setShowSuggestionModal(true); // Show suggestion modal on "No"
            }}
          >
            No
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        icon: null,
        position: "bottom-right",
        style: {
          padding: 0,
          margin: 0,
          background: "transparent",
        },
      }
    );
  }, []);

  // Handle rating modal submission
  const onSubmitRating = async (data: any) => {
    const { name, email, contact, comments } = data;

    const templateParams = {
      to_email: process.env.NEXT_PUBLIC_ROCKSTAR_EMAIL,
      user_name: name,
      user_email: email,
      contact_number: contact,
      rating: rating,
      comments: comments,
    };

    await sendEmail(
      templateParams,
      process.env.NEXT_PUBLIC_EMAILJS_RATING_TEMPLATE_ID
    );
    setShowRatingModal(false);
    toast.success("Your rating submitted successfully!");
    resetRatingForm();
  };

  // Handle suggestion modal submission
  const onSubmitSuggestion = async (data: any) => {
    const { name, email, contact, problem } = data;

    const templateParams = {
      to_email: process.env.NEXT_PUBLIC_ROCKSTAR_EMAIL,
      user_name: name,
      user_email: email,
      contact_number: contact,
      problem: problem,
    };

    await sendEmail(
      templateParams,
      process.env.NEXT_PUBLIC_EMAILJS_PROBLEM_TEMPLATE_ID
    );
    setShowSuggestionModal(false);
    toast.success("Your problem submitted successfully!");

    resetSuggestionForm();
  };

  // Rating Modal content with react-hook-form
  const renderRatingModal = (
    <Modal show={showRatingModal} onHide={() => setShowRatingModal(false)}>
      <Modal.Header closeButton className="bg_white">
        <Modal.Title>Rate Your Experience</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg_white">
        <form onSubmit={handleSubmitRating(onSubmitRating)}>
          <div className="d-flex justify-content-center mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(star)}
                style={{
                  fontSize: "50px",
                  color: star <= rating ? "#FFD700" : "#ccc",
                  cursor: "pointer",
                }}
              >
                ★
              </span>
            ))}
          </div>
          <p className="text-center">You rated: {rating} star(s)</p>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Your name"
              {...registerRating("name", { required: "Name is required" })}
            />
            {ratingErrors.name?.message && (
              <p className="text-danger">{String(ratingErrors.name.message)}</p>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Your email"
              {...registerRating("email")}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Contact Number</label>
            <input
              type="tel"
              className="form-control"
              placeholder="Your contact number"
              {...registerRating("contact", {
                required: "Contact number is required",
              })}
            />
            {ratingErrors.contact?.message && (
              <p className="text-danger">
                {String(ratingErrors.contact.message)}
              </p>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label">Comments</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Please let us know how we can improve..."
              {...registerRating("comments")}
            ></textarea>
          </div>
          <Modal.Footer className="bg_white">
            <Button
              variant="secondary"
              onClick={() => setShowRatingModal(false)}
            >
              Close
            </Button>

            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                  &nbsp;Sending
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </Modal.Footer>
        </form>
      </Modal.Body>
    </Modal>
  );

  // Suggestion Modal content with react-hook-form
  const renderSuggestionModal = (
    <Modal
      show={showSuggestionModal}
      onHide={() => setShowSuggestionModal(false)}
    >
      <Modal.Header closeButton className="bg_white">
        <Modal.Title>We value your suggestions</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg_white">
        <form onSubmit={handleSubmitSuggestion(onSubmitSuggestion)}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Your name"
              {...registerSuggestion("name", { required: "Name is required" })}
            />
            {suggestionErrors.name?.message && (
              <p className="text-danger">
                {String(suggestionErrors.name.message)}
              </p>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Your email"
              {...registerSuggestion("email")}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Contact Number</label>
            <input
              type="tel"
              className="form-control"
              placeholder="Your contact number"
              {...registerSuggestion("contact", {
                required: "Contact number is required",
              })}
            />
            {suggestionErrors.contact?.message && (
              <p className="text-danger">
                {String(suggestionErrors.contact.message)}
              </p>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label">Problem / Suggestion</label>

            <textarea
              className="form-control"
              rows={2}
              placeholder="Please let us know how we can improve..."
              {...registerSuggestion("problem")}
            ></textarea>
          </div>
          <Modal.Footer className="bg_white">
            <Button
              variant="secondary"
              onClick={() => setShowSuggestionModal(false)}
            >
              Close
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                  &nbsp;Sending
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </Modal.Footer>
        </form>
      </Modal.Body>
    </Modal>
  );

  return (
    <>
      {renderRatingModal}
      {renderSuggestionModal}
    </>
  );
}

export default FeedbackToast;
