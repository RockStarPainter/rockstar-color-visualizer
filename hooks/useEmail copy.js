import { useState } from "react";
import emailjs from "emailjs-com";
import { toast } from "react-toastify"; // Import toast

const useEmail = () => {
  const [loading, setLoading] = useState(false);

  const sendEmail = async (templateParams) => {
    setLoading(true);

    try {
      const result = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID, // Service ID from EmailJS
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID, // Template ID from EmailJS
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY // Public Key from EmailJS
      );

      console.log("Email sent successfully:", result.text);
      toast.success("Your order placed successfully!");
    } catch (error) {
      console.error("Failed to send email:", error);
      toast.error("There was an error sending your message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { sendEmail, loading };
};

export default useEmail;
