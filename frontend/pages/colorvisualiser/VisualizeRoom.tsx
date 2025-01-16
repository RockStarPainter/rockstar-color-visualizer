import React, { useContext, useEffect, useRef, useState } from "react";
import AppContext from "../../utils/hooks/createContext";
import DrawMasksOnLiveImage from "../../components/detection-canvas/DrawMasksOnLiveImage";
import DrawMasksOnPreloadedImage from "../../components/detection-canvas/DrawMasksOnPreloadedImage";
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
import Image from "next/image";
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
import ImageMaskComponent from "./ImageSegmentation";

function VisualizeRoom({
  nextStep,
  prevStep,
  moveToStep,
  initialMasks,
  setMaskedImageWithColors,
  isPreloaded,
}: any) {
  const {
    image: [image],
    texture: [texture, setTexture],
    color: [color, setColor],
  } = useContext(AppContext)!;

  const { selectedColors } = useColorContext();
  const [selectedColor, setSelectedColor] = useState("");
  const [clearSignal, setClearSignal] = useState(false);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const handleCloseOffCanvas = () => setShowOffcanvas(false);
  const handleShowOffCanvas = () => setShowOffcanvas(true);

  // Function to handle clearing the masks
  const handleClearMasks = () => {
    setClearSignal(true);
    setTimeout(() => setClearSignal(false), 100); // Reset the signal after a short delay
  };

  // Function to create the tooltip
  const showTooltip = (msg: string) => (
    <Tooltip id="button-tooltip">{msg}</Tooltip>
  );

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

  return (
    <>
      <div className="colorvisualiser__container container-fluid m-0 p-0 pt-5 md:pt-0">
        <div className="row m-0 p-0 align-items-center">
          {/* left side */}
          <div className="col-12 col-lg-8 colorvisualiser__container__left d-flex justify-content-center">
            {/* {isPreloaded ? (
              <DrawMasksOnPreloadedImage
                imgSrc={image?.src}
                masks={initialMasks}
                selectedColor={selectedColor}
                clearMasksSignal={clearSignal}
                setDownloadableImage={setMaskedImageWithColors} // Ensure this is passed correctly
              />
            ) : (
              <DrawMasksOnLiveImage
                imgSrc={image?.src}
                masks={initialMasks}
                selectedColor={selectedColor}
                clearMasksSignal={clearSignal}
                setDownloadableImage={setMaskedImageWithColors} // Ensure this is passed correctly
              />
            )} */}

            <ImageMaskComponent
              // selectedColor={selectedColor}
              // clearMasksSignal={clearSignal}
              // setDownloadableImage={setMaskedImageWithColors}
              selectedColor={'#006fa6'}
              clearMasksSignal={false}
              setDownloadableImage={setMaskedImageWithColors}
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
                Book your service <FaLongArrowAltRight className="fs-3 ms-2" />
              </button>
            </div>

            {/* tools section */}
            <div className="colorvisualiser__tools_container mb-4">
              <Card className="border-2 shadow-sm">
                <Card.Body className="d-flex justify-content-center gap-3 align-items-center">
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
                    onClick={prevStep}
                    data-intro="You can also add any color from color pallete"
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
    </>
  );
}

export default VisualizeRoom;
