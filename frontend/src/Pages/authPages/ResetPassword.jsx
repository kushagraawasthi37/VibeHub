import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Loading from "../../components/Loading";
import axiosInstance from "../../contexts/axiosInstance";
import { toast } from "react-toastify";

function ResetPassword({ token }) {
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const resetPassword = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);

      const response = await axiosInstance.post(
        `/api/auth/reset-password/${token}`,
        { newPassword },
        { withCredentials: true }
      );

      if (response?.data?.token) {
        localStorage.setItem("authToken", response.data.token);
      }

      toast.success(response.data.message);
      navigate("/login");
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setNewPassword("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-700"
      >
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-bold text-center text-white mb-3"
        >
          Reset Password 🔒
        </motion.h2>

        <p className="text-gray-400 text-center mb-6">
          Create a new password and get back to your vibe!
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter New Password"
            className="w-full px-4 py-2 mb-6 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all duration-300"
          />

          <motion.button
            type="submit"
            onClick={resetPassword}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 text-white py-2.5 rounded-lg font-semibold"
          >
            {loading ? <Loading /> : "Reset password"}
          </motion.button>
        </motion.div>

        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-indigo-400 hover:text-indigo-300 transition-all duration-300 font-medium"
            >
              Login here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default ResetPassword;
