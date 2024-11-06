import { useState } from "react";
import emailjs from "@emailjs/browser";
import { toast } from "react-toastify";

const useEmail = () => {
  const [loading, setLoading] = useState(false);

  const sendEmail = async (templateParams, emailjsTemplateId) => {
    setLoading(true);
    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        emailjsTemplateId,
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      );

      // toast.success('Check your email box! Your order has been placed successfully.');
    } catch (error) {
      toast.error("There was an error sending your message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { sendEmail, loading };
};

export default useEmail;
