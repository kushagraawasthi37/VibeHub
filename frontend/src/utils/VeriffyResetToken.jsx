import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../contexts/axiosInstance";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import ResetPassword from "../Pages/authPages/ResetPassword";

const VerifyResetToken = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [validToken, setValidToken] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await axiosInstance.get(
          `/api/auth/reset-password/${token}`
        );

        console.log(token);
        if (res.data.userId) {
          setValidToken(true);
        } else {
          toast.error("Invalid or expired reset link.");
          navigate("/forgot-password");
        }
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Invalid or expired reset link."
        );
        navigate("/forgot-password");
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, [token, navigate]);

  if (loading)
    return (
      <div>
        <Loader />
      </div>
    );

  if (!validToken) return null;

  return <ResetPassword token={token} />;
};

export default VerifyResetToken;
