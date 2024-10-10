import React, { useContext, useRef, useState } from "react";
import AppContext from "../../utils/hooks/createContext";
import { useRouter } from "next/navigation";
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useColorContext } from "../../contexts/ColorContext";
import { faCopy, faPlus, faUpload } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import {
  IoIosCloudDownload,
  IoIosRedo,
  IoIosUndo,
  IoMdImage,
} from "react-icons/io";
import texturedata from "../../utils/texturedata.json";
import {
  onnxMaskToImage,
  loadNpyTensor,
  loadNpyTensor1,
  convertURLtoFile,
  convertImageEleToData,
  imageDataToImage,
  scaleTexture,
  downloadImage,
  processTexture,
} from "../../utils/helpers/maskUtils";
import {
  faFacebook,
  faLinkedin,
  faTwitter,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import { FaImage, FaLongArrowAltRight, FaShare } from "react-icons/fa";
import { RxReset } from "react-icons/rx";
import { MdCompare, MdOutlineChangeCircle } from "react-icons/md";
import { Capacitor } from "@capacitor/core";
import axios from "axios";
import { Share } from "@capacitor/share";

function VisualizeRoom({
  nextStep,
  prevStep,
  moveToStep,
  initialMasks,
  maskedImageWithColors,
  setMaskedImageWithColors,
}: any) {
  const {
    clicks: [clicks],
    image: [image, setImage],
    maskImg: [maskImg, setMaskImg],
    color: [color, setColor],
    error: [error, setError],
    texture: [texture, setTexture],
    initialImage: [initialImage, setInitialImage],
  } = useContext(AppContext)!;

  const { selectedColors } = useColorContext(); // Use the context

  const [selectedColor, setSelectedColor] = useState("");
  const [clearSignal, setClearSignal] = useState(false);
  const [showOffcanvas, setShowOffcanvas] = useState<boolean>(false);
  const handleShowOffCanvas = () => setShowOffcanvas(true);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [shareURL, setShareURL] = useState<string>("");
  const [textureFile, setTextureFile] = useState<any>(null);
  const textureFileRef = useRef<HTMLInputElement>(null);

  const handleCloseOffCanvas = () => setShowOffcanvas(false);
  const handleCloseShareModal = () => setShowShareModal(false);
  const handleShowShareModal = () => setShowShareModal(true);
  const handleShowLoader = () => setShowLoader(true);
  const handleCloseLoader = () => setShowLoader(false);

  // Function to handle the button click and trigger mask clearing
  const handleClearMasks = () => {
    setClearSignal(true);
    setTimeout(() => setClearSignal(false), 100); // Reset the signal after a short delay
  };

  const handleTextureClick = (texture: any) => {
    // load image
    if (!image) return;
    try {
      const img = document.createElement("img"); // create a new image object
      img.src = texture.url;
      img.onload = () => {
        scaleTexture(image, img).then((scaledTexture) => {
          if (!scaledTexture) return;
          if (scaledTexture instanceof HTMLImageElement) {
            setTexture(scaledTexture);
            toast.success("Texture Selected");
            handleCloseOffCanvas();
          }
          setColor(null);
        });
      };
    } catch (error) {
      console.log(error);
    }
  };

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

  // Function to trigger download of the image using the base64 stored in maskedImageWithColors
  // const downloadImage = () => {
  //   if (maskedImageWithColors) {
  //     const link = document.createElement("a");
  //     link.href = maskedImageWithColors; // Use the base64 image from maskedImageWithColors
  //     link.download = "masked_image.png"; // Set the filename for the downloaded image
  //     link.click(); // Programmatically click the link to trigger the download
  //   } else {
  //     console.error("No image available for download");
  //   }
  // };

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

  // Function to create the tooltip
  const showTooltip = (msg: string) => (
    <Tooltip id="button-tooltip">{msg}</Tooltip>
  );

  return (
    <>
      <div className="colorvisualiser__container container-fluid m-0 p-0 pt-5 md:pt-0">
        <div className="row m-0 p-0 align-items-center">
          {/* left side  */}
          <div className="col-12 col-lg-8 colorvisualiser__container__left d-flex justify-content-center">
            <ImageMaskOverlay
              imgSrc={image?.src}
              maskData={initialMasks}
              selectedColor={selectedColor}
              clearMasksSignal={clearSignal}
              setDownloadableImage={setMaskedImageWithColors}
            />
          </div>

          {/* right side  */}
          <div className="col-12 col-lg-4 colorvisualiser__container__right mt-3 mt-lg-0 ">
            {/* place order button  */}
            <div className="colorvisualiser__tools_container mb-4">
              <button
                className="w-100 btn btn-primary"
                type="button"
                onClick={nextStep}
              >
                Order Paints <FaLongArrowAltRight className="fs-3 ms-2" />
              </button>
            </div>

            {/* clear selected paints */}
            {/* <div className="colorvisualiser__tools_container mb-4 text-center mt-5">
              <button
                className="w-48 btn btn-secondary me-2"
                type="button"
                onClick={handleClearMasks}
              >
                Clear paints
              </button>
              <button
                className="w-48 btn btn-success mt-2 mt-md-0"
                type="button"
                onClick={() => moveToStep(0)}
              >
                Change Image
              </button>
            </div> */}

            {/* tools section  */}
            <div className="colorvisualiser__tools_container mb-4">
              <Card
                className="border-2 shadow-sm"
                data-intro="Tools where you can undo , redo , reset , compare, download and share your image"
                data-step="1"
              >
                <Card.Body className="d-flex   justify-content-between align-items-center ">
                  {/* <Button
                  className="colorvisualiser__button"
                  // onClick={handleUndo}
                >
                  <IoIosUndo size={20} />
                </Button> */}
                  {/* <Button
                  className="colorvisualiser__button"
                  // onClick={handleRedo}
                >
                  <IoIosRedo size={20} />
                </Button> */}
                  {/* <Button
                  className="colorvisualiser__button"
                  // onClick={handleShowSlider}
                >
                  <MdCompare size={20} />
                </Button> */}

                  {/* Clear Masks Button */}
                  <OverlayTrigger
                    placement="top"
                    overlay={showTooltip("Clear colors")} // Directly pass the tooltip element
                  >
                    <Button
                      className="colorvisualiser__button"
                      onClick={handleClearMasks}
                    >
                      <RxReset size={20} />
                    </Button>
                  </OverlayTrigger>

                    {/* change image  */}
                  <OverlayTrigger
                    placement="top"
                    overlay={showTooltip("Change Image")} // Directly pass the tooltip element
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

                  {/* Download image */}
                  <OverlayTrigger
                    placement="top"
                    overlay={showTooltip("Download Image")} // Directly pass the tooltip element
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

                  {/* Share image */}
                  <OverlayTrigger
                    placement="top"
                    overlay={showTooltip("Share Image")} // Directly pass the tooltip element
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

            {/* paint selection section  */}
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
                        }`} // Add 'selected' class for the selected color
                        key={index}
                        style={{
                          backgroundColor: color.hex,
                          border: isSelected ? "3px solid #000" : "none", // Add border for selected color
                          boxShadow: isSelected
                            ? "0 0 10px rgba(0,0,0,0.5)"
                            : "none", // Add shadow for selected color
                          transform: isSelected ? "scale(1.1)" : "scale(1)", // Slightly enlarge selected color button
                          transition: "all 0.2s ease", // Smooth transition for effects
                        }}
                        onClick={() => {
                          setColor(color.hex);
                          setSelectedColor(color.hex);
                          toast.success("Color Selected");
                          setTexture(null);
                        }}
                      ></Button>
                    );
                  })}

                  <Button
                    className="colorvisualiser__color_addbutton"
                    onClick={prevStep}
                    data-intro="You can also add any color from color pallete"
                    data-step="3"
                  >
                    <FontAwesomeIcon icon={faPlus} size="2x" />
                  </Button>
                </Card.Body>
              </Card>
            </div>

            {/* texture selection section  */}
            {/* <div className="colorvisualiser__texture_container">
              <Card className="border-2 shadow-sm">
                <Card.Title className="text-center fw-bold mt-2">
                  Texture
                </Card.Title>
                <Card.Body className="d-flex flex-wrap gap-2 justify-content-center align-items-center">
                  <Button
                    className="p-0  border-0"
                    style={{ backgroundColor: "#fff" }}
                  >
                    {texture ? (
                      <Image
                        src={texture.src}
                        className="colorvisualiser__currtexture_button"
                        alt="Texture"
                        width={90}
                        height={90}
                        data-intro="Selected Texture will be shown here"
                        data-step="4"
                      />
                    ) : (
                      <IoMdImage
                        size={90}
                        style={{ color: "#000" }}
                        data-intro="Selected Texture will be shown here"
                        data-step="4"
                      />
                    )}
                  </Button>
                  {texturedata
                    .slice(0, 2)
                    .map((texture: any, index: number) => {
                      return (
                        <Button
                          className="p-0 border-0 colorvisualiser__texture_button"
                          key={index}
                          onClick={() => handleTextureClick(texture)}
                        >
                          <Image
                            src={texture.url}
                            alt="Texture"
                            width={90}
                            height={90}
                          />
                        </Button>
                      );
                    })}

                  <Button
                    className=" border-0 colorvisualiser__texture_button"
                    onClick={handleShowOffCanvas}
                    data-intro="Have any texture in mind ? You can upload it here"
                    data-step="5"
                  >
                    <FontAwesomeIcon icon={faPlus} size="2x" />
                  </Button>
                </Card.Body>
              </Card>
            </div> */}
          </div>
        </div>
      </div>

      {/* share modal  */}
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

      {/* texture selection modal  */}
      <Offcanvas
        show={showOffcanvas}
        onHide={handleCloseOffCanvas}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Texture</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Card className="border-2 shadow-sm p-0 ">
            <Card.Body className="d-flex flex-wrap gap-1 justify-content-center p-1">
              {texturedata.slice(2).map((texture: any, index: number) => {
                return (
                  <Button
                    className="p-0 border-0 colorvisualiser__texture_button"
                    key={index}
                    onClick={() => handleTextureClick(texture)}
                  >
                    <Image
                      src={texture.url}
                      alt="Texture"
                      width={90}
                      height={90}
                    />
                  </Button>
                );
              })}
            </Card.Body>
          </Card>
          <div className="uploadimage">
            <div className=" mt-3 ">
              <h4 className=" fw-bold">Upload Texture</h4>
              <div>
                <ul>
                  <li>Max allowed size 1 MB</li>
                  <li>Will Auto Resize to Default size</li>
                </ul>
              </div>
            </div>
            <div className="previewimage mt-3 text-center">
              {textureFile ? (
                <Image
                  src={textureFile.src}
                  className="img-fluid"
                  alt="Texture"
                  width={300}
                  height={300}
                />
              ) : (
                <FaImage
                  className=" colorvisualiser__color_button"
                  style={{ color: "#000" }}
                />
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              title="Upload Image"
              ref={textureFileRef}
              className="mt-3 d-none"
              onChange={(e) => {
                if (e.target.files) {
                  const file = e.target.files[0];
                  const image = document.createElement("img");
                  image.src = URL.createObjectURL(file);
                  image.onload = () => {
                    setTextureFile(image);
                  };
                }
              }}
            />
            <div className="d-flex justify-content-center align-items-center flex-wrap gap-2">
              <Button
                className="mt-3"
                onClick={async (e) => {
                  textureFileRef.current?.click();
                }}
              >
                <FontAwesomeIcon icon={faUpload} size="1x" /> Upload Image
              </Button>
              <Button
                className="mt-3"
                onClick={() => {
                  processTexture(textureFile, image).then((texture) => {
                    if (texture instanceof HTMLImageElement) {
                      setTexture(texture);
                      setColor(null);
                      toast.success("Texture Selected");
                      handleCloseOffCanvas();
                    }
                  });
                }}
              >
                Select Texture
              </Button>
            </div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default VisualizeRoom;
