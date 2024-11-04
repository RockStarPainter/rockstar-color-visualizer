/* eslint-disable */

import React, { useContext, useState } from "react";
import {
  Button,
  Container,
  Row,
  Col,
  Modal,
  Form,
  OverlayTrigger,
  Card,
  Tooltip,
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import Image from "next/image"; // For selected image
import { useColorContext } from "../../contexts/ColorContext";
import AppContext from "../../utils/hooks/createContext";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { FaLongArrowAltRight, FaShare } from "react-icons/fa";
import { IoIosCloudDownload } from "react-icons/io";
import { Capacitor } from "@capacitor/core";
import axios from "axios";
import { Share } from "@capacitor/share";
import {
  faFacebook,
  faLinkedin,
  faTwitter,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import FeedbackToast from "../../components/shared/FeedbackToast";

const OrderPaints = ({ nextStep, maskedImageWithColors }: any) => {
  const { selectedColors } = useColorContext(); // Fetch the selected colors from context
  const [showModal, setShowModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [shareURL, setShareURL] = useState<string>("");

  const router = useRouter();

  const {
    clicks: [, setClicks],
    image: [image],
    maskImg: [maskImg],
    color: [color],
    texture: [texture],
  } = useContext(AppContext)!;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm(); // react-hook-form

  // Function to open/close the modal
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleShowShareModal = () => setShowShareModal(true);
  const handleShowLoader = () => setShowLoader(true);
  const handleCloseLoader = () => setShowLoader(false);
  const handleCloseShareModal = () => setShowShareModal(false);

  // Handle form submission
  const onSubmit = (data: any) => {
    console.log(data); // Handle the form submission logic
    toast("Order submitted");
    handleCloseModal();
    nextStep();
    router.push("/");
  };

  // Function to trigger download of the image using the base64 stored in maskedImageWithColors
  const downloadImage = () => {
    if (maskedImageWithColors) {
      const link = document.createElement("a");
      link.href = maskedImageWithColors; // Use the base64 image from maskedImageWithColors
      link.download = "masked_image.png"; // Set the filename for the downloaded image
      link.click(); // Programmatically click the link to trigger the download
    } else {
      console.error("No image available for download");
    }
  };

  // Function to share image
  const shareImage = async () => {
    // Check if the platform is mobile or web
    if (
      Capacitor.getPlatform() === "android" ||
      Capacitor.getPlatform() === "ios"
    ) {
      const formData = new FormData();

      // Convert base64 data to a Blob for Cloudinary upload
      const blob = await (await fetch(maskedImageWithColors)).blob();
      formData.append("file", blob); // Append the blob to form data
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
      );
      formData.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUDNAME!);

      // Upload to Cloudinary
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUDNAME}/image/upload`,
        formData
      );
      const data = await res.data;

      // Share the image using native sharing
      await Share.share({
        title: "Rockstar Visualizer",
        text: "Check out this Room Image from rockstar",
        url: data.url,
        dialogTitle: "Share with loved ones",
      })
        .then(() => {
          console.log("Share successful");
        })
        .catch((e) => {
          console.log(e);
        });
      return;
    } else if (Capacitor.getPlatform() === "web") {
      handleShowShareModal();
      handleShowLoader();

      const formData = new FormData();

      // Convert base64 to Blob
      const blob = await (await fetch(maskedImageWithColors)).blob();
      formData.append("file", blob); // Append the blob to form data
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
      formData.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUDNAME!);

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUDNAME}/image/upload`,
        formData
      );
      const data = await res.data;

      await handleCloseLoader();
      await setShareURL(data.url);
    }
    // await handleCloseShareModal();
  };

  // Function to create the tooltip
  const showTooltip = (msg: string) => (
    <Tooltip id="button-tooltip">{msg}</Tooltip>
  );

  return (
    <Container fluid className="order-page py-4 bg-white">

      <FeedbackToast/>

      <Row>
        {/* Left Sidebar for Selected Colors */}
        <Col xs={12} md={4} className="order-colors-section mb-4 mb-md-0">
          <div className="bg-light p-3 h-100">
            {/* "Save Your Order" button */}
            <Row className="mb-5">
              <Col>
                <Button
                  variant="primary"
                  onClick={() => router.push('/book-now')}
                  className="w-100"
                >
                  Save Your Order <FaLongArrowAltRight className="fs-3 ms-2" />
                </Button>
              </Col>
            </Row>

            <div className="colorvisualiser__tools_container mb-4">
              <Card className="border-2 shadow-sm">
                <Card.Body className="d-flex justify-content-center gap-3 align-items-center">
                  {/* Download Image */}
                  <OverlayTrigger
                    placement="top"
                    overlay={showTooltip("Download Image")}
                  >
                    <Button
                      className="colorvisualiser__button"
                      onClick={() => {
                        downloadImage();
                        toast.success("Image Downloaded");
                      }}
                    >
                      <IoIosCloudDownload size={20} />
                    </Button>
                  </OverlayTrigger>

                  {/* Share Image */}
                  <OverlayTrigger
                    placement="top"
                    overlay={showTooltip("Share Image")}
                  >
                    <Button
                      className="colorvisualiser__button"
                      onClick={shareImage}
                    >
                      <FaShare size={20} />
                    </Button>
                  </OverlayTrigger>
                </Card.Body>
              </Card>
            </div>

            <h5 className="fw-bold">Selected Colors</h5>
            <ul className="list-group">
              {selectedColors.length > 0 ? (
                selectedColors.map((color, index) => (
                  <li
                    key={index}
                    className="list-group-item d-flex justify-content-between align-items-center mb-2"
                    style={{ backgroundColor: color.hex, color: "#fff" }}
                  >
                    <div>
                      <span>{color.name}</span>
                      <br />
                      <small>{color.code}</small>
                    </div>
                  </li>
                ))
              ) : (
                <li className="list-group-item">No colors selected.</li>
              )}
            </ul>
          </div>
        </Col>

        {/* Right Side for Selected Image */}
        <Col xs={12} md={8} className="order-image-section">
          <div className="image-wrapper">
            {/* Assuming you have a selected image, replace the src with dynamic image source */}
            <Image
              src={maskedImageWithColors || image || ''} // Replace with dynamic image source
              alt="Selected Room Design"
              layout="responsive"
              width={700}
              height={400}
              className="img-fluid"
            />
          </div>
        </Col>
      </Row>

      {/* Order Form Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-center w-100">Book your service Now</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "white" }}>
          <Form onSubmit={handleSubmit(onSubmit)}>
            {/* First Name */}
            <Form.Group className="mb-3" controlId="formFirstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                {...register("firstName", {
                  required: "First name is required",
                })}
                placeholder="Enter your first name"
                isInvalid={!!errors.firstName}
              />
              <Form.Control.Feedback className="text-danger" type="invalid">
                <span style={{ color: "red !important" }}>
                  {errors?.firstName?.message?.toString() || ""}
                </span>
              </Form.Control.Feedback>
            </Form.Group>

            {/* Last Name */}
            <Form.Group className="mb-3" controlId="formLastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                {...register("lastName", { required: "Last name is required" })}
                placeholder="Enter your last name"
                isInvalid={!!errors.lastName}
              />
              <Form.Control.Feedback className="text-danger" type="invalid">
                <span style={{ color: "red !important" }}>
                  {errors.lastName?.message?.toString() || ""}
                </span>
              </Form.Control.Feedback>
            </Form.Group>

            {/* Email */}
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: "Enter a valid email address",
                  },
                })}
                placeholder="Enter your email"
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback className="text-danger" type="invalid">
                <span style={{ color: "red !important" }}>
                  {errors.email?.message?.toString() || ""}
                </span>
              </Form.Control.Feedback>
            </Form.Group>

            {/* Where do you prefer to buy PPG Paints? */}
            <Form.Group className="mb-3" controlId="formBuyPreference">
              <Form.Label>Where do you prefer to buy PPG Paints?</Form.Label>
              <Form.Control
                as="select"
                {...register("buyPreference", {
                  required: "Please select your buying preference",
                })}
                isInvalid={!!errors.buyPreference}
              >
                <option value="">Select an option</option>
                <option value="Independent Dealer">Independent Dealer</option>
                <option value="PPG Paint Store">PPG Paint Store</option>
                <option value="The Home Depot">The Home Depot</option>
              </Form.Control>
              <Form.Control.Feedback className="text-danger" type="invalid">
                <span style={{ color: "red !important" }}>
                  {errors?.buyPreference?.message?.toString() || ""}
                </span>
              </Form.Control.Feedback>
            </Form.Group>

            {/* Who are you? */}
            <Form.Group className="mb-3" controlId="formWhoAreYou">
              <Form.Label>Who are you?</Form.Label>
              <Form.Control
                as="select"
                {...register("whoAreYou", {
                  required: "Please select who you are",
                })}
                isInvalid={!!errors.whoAreYou}
              >
                <option value="">Select an option</option>
                <option value="Homeowner">Homeowner</option>
                <option value="Professional">Professional</option>
              </Form.Control>
              <Form.Control.Feedback className="text-danger" type="invalid">
                <span style={{ color: "red !important" }}>
                  {errors.whoAreYou?.message?.toString() || ""}
                </span>
              </Form.Control.Feedback>
            </Form.Group>

            {/* Country */}
            <Form.Group className="mb-3" controlId="formCountry">
              <Form.Label>Country</Form.Label>
              <Form.Control
                as="select"
                {...register("country", {
                  required: "Please select your country",
                })}
                isInvalid={!!errors.country}
              >
                <option value="">Select a country</option>
                <option value="USA">USA</option>
                <option value="Canada">Canada</option>
                <option value="UK">UK</option>
              </Form.Control>
              <Form.Control.Feedback className="text-danger" type="invalid">
                <span style={{ color: "red !important" }}>
                  {errors.country?.message?.toString() || ""}
                </span>
              </Form.Control.Feedback>
            </Form.Group>

            <div className="text-center">
              <Button variant="primary" type="submit">
                Submit Order
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Share Modal */}
      <Modal show={showShareModal} centered onHide={handleCloseShareModal}>
        <Modal.Body style={{ backgroundColor: "white" }}>
          {/* Show loader */}
          {showLoader ? (
            <div className="d-flex justify-content-center align-items-center fw-bold mt-2">
              Generating Image URL
              <div className="spinner-border ms-2 " role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              <div className=" d-flex gap-4 justify-content-center align-items-center">
                <label className="fw-bold " htmlFor="shareURL">
                  Share URL
                </label>
                <div className="colorvisualiser__copylink position-relative">
                  <input
                    id="shareURL"
                    type="text"
                    alt="Share URL"
                    className="form-control d-inline"
                    value={shareURL}
                    readOnly
                  />
                </div>
              </div>
              <div className="colorvisualiser__share d-flex gap-2 justify-content-around align-items-center mt-3">
                <div
                  className="colorvisualiser__share__icon"
                  onClick={() => {
                    window.open(
                      `https://www.facebook.com/sharer/sharer.php?u=${shareURL}`,
                      "_blank"
                    );
                  }}
                >
                  <FontAwesomeIcon icon={faFacebook} size="2x" />
                </div>
                <div
                  className="colorvisualiser__share__icon"
                  onClick={() => {
                    window.open(
                      `https://twitter.com/intent/tweet?url=${shareURL}`,
                      "_blank"
                    );
                  }}
                >
                  <FontAwesomeIcon icon={faTwitter} size="2x" />
                </div>
                <div
                  className="colorvisualiser__share__icon"
                  onClick={() => {
                    window.open(`tg://msg_url?url=${shareURL}`);
                  }}
                >
                  <FontAwesomeIcon icon={faLinkedin} size="2x" />
                </div>
                <div
                  className="colorvisualiser__share__icon"
                  onClick={() => {
                    window.open(
                      `https://api.whatsapp.com/send?text=${shareURL}`,
                      "_blank"
                    );
                  }}
                >
                  <FontAwesomeIcon icon={faWhatsapp} size="2x" />
                </div>
                <div className="colorvisualiser__share__clipboard">
                  <div
                    className="colorvisualiser__copy_button"
                    onClick={async () => {
                      if (navigator.clipboard) {
                        await navigator.clipboard.writeText(shareURL);
                        toast.success("Copied to Clipboard");
                      }
                    }}
                  >
                    <FontAwesomeIcon icon={faCopy} size="2x" />
                  </div>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Custom Styles */}
      <style jsx>{`
        .order-page {
          min-height: 100vh;
        }
        .order-colors-section {
          border-right: 1px solid #e0e0e0;
        }
        .order-image-section {
          padding-left: 30px;
        }
        .image-wrapper {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
        }
        .list-group-item {
          border: 0;
          font-size: 16px;
          border-radius: 8px;
          padding: 10px 20px;
        }
        .order-image-section img {
          border-radius: 8px;
        }

        .modal-title {
          text-align: center;
          width: 100%;
        }

        @media (max-width: 767px) {
          .order-colors-section {
            border-right: none;
            border-bottom: 1px solid #e0e0e0;
          }
          .order-image-section {
            padding-left: 0;
          }
        }

        .text-center {
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}</style>
    </Container>
  );
};

export default OrderPaints;
