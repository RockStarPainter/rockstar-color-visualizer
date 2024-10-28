import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { toast } from 'react-toastify';

const useEmail = () => {
  const [loading, setLoading] = useState(false);

  const sendEmail = async (templateParams) => {
    setLoading(true);
    try {
      const result = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      );

      console.log('Email sent successfully:', result.text);
      toast.success('Check your email box! Your order has been placed successfully.');
    } catch (error) {
      console.error('Failed to send email:', error);
      toast.error('There was an error sending your message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return { sendEmail, loading };
};

export default useEmail;
