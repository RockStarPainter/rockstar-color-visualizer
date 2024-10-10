import React, { useContext, useRef, useState } from "react";
import AppContext from "../../utils/hooks/createContext";
import ImageMaskOverlay from "../../components/detection-canvas";
import {
  Button,
  Card,
  Modal,
  Offcanvas,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { useColorContext } from "../../contexts/ColorContext";
import { IoIosCloudDownload, IoMdImage } from "react-icons/io";
import { FaShare, FaLongArrowAltRight } from "react-icons/fa";
import { RxReset } from "react-icons/rx";
import { MdOutlineChangeCircle } from "react-icons/md";
import { Capacitor } from "@capacitor/core";
import axios from "axios";
import { Share } from "@capacitor/share";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faPlus, faUpload } from "@fortawesome/free-solid-svg-icons";
import texturedata from "../../utils/texturedata.json";
import {
  faFacebook,
  faLinkedin,
  faTwitter,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";

function VisualizeRoom({
  nextStep,
  moveToStep,
  initialMasks,
  maskedImageWithColors,
  setMaskedImageWithColors,
}: any) {
  const {
    image: [image],
  } = useContext(AppContext)!;

  const { selectedColors } = useColorContext();
  const [selectedColor, setSelectedColor] = useState("");
  const [clearSignal, setClearSignal] = useState(false);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [shareURL, setShareURL] = useState<string>("");
  const [showLoader, setShowLoader] = useState<boolean>(false);

  const handleCloseOffCanvas = () => setShowOffcanvas(false);
  const handleShowOffCanvas = () => setShowOffcanvas(true);
  const handleCloseShareModal = () => setShowShareModal(false);
  const handleShowShareModal = () => setShowShareModal(true);

  // Function to handle clearing the masks
  const handleClearMasks = () => {
    setClearSignal(true);
    setTimeout(() => setClearSignal(false), 100); // Reset the signal after a short delay
  };
  const handleShowLoader = () => setShowLoader(true);
  const handleCloseLoader = () => setShowLoader(false);

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
      formData.append("upload_preset", "d5mvumcd");
      formData.append("cloud_name", "dbvxdjjpr");

      // Upload to Cloudinary
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dbvxdjjpr/image/upload",
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
      formData.append("upload_preset", "d5mvumcd");
      formData.append("cloud_name", "dbvxdjjpr");

      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dbvxdjjpr/image/upload",
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
    <>
      <div className="colorvisualiser__container container-fluid m-0 p-0 pt-5 md:pt-0">
        <div className="row m-0 p-0 align-items-center">
          {/* left side */}
          <div className="col-12 col-lg-8 colorvisualiser__container__left d-flex justify-content-center">
            <ImageMaskOverlay
              imgSrc={image?.src}
              maskData={initialMasks}
              selectedColor={selectedColor}
              clearMasksSignal={clearSignal}
              setDownloadableImage={setMaskedImageWithColors} // Ensure this is passed correctly
            />
          </div>

          {/* right side */}
          <div className="col-12 col-lg-4 colorvisualiser__container__right mt-3 mt-lg-0 ">
            {/* place order button */}
            <div className="colorvisualiser__tools_container mb-4">
              <button
                className="w-100 btn btn-primary"
                type="button"
                onClick={nextStep}
              >
                Order Paints <FaLongArrowAltRight className="fs-3 ms-2" />
              </button>
            </div>

            {/* tools section */}
            <div className="colorvisualiser__tools_container mb-4">
              <Card className="border-2 shadow-sm">
                <Card.Body className="d-flex justify-content-between align-items-center">
                  {/* Clear Masks Button */}
                  <OverlayTrigger
                    placement="top"
                    overlay={showTooltip("Clear colors")}
                  >
                    <Button
                      className="colorvisualiser__button"
                      onClick={handleClearMasks}
                    >
                      <RxReset size={20} />
                    </Button>
                  </OverlayTrigger>

                  {/* Change Image */}
                  <OverlayTrigger
                    placement="top"
                    overlay={showTooltip("Change Image")}
                  >
                    <Button
                      className="colorvisualiser__button"
                      onClick={() => {
                        moveToStep(0);
                        toast.success("You can select a new Image");
                      }}
                    >
                      <MdOutlineChangeCircle size={20} />
                    </Button>
                  </OverlayTrigger>

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

            {/* paint selection section */}
            <div className="colorvisualiser__color_container mb-4">
              <Card className="border-2 shadow-sm ">
                <Card.Title className="text-center fw-bold mt-2">
                  Select Your Paint Colors
                </Card.Title>
                <Card.Body className="d-flex flex-wrap gap-2 justify-content-center align-items-center ">
                  {selectedColors.map((color: any, index: number) => {
                    const isSelected = color.hex === selectedColor; // Check if this color is selected
                    return (
                      <Button
                        className={`colorvisualiser__color_button ${
                          isSelected ? "selected" : ""
                        }`}
                        key={index}
                        style={{
                          backgroundColor: color.hex,
                          border: isSelected ? "3px solid #000" : "none",
                          boxShadow: isSelected
                            ? "0 0 10px rgba(0,0,0,0.5)"
                            : "none",
                          transform: isSelected ? "scale(1.1)" : "scale(1)",
                          transition: "all 0.2s ease",
                        }}
                        onClick={() => {
                          setSelectedColor(color.hex);
                          toast.success("Color Selected");
                        }}
                      ></Button>
                    );
                  })}

                  <Button
                    className="colorvisualiser__color_addbutton"
                    onClick={handleShowOffCanvas}
                    data-intro="You can also add any color from color pallete"
                  >
                    <FontAwesomeIcon icon={faPlus} size="2x" />
                  </Button>
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Offcanvas for selecting textures */}
      <Offcanvas
        show={showOffcanvas}
        onHide={handleCloseOffCanvas}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Select Textures</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Card className="border-2 shadow-sm">
            <Card.Body className="d-flex flex-wrap gap-2 justify-content-center align-items-center">
              {texturedata.map((texture: any, index: number) => (
                <Button
                  className="p-0 border-0 colorvisualiser__texture_button"
                  key={index}
                >
                  <Image
                    src={texture.url}
                    alt="Texture"
                    width={90}
                    height={90}
                  />
                </Button>
              ))}
            </Card.Body>
          </Card>
        </Offcanvas.Body>
      </Offcanvas>

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
    </>
  );
}

export default VisualizeRoom;
