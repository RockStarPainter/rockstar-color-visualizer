// import { useState } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";

// const useCloudinaryUpload = () => {
//   const [uploading, setUploading] = useState(false);
//   const [uploadedUrl, setUploadedUrl] = useState("");

//   const uploadPdfToCloudinary = async (pdfBlob) => {
//     setUploading(true);
//     try {
//       const formData = new FormData();
//       formData.append("file", pdfBlob);
//       formData.append("upload_preset", "rockstar-color-visualizer-files"); // Replace with your Cloudinary preset
//       formData.append("cloud_name", "dubh6rxft"); // Replace with your Cloudinary cloud name

//       const res = await axios.post(
//         "https://api.cloudinary.com/v1_1/dubh6rxft/upload", // Replace with your Cloudinary cloud name
//         formData
//       );

//       if (res.data.secure_url) {
//         setUploadedUrl(res.data.secure_url); // Save the uploaded URL in state
//         toast.success("File uploaded successfully!");
//         return res.data.secure_url;
//       } else {
//         toast.error("Failed to upload file");
//       }
//     } catch (err) {
//       console.error("Error uploading file:", err);
//       toast.error("Failed to upload file");
//     } finally {
//       setUploading(false);
//     }
//   };

//   return { uploadPdfToCloudinary, uploading, uploadedUrl };
// };

// export default useCloudinaryUpload;


import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const useCloudinaryUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');

  const uploadPdfToCloudinary = async (pdfBlob) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', pdfBlob);
      formData.append('upload_preset', 'rockstar-color-visualizer-files'); // Replace with your upload preset
      formData.append('cloud_name', 'dubh6rxft'); // Replace with your Cloudinary cloud name

      const res = await axios.post(
        'https://api.cloudinary.com/v1_1/dubh6rxft/upload', // Replace with your Cloudinary cloud name
        formData
      );

      if (res.data.secure_url) {
        setUploadedUrl(res.data.secure_url);
        toast.success('File uploaded successfully!');
        return res.data.secure_url;
      } else {
        toast.error('Failed to upload file');
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return { uploadPdfToCloudinary, uploading, uploadedUrl };
};

export default useCloudinaryUpload;

