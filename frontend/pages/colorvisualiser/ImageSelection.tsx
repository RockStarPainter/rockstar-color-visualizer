import React, { useContext, useEffect, useRef, useState } from "react";
import { Container, Modal } from "react-bootstrap";
import axios from "axios";
import AppContext from "../../utils/hooks/createContext";
import { handleImageScale } from "../../utils/helpers/scaleHelper";
import undoRedo from "../../utils/helpers/linkedlist";
import { modelScaleProps } from "../../utils/helpers/Interfaces";
import { styled } from "@mui/material/styles";
import styles from "../../styles/Home.module.css"; // Import the CSS module
import { preloadedImages } from "../../public/preloaded-images/preloadedImages";
import FileUpload from "../../components/FileUpload/FileUpload";
import Image from "next/image";
import HowItWorksStyles from "../../styles/HowItWorks.module.css"; // Custom styles

function ImageSelection({
  nextStep,
  setInitialMasks,
  setMaskedImageWithColors,
  isPreloaded,
  setIsPreloaded,
}: any) {
  const {
    image: [image, setImage],
    error: [error, setError],
    initialImage: [initialImage, setInitialImage],
  } = useContext(AppContext)!;

  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<any>(null);
  // const [isPreloaded, setIsPreloaded] = useState<boolean>(false); // To track preloaded images
  const [preloadedImageUrl, setPreloadedImageUrl] = useState<string>(""); // Store preloaded image URL
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modelScale, setModelScale] = useState<modelScaleProps | null>(null);

  useEffect(() => {
    setMaskedImageWithColors(null);
  }, []);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // Function to handle file upload (uploaded image)
  const getImageEmbedding = async (file: any) => {
    handleShowModal();
    setIsPreloaded(() => false); // It's not a preloaded image
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sample_prediction", "false");
    await loadImage(file);
    await scrollTo(0, 0);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/upload/`,
        formData
      );

      console.log("live api masks: " + JSON.stringify(res.data));

      const data = JSON.parse(res?.data?.yolo_results.replace(/'/g, '"'));
      setInitialMasks(data?.masks);

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

  // Function to handle loading the image (same for both uploaded and preloaded)
  const loadImage = async (imageFile: any) => {
    try {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(imageFile);
      img.onload = () => {
        const { height, width, samScale } = handleImageScale(img);
        setModelScale({
          height: height,
          width: width,
          samScale: samScale,
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

  // for live  api hit Function to handle preloaded image click
  const handlePreloadedImageClick = async (image: any) => {
    handleShowModal();
    setIsPreloaded(() => true); // It's a preloaded image
    setPreloadedImageUrl(image.image); // Store the preloaded image URL

    try {
      const response = await fetch(image.image);
      const blob = await response.blob();
      const file = new File([blob], `${image.name}.jpg`, { type: blob.type });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("sample_prediction", "true");

      await loadImage(file);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/upload/`,
        formData
      );

      const data = JSON.parse(res?.data?.yolo_results.replace(/'/g, '"'));
      setInitialMasks(data?.masks);

      setTimeout(() => {
        handleCloseModal();
        nextStep();
      }, 1000);
    } catch (e) {
      console.error("Error fetching or processing preloaded image:", e);
      handleCloseModal();
      setError("Error loading preloaded image. Please try again.");
      setTimeout(() => {
        setError(null);
      }, 2000);
    }
  };

  return (
    <div className="pt-5">
      <div className="colorvisualiser__container container">
        {/* image selection  */}
        <div className="row justify-content-center align-items-center gap-5 gap-lg-0">
          <div className="col-12 p-0 col-lg-6 colorvisualiser__container__left">
            <h1 className="text-center mb-4">Visualize your Home</h1>
            <video autoPlay loop muted playsInline className="w-100 img-fluid">
              <source src="/Paint_Visualizer_7becb7495b.mp4" type="video/mp4" />
            </video>
          </div>

          {/* Right section (upload image) */}
          <div className="col-12 p-0 col-lg-6 colorvisualiser__container__right">
            <FileUpload
              fileInput={fileInput}
              setFile={setFile}
              getEmbedding={getImageEmbedding}
            />
          </div>
        </div>

        {/* Preloaded Images Section */}
        <Container fluid className={styles.preloadedSection}>
          <h2 className={`${HowItWorksStyles.sectionTitle} text-center`}>
            Try Sample Images
          </h2>

          <div className={styles.preloadedGrid}>
            {preloadedImages.map((image, index) => (
              <div
                key={index}
                onClick={() => handlePreloadedImageClick(image)} // Call the function on image click
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
                  <h4
                    className={`${styles.preloadedCardTitle} text-capitalize`}
                  >
                    {`image ${index + 1}`}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Modal to show while processing */}
      {showModal && (
        <Modal
          show={showModal}
          onHide={handleCloseModal}
          centered
          backdrop="static"
        >
          <Modal.Body style={{ backgroundColor: "white", borderRadius: "5px" }}>
            <div className="d-flex justify-content-between align-items-center ps-3">
              {/* Show the preloaded image if `isPreloaded` is true */}
              {isPreloaded ? (
                <Image
                  src={preloadedImageUrl}
                  alt="Preloaded Image"
                  width={100}
                  height={100}
                  className="img-fluid"
                />
              ) : (
                // Show uploaded image if it's not preloaded
                file && (
                  <Image
                    src={URL.createObjectURL(file)}
                    alt="Uploaded Image"
                    width={100}
                    height={100}
                    className="img-fluid"
                  />
                )
              )}
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

            <div className="d-flex justify-content-center align-items-center fw-bold mt-3">
              Generating Image Embedding
              <div className="spinner-border ms-2" role="status">
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
