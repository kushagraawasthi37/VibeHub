import React from "react";
import { flushKeyframeResolvers, motion } from "framer-motion";
import logo from "../../assets/logo.png";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../contexts/axiosInstance";
import { toast } from "react-toastify";
import Loading from "../../components/Loading";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const resetPasswordLink = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);
      const response = await axiosInstance.post(
        "/api/auth/forgot-password",
        { email },
        { withCredentials: true }
      );

      console.log(response);
      console.log(response.data);

      if (response?.data?.message) {
        toast.success(response.data.message);
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white font-sans relative overflow-hidden px-4 sm:px-6">
      {/* Floating gradient blobs */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
        className="absolute top-[-10%] left-[-10%] w-60 h-60 sm:w-72 sm:h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{
          duration: 2,
          delay: 1,
          repeat: Infinity,
          repeatType: "mirror",
        }}
        className="absolute bottom-[-10%] right-[-10%] w-60 h-60 sm:w-72 sm:h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl"
      />

      {/* Heading */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="flex items-center justify-center space-x-2 sm:space-x-4 mb-4 sm:mb-6"
      >
        <h1 className="text-3xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
          Reset Your Password
        </h1>
        <motion.img
          src={logo}
          alt="VibeHub Logo"
          initial={{ rotate: -20, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, type: "spring" }}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-[0_0_15px_#a855f7]"
        />
      </motion.div>

      {/* Motivational Line */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-gray-300 text-sm sm:text-base italic text-center mb-4 sm:mb-5 max-w-sm"
      >
        No worries! We’ll help you regain access — enter your email and we’ll
        send you a reset link
      </motion.p>

      {/* Email Form */}
      <motion.form
        onSubmit={resetPasswordLink}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="w-full max-w-sm sm:max-w-md backdrop-blur-xl bg-white/10 border border-white/20 p-6 sm:p-8 rounded-2xl shadow-2xl transition-transform duration-500 hover:scale-[1.02] group"
      >
        <div className="flex flex-col space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            name="email"
            placeholder="Enter your Email"
            className="p-3 sm:p-4 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300 group-hover:scale-[1.00]"
          />
        </div>

        {/* Send Button */}
        <motion.button
          whileHover={{
            scale: 1.05,
            background:
              "linear-gradient(90deg, rgba(168,85,247,1) 0%, rgba(236,72,153,1) 100%)",
          }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 250 }}
          type="submit"
          className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-pink-600 hover:to-purple-600 p-4 rounded-lg font-semibold text-lg shadow-lg transition-all duration-50"
        >
          {loading ? <Loading /> : " Send Reset Link"}
        </motion.button>
      </motion.form>
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="mt-5 text-gray-400 text-sm sm:text-base"
      >
        Remember your password?{" "}
        <Link
          to={"/login"}
          className="text-purple-400 hover:text-pink-400 font-semibold hover:underline transition-all duration-300"
        >
          Login
        </Link>
      </motion.p>
    </div>
  );
};

export default ForgotPassword;
