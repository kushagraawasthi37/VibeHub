import React, { useState } from "react";
import { motion } from "framer-motion";
import google from "../../assets/google.png";
import logo from "../../assets/logo.png";
import axios from "../../contexts/axiosInstance.js";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { auth, provider } from "../../utils/firebase.js";
import { signInWithPopup } from "firebase/auth";
import Loading from "../../components/Loading.jsx";

const Registration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");

  const emailRegister = async (e) => {
    try {
      setLoading(true);
      e.preventDefault();
      console.log({ name, email, password, age, username });
      setName("");
      setEmail("");
      setPassword("");
      setUsername("");
      setAge("");

      const response = await axios.post(
        "/api/auth/register",
        { name, password, email, age, username },
        {
          withCredentials: true,
        }
      );

      console.log(response);
      toast.success(response.data.message);
    } catch (error) {
      console.log(error);
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const googleSignup = async (e) => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log(result);
      const name = result.user.displayName;
      const email = result.user.email;

      const response = await axios.post(
        "/api/auth/googleauth",
        { email, name },
        { withCredentials: true }
      );

      console.log(response.data);
      toast.success(response?.data?.message || "Login Successfull");
      if (response?.data?.token) {
        localStorage.setItem("authToken", response.data.token);
      }

      if (response?.data?.user?.password || response?.data?.user?.username) {
        navigate("/");
        return;
      }

      navigate("/auth/updateDetails");
    } catch (error) {
      console.log(error);
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white font-sans relative overflow-hidden px-4">
      {/* Floating gradient blobs */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.25, scale: 1 }}
        transition={{ duration: 3, repeat: Infinity, repeatType: "mirror" }}
        className="absolute top-[-10%] left-[-10%] w-60 h-60 sm:w-72 sm:h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl"
      ></motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.25, scale: 1 }}
        transition={{
          duration: 3,
          delay: 1,
          repeat: Infinity,
          repeatType: "mirror",
        }}
        className="absolute bottom-[-10%] right-[-10%] w-60 h-60 sm:w-72 sm:h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl"
      ></motion.div>

      {/* Heading + Logo */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="flex items-center justify-center space-x-3 mb-3 sm:mb-4"
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-lg whitespace-nowrap">
          Join VibeHub
        </h1>
        <motion.img
          src={logo}
          alt="VibeHub Logo"
          initial={{ rotate: -15, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, type: "spring" }}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-[0_0_15px_#a855f7]"
        />
      </motion.div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="text-gray-300 text-sm sm:text-base italic mb-4 text-center"
      >
        Connect, Create & Grow Together 🚀
      </motion.p>

      {/* Registration Card */}
      <motion.form
        onSubmit={emailRegister}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="w-full max-w-sm backdrop-blur-xl bg-white/10 border border-white/20 p-5 sm:p-6 rounded-2xl shadow-xl flex flex-col space-y-3 sm:space-y-4 transition-all duration-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
      >
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          className="p-3 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="p-3 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300"
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-3 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300"
        />
        <input
          type="number"
          placeholder="Age"
          min="13"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="p-3 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-3 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300"
        />

        {/* Create button */}
        <motion.button
          whileHover={{
            scale: 1.05,
            background:
              "linear-gradient(90deg, rgba(168,85,247,1) 0%, rgba(236,72,153,1) 100%)",
            boxShadow: "0 0 10px rgba(168,85,247,0.7)",
          }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="mt-2 w-full bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-lg font-semibold text-base sm:text-lg shadow-md transition-all duration-50"
        >
          {loading ? <Loading /> : "Create Account"}
        </motion.button>
      </motion.form>

      {/* OR divider */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="flex items-center justify-center gap-3 my-4 w-full max-w-sm"
      >
        <span className="flex-1 h-[1px] bg-gray-500"></span>
        <span className="text-gray-400 text-xs sm:text-sm">OR</span>
        <span className="flex-1 h-[1px] bg-gray-500"></span>
      </motion.div>

      {/* Google login */}
      <motion.button
        onClick={(e) => googleSignup(e)}
        whileHover={{
          scale: 1.05,
          background: "rgba(255,255,255,0.15)",
          boxShadow: "0 0 15px rgba(236,72,153,0.6)",
        }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl w-full max-w-sm text-white font-medium text-sm sm:text-base transition-all duration-50"
      >
        <img src={google} alt="Google" className="w-5 h-5 sm:w-6 sm:h-6" />
        <span>Continue with Google</span>
      </motion.button>

      {/* Login prompt */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.8 }}
        className="mt-4 text-gray-400 text-sm sm:text-base text-center"
      >
        Already have an account?{" "}
        <button
          onClick={() => {
            navigate("/login");
          }}
          className="text-purple-400 hover:text-pink-400 font-semibold hover:underline transition-all duration-300"
        >
          Login
        </button>
      </motion.p>
    </div>
  );
};

export default Registration;
