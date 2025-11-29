import React, { useContext, useState } from "react";
import { motion } from "framer-motion";
import logo from "../../assets/logo.png";
import axiosInstance from "../../contexts/axiosInstance";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loading from "../../components/Loading";
import { userDataContext } from "../../contexts/UserContext";

const AfterGoogleAuthDetails = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { getCurrentUser, setUserData } = useContext(userDataContext);

  const updateDetails = async (e) => {
    try {
      setLoading(true);
      e.preventDefault();
      console.log("Update form hit");
      const response = await axiosInstance.post(
        "/api/auth/googleauth/details",
        { username, password },
        { withCredentials: true }
      );
      setUsername("");
      setPassword("");
      console.log(response);

      if (response?.data?.token) {
        localStorage.setItem("authToken", response.data.token);
      }
      setUserData(response.data.user);
      await getCurrentUser();
      navigate("/");
      toast.success(response.data.message);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
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
          Complete Your Setup
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
        Let’s personalize your vibe — set your username and password to begin
        your journey
      </motion.p>

      {/* Update Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
        onSubmit={(e) => updateDetails(e)}
        className="w-full max-w-sm sm:max-w-md backdrop-blur-xl bg-white/10 border border-white/20 p-6 sm:p-8 rounded-2xl shadow-2xl hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-transform duration-500 hover:scale-[1.02] group"
      >
        <div className="flex flex-col space-y-4">
          <input
            type="text"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your Username"
            className="p-3 sm:p-4 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300 group-hover:scale-[1.00]"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            name="password"
            placeholder="Enter your Password"
            className="p-3 sm:p-4 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300 group-hover:scale-[1.00]"
          />
        </div>

        {/* Update Button */}
        <motion.button
          whileHover={{
            scale: 1.05,
            background:
              "linear-gradient(90deg, rgba(168,85,247,1) 0%, rgba(236,72,153,1) 100%)",
          }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 250 }}
          type="submit"
          className="mt-5 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-pink-600 hover:to-purple-600 p-4 rounded-lg font-semibold text-lg shadow-lg transition-all duration-50"
        >
          {loading ? <Loading /> : "Update Details"}
        </motion.button>
      </motion.form>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="mt-6 text-gray-400 text-sm sm:text-base italic text-center max-w-sm"
      >
        Secure your account and make it truly yours 💫
      </motion.p>
    </div>
  );
};

export default AfterGoogleAuthDetails;
