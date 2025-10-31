import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../contexts/axiosInstance.js"; // jahan aapka axios setup hai
import { toast } from "react-toastify";

const VerifyEmail = () => {
  const { token } = useParams(); // URL se token lega
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await axiosInstance.get(`/verify-email/${token}`);
        toast.success(response.data.message);
        navigate("/login"); // verification successful, login page par redirect
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Verification failed. Please register again."
        );
        navigate("/register"); // verification fail, registration page par redirect
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token, navigate]);

  if (loading) {
    return <div>Verifying your email, please wait...</div>; // ya koi spinner laga sakte hain
  }

  return null; // ya kuch message agar chahiye after redirect
};

export default VerifyEmail;
