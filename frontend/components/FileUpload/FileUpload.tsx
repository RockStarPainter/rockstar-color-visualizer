import Image from "next/image";
import styles from "./FileUpload.module.css";
import imageCompression from "browser-image-compression";
import React, { useEffect, useRef } from "react";
import { cropImage } from "../../utils/helpers/maskUtils";

const FileUpload = (props: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const uploadArea = document.getElementById("uploadArea");
    const dropZoon = document.getElementById("dropZoon");
    const loadingText = document.getElementById("loadingText");
    const previewImage = document.getElementById(
      "previewImage"
    ) as HTMLImageElement;
    const fileDetails = document.getElementById("fileDetails");
    const uploadedFile = document.getElementById("uploadedFile");
    const uploadedFileInfo = document.getElementById("uploadedFileInfo");
    const uploadedFileName = document.getElementById("uploadedFileName");
    const uploadedFileIconText = document.getElementById(
      "uploadedFileIconText"
    );
    const uploadedFileCounter = document.getElementById("uploadedFileCounter");
    const toolTipData = document.getElementById("uploadAreaTooltipData");

    const imagesTypes = ["jpeg", "png", "svg", "gif"];
    toolTipData!.innerHTML = imagesTypes.map((type) => `.${type}`).join(", ");

    const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
      dropZoon?.classList.add("drop_zoon--over");
    };

    const handleDragLeave = () => dropZoon?.classList.remove("drop_zoon--over");

    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      dropZoon?.classList.remove("drop_zoon--over");
      const file = event.dataTransfer?.files[0];
      if (file) uploadFile(file);
    };

    const handleFileSelect = () => fileInputRef.current?.click();

    const handleFileChange = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) uploadFile(file);
    };

    const fileValidate = (fileType: string, fileSize: number) => {
      const isImage = imagesTypes.some((type) =>
        fileType.includes(`image/${type}`)
      );
      if (!isImage) {
        alert("Please upload an image file.");
        return false;
      }

      uploadedFileIconText!.innerHTML = fileType.includes("jpeg")
        ? "jpg"
        : fileType.split("/")[1];
      return true;
    };

    const uploadFile = (file: File) => {
      if (!fileValidate(file.type, file.size)) return;

      const fileReader = new FileReader();

      loadingText!.style.display = "block";
      previewImage.style.display = "none";
      uploadedFile?.classList.remove("uploaded_file--open");
      uploadedFileInfo?.classList.remove("uploaded_file__info--active");

      fileReader.onload = () => {
        setTimeout(() => {
          uploadArea?.classList.add("upload_area--open");
          loadingText!.style.display = "none";
          previewImage.src = fileReader.result as string;
          previewImage.style.display = "block";
          fileDetails?.classList.add("file_details--open");
          uploadedFile?.classList.add("uploaded_file--open");
          uploadedFileInfo?.classList.add("uploaded_file__info--active");
          uploadedFileName!.innerHTML = file.name;
          progressMove();
        }, 500);
      };

      fileReader.readAsDataURL(file);
    };

    const progressMove = () => {
      let counter = 0;
      setTimeout(() => {
        const intervalId = setInterval(() => {
          if (counter === 100) {
            clearInterval(intervalId);
          } else {
            counter += 10;
            uploadedFileCounter!.innerHTML = `${counter}%`;
          }
        }, 100);
      }, 600);
    };

    dropZoon?.addEventListener("dragover", handleDragOver);
    dropZoon?.addEventListener("dragleave", handleDragLeave);
    dropZoon?.addEventListener("drop", handleDrop);
    dropZoon?.addEventListener("click", handleFileSelect);
    fileInputRef.current?.addEventListener("change", handleFileChange);

    return () => {
      dropZoon?.removeEventListener("dragover", handleDragOver);
      dropZoon?.removeEventListener("dragleave", handleDragLeave);
      dropZoon?.removeEventListener("drop", handleDrop);
      dropZoon?.removeEventListener("click", handleFileSelect);
      fileInputRef.current?.removeEventListener("change", handleFileChange);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    const options = {
      maxSizeMB: 2,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      const compfile = new File([compressedFile], file.name, {
        type: "image/jpeg",
        lastModified: compressedFile.lastModified,
      });

      const croppedImage = await cropImage(3 / 2, compfile);
      props.setFile(croppedImage);
      props.getEmbedding(croppedImage);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div id="uploadArea" className={`${styles.upload_area} mx-auto mb-0 pb-4`}>
      <div className={styles.upload_area__header}>
        <h1 className={styles.upload_area__title}>Upload your file</h1>
        <p className={styles.upload_area__paragraph}>
          File should be an image&nbsp;
          <strong className={styles.upload_area__tooltip}>
            Like
            <span
              id="uploadAreaTooltipData"
              className={styles.upload_area__tooltip_data}
            ></span>
          </strong>
        </p>
        <p className="fw-bold pb-0 mb-0">
          Will crop image to{" "}
          <span className="text-danger">3:2 aspect ratio</span> for better
          viewing experience.
        </p>
      </div>
      <div
        id="dropZoon"
        className={`${styles.upload_area__drop_zoon} ${styles.drop_zoon}`}
      >
        <span className={styles.drop_zoon__icon}>
          <i className="bx bxs-file-image"></i>
        </span>
        <p className={styles.drop_zoon__paragraph}>
          Drop your file here or Click to browse
        </p>
        <span id="loadingText" className={styles.drop_zoon__loading_text}>
          Please Wait
        </span>
        <Image
          src=""
          alt="Preview Image"
          id="previewImage"
          className={styles.drop_zoon__preview_image}
          draggable="false"
        />
        <input
          type="file"
          id="fileInput"
          className={styles.drop_zoon__file_input}
          accept="image/*"
          ref={fileInputRef}
        />
      </div>

      <div
        id="fileDetails"
        className={`${styles.upload_area__file_details} ${styles.file_details} mt-2`}
      >
        <h3 className={styles.file_details__title}>Uploaded File</h3>
        <div id="uploadedFile" className={styles.uploaded_file}>
          <div className={styles.uploaded_file__icon_container}>
            <i
              className={`bx bxs-file-blank ${styles.uploaded_file__icon}`}
            ></i>
            <span
              id="uploadedFileIconText"
              className={styles.uploaded_file__icon_text}
            ></span>
          </div>
          <div id="uploadedFileInfo" className={styles.uploaded_file__info}>
            <span id="uploadedFileName" className={styles.uploaded_file__name}>
              Project 1
            </span>
            <span
              id="uploadedFileCounter"
              className={styles.uploaded_file__counter}
            >
              0%
            </span>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <button type="submit" className="btn btn-primary mt-4">
          Submit
        </button>
      </form>
    </div>
  );
};

export default FileUpload;
