import React, { useContext, useEffect, useRef, useState } from "react";
import { Container, Modal } from "react-bootstrap";
import Image from "next/image";
import axios from "axios";
import FileUpload from "../../components/FileUpload/FileUpload";
import AppContext from "../../utils/hooks/createContext";
import { handleImageScale } from "../../utils/helpers/scaleHelper";
import undoRedo from "../../utils/helpers/linkedlist";
import { modelScaleProps } from "../../utils/helpers/Interfaces";
import { toast } from "react-toastify";
import { styled } from "@mui/material/styles";
import styles from "../../styles/Home.module.css"; // Import the CSS module
import { preloadedImages } from "../../public/preloaded-images/preloadedImages";


function ImageSelection({ nextStep, setInitialMasks }: any) {
  const {
    clicks: [clicks],
    image: [image, setImage],
    maskImg: [maskImg, setMaskImg],
    color: [color, setColor],
    error: [error, setError],
    texture: [texture, setTexture],
    initialImage: [initialImage, setInitialImage],
  } = useContext(AppContext)!;

  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<any>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [type, setType] = useState<boolean>(false);
  const [modelScale, setModelScale] = useState<modelScaleProps | null>(null);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);


  const getImageEmbedding = async (file: any) => {
    handleShowModal();
    setType(false);
    const formData = new FormData();
    formData.append("file", file);
    await loadImage(file);
    await scrollTo(0, 0);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/upload/`,
        formData
      );
      setInitialMasks(JSON.parse(res?.data?.yolo_results.replace(/'/g, '"')));

      setTimeout(() => {
        handleCloseModal();
        nextStep();
      }, 1000);
    } catch (e) {
      console.log("error-message: " + (e as Error)?.message);
      console.log("error: " + e);
      handleCloseModal();
      setError(
        "Currently we are facing some issues, Try from one of our preloaded images"
      );
      setFile(null);
      setTimeout(() => {
        setError(null);
      }, 2000);
    }
  };

  const loadImage = async (imageFile: any) => {
    try {
      const img = document.createElement("img"); // create a new image object
      img.src = URL.createObjectURL(imageFile);
      img.onload = () => {
        const { height, width, samScale } = handleImageScale(img);
        setModelScale({
          height: height, // original image height
          width: width, // original image width
          samScale: samScale, // scaling factor for image which has been resized to longest side 1024
        });
        img.width = width;
        img.height = height;
        setImage(img);
        undoRedo.setImage(img);
        setInitialImage(img);
      };
    } catch (error) {
      console.log(error);
    }
  };


  const StyledTypography = styled("h1")(({ theme }) => ({
    color: "#323232",
    fontSize: "2.5rem", // Larger font size
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    textAlign: "center",
    marginBottom: theme.spacing(4),
    padding: theme.spacing(2),
    background: "linear-gradient(45deg, #719E37, #F7F7F9)", // Gradient background
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
  }));

  return (
    <div className={`${file ? "colorvisualiser" : ""} py-5 pb-5`}>
      <div className="colorvisualiser__container container py-md-2 py-lg-5">
        <div className="row justify-content-center align-items-center gap-5 gap-lg-0">
          <div className="col-12 col-lg-6 colorvisualiser__container__left ">
            <h1 className="text-center mb-4">Visualize your Home</h1>
            <video autoPlay loop muted playsInline className="w-100 img-fluid">
              <source src="/Paint_Visualizer_7becb7495b.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="col-12 col-lg-6 colorvisualiser__container__right">
            <FileUpload
              fileInput={fileInput}
              setFile={setFile}
              getEmbedding={getImageEmbedding}
            />
          </div>
        </div>

        <Container fluid className={styles.preloadedSection}>
              {/* Heading */}
              <StyledTypography>
                Try One of Our Preloaded Images
              </StyledTypography>

              

              <div className={styles.preloadedGrid}>
      {preloadedImages.map((image, index) => (
        <div
          key={index}
          onClick={() => getImageEmbedding(image)}
          className={styles.preloadedCard}
        >
          <div className={styles.preloadedImageWrapper}>
            <img
              src={image.image}
              alt={image.name}
              className={styles.preloadedImage}
            />
          </div>
          <div className={styles.preloadedCardContent}>
            <h4 className={styles.preloadedCardTitle}>{image.name}</h4>
          </div>
        </div>
      ))}
    </div>

            </Container>

      </div>

      {showModal && file && (
        <Modal
          show={showModal}
          onHide={handleCloseModal}
          centered
          backdrop="static"
        >
          <Modal.Body style={{ backgroundColor: "white", borderRadius: "5px" }}>
            <div className="d-flex justify-content-between align-items-center ps-3">
              <Image
                src={URL.createObjectURL(file)}
                alt="Uploaded Image"
                width={100}
                height={100}
                className="img-fluid"
              />
              <Image
                src="https://segment-anything.com/assets/arrow-icn.svg"
                alt="Uploaded Image"
                width={40}
                height={100}
                className="img-fluid"
              />
              <Image
                src="https://segment-anything.com/assets/icn-nn.svg"
                width={100}
                height={100}
                alt="Neural Network"
                className="img-fluid"
              />
              <Image
                src="https://segment-anything.com/assets/arrow-icn.svg"
                alt="Uploaded Image"
                width={40}
                height={80}
                className="img-fluid"
              />
              <Image
                src="https://segment-anything.com/assets/stack.svg"
                width={100}
                height={10}
                style={{
                  height: "100px",
                  width: "100px",
                }}
                className="img-fluid"
                alt="Stack"
              />
            </div>
            <div className="d-flex justify-content-center align-items-center fw-bold mt-2">
              Generating Image Embedding
              <div className="spinner-border ms-2 " role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
}

export default ImageSelection;
