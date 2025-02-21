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
import Image from "next/image";
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

interface OrderPaintsProps {
  nextStep: () => void;
  maskedImageWithColors: string;
}

const OrderPaints: React.FC<OrderPaintsProps> = ({ nextStep, maskedImageWithColors }) => {
  const { selectedColors } = useColorContext();
  const [showModal, setShowModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [shareURL, setShareURL] = useState("");

  const router = useRouter();

  const {
    clicks: [, setClicks],
    image: [image],
  } = useContext(AppContext)!;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleShowShareModal = () => setShowShareModal(true);
  const handleShowLoader = () => setShowLoader(true);
  const handleCloseLoader = () => setShowLoader(false);
  const handleCloseShareModal = () => setShowShareModal(false);

  const onSubmit = (data: any) => {
    console.log(data);
    toast("Order submitted");
    handleCloseModal();
    nextStep();
    router.push("/");
  };

  const downloadImage = () => {
    if (maskedImageWithColors) {
      const link = document.createElement("a");
      link.href = maskedImageWithColors;
      link.download = "masked_image.png";
      link.click();
    } else {
      console.error("No image available for download");
    }
  };

  const shareImage = async () => {
    if (Capacitor.getPlatform() === "android" || Capacitor.getPlatform() === "ios") {
      try {
        const formData = new FormData();
        const blob = await (await fetch(maskedImageWithColors)).blob();
        formData.append("file", blob);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
        formData.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUDNAME!);

        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUDNAME}/image/upload`,
          formData
        );
        const data = await res.data;

        await Share.share({
          title: "Rockstar Visualizer",
          text: "Check out this Room Image from rockstar",
          url: data.url,
          dialogTitle: "Share with loved ones",
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else if (Capacitor.getPlatform() === "web") {
      handleShowShareModal();
      handleShowLoader();

      try {
        const formData = new FormData();
        const blob = await (await fetch(maskedImageWithColors)).blob();
        formData.append("file", blob);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
        formData.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUDNAME!);

        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUDNAME}/image/upload`,
          formData
        );
        const data = await res.data;

        handleCloseLoader();
        setShareURL(data.url);
      } catch (error) {
        console.error("Error uploading:", error);
        handleCloseLoader();
      }
    }
  };

  const showTooltip = (msg: string) => (
    <Tooltip id="button-tooltip">{msg}</Tooltip>
  );

  return (
    <Container fluid className="order-page py-4 bg-white">
      <FeedbackToast />

      <Row>
        {/* Left Sidebar */}
        <Col xs={12} md={4} className="order-colors-section mb-4 mb-md-0">
          <div className="bg-light p-3 h-100">
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

        {/* Right Side - Image Display */}
        <Col xs={12} md={8} className="order-image-section">
          <div className="image-wrapper">
            <div className="position-relative w-100" style={{
              aspectRatio: '4/3',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              <Image
                src={maskedImageWithColors || image?.src || ''}
                alt="Selected Room Design"
                fill
                style={{
                  objectFit: 'contain',
                }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                priority
              />
            </div>
          </div>
        </Col>
      </Row>

      {/* Share Modal */}
      <Modal show={showShareModal} centered onHide={handleCloseShareModal}>
        <Modal.Body className="bg-white">
          {showLoader ? (
            <div className="d-flex justify-content-center align-items-center fw-bold mt-2">
              Generating Image URL
              <div className="spinner-border ms-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="d-flex gap-4 justify-content-center align-items-center">
                <label className="fw-bold" htmlFor="shareURL">Share URL</label>
                <div className="colorvisualiser__copylink position-relative">
                  <input
                    id="shareURL"
                    type="text"
                    className="form-control"
                    value={shareURL}
                    readOnly
                  />
                </div>
              </div>
              <div className="colorvisualiser__share d-flex gap-2 justify-content-around align-items-center mt-3">
                <div
                  className="colorvisualiser__share__icon"
                  onClick={() => {
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareURL}`, "_blank");
                  }}
                >
                  <FontAwesomeIcon icon={faFacebook} size="2x" />
                </div>
                <div
                  className="colorvisualiser__share__icon"
                  onClick={() => {
                    window.open(`https://twitter.com/intent/tweet?url=${shareURL}`, "_blank");
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
                    window.open(`https://api.whatsapp.com/send?text=${shareURL}`, "_blank");
                  }}
                >
                  <FontAwesomeIcon icon={faWhatsapp} size="2x" />
                </div>
                <div
                  className="colorvisualiser__share__clipboard"
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
            </>
          )}
        </Modal.Body>
      </Modal>

      <style jsx>{`
        .order-page {
          min-height: 100vh;
        }
        .order-colors-section {
          border-right: 1px solid #e0e0e0;
        }
        .image-wrapper {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          width: 100%;
        }
        .list-group-item {
          border: 0;
          font-size: 16px;
          border-radius: 8px;
          padding: 10px 20px;
        }
        @media (max-width: 767px) {
          .order-colors-section {
            border-right: none;
            border-bottom: 1px solid #e0e0e0;
          }
          .order-image-section {
            padding-left: 0;
            padding-top: 20px;
          }
          .image-wrapper {
            padding: 10px;
          }
        }
        .colorvisualiser__share__icon {
          cursor: pointer;
          transition: transform 0.2s;
        }
        .colorvisualiser__share__icon:hover {
          transform: scale(1.1);
        }
      `}</style>
    </Container>
  );
};

export default OrderPaints;