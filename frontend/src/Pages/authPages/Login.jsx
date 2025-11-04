import React, { useState } from "react";
import { motion } from "framer-motion";
import google from "../../assets/google.png";
import logo from "../../assets/logo.png";
import { toast } from "react-toastify";
import axios from "../../contexts/axiosInstance";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../utils/firebase";
import Loading from "../../components/Loading";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const emailLogin = async (e) => {
    try {
      setLoading(true);
      e.preventDefault();
      // console.log({ email, password, age, username });

      const response = await axios.post(
        "/api/auth/login",
        { password, email },
        {
          withCredentials: true,
        }
      );
      if (response?.data?.message) {
        localStorage.setItem("authToken", response.data.token);
      }
      toast.success(response.data.message);
      navigate("/");
    } catch (error) {
      console.log(error);
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setLoading(false);

      setEmail("");
      setPassword("");
    }
  };

  const googleLogin = async (e) => {
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
          Welcome Back
        </h1>
        <motion.img
          onClick={() => navigate("/")}
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
        Log in and reconnect with your vibes — your community awaits you ✨
      </motion.p>

      {/* Login Form */}
      <motion.form
        onSubmit={emailLogin}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="w-full max-w-sm sm:max-w-md backdrop-blur-xl bg-white/10 border border-white/20 p-6 sm:p-8 rounded-2xl shadow-2xl  hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all duration-500 hover:scale-[1.02]"
      >
        <div className="flex flex-col space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 sm:p-4 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 sm:p-4 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300"
          />
        </div>

        {/* Forgot password */}
        <div className="text-right mt-3">
          <Link
            to={"/forgetpassword"}
            className="text-sm text-purple-400 hover:text-pink-400 hover:underline transition-all duration-300"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Login Button */}
        {/* Login Button */}
        <motion.button
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 200 }}
          type="submit"
          className="mt-5 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-pink-600 hover:to-purple-600 p-4 rounded-lg font-semibold text-lg transition-all duration-300"
        >
          {loading ? <Loading /> : "Login"}
        </motion.button>
      </motion.form>

      {/* OR Divider */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="flex items-center justify-center gap-2 sm:gap-3 my-4 w-full max-w-sm sm:max-w-md"
      >
        <span className="flex-1 h-[1px] bg-gray-500"></span>
        <span className="text-gray-400 text-xs sm:text-sm">OR</span>
        <span className="flex-1 h-[1px] bg-gray-500"></span>
      </motion.div>

      {/* Google Auth */}
      <motion.button
        onClick={googleLogin}
        whileHover={{
          scale: 1.05,
          borderColor: "#a855f7",
          boxShadow: "0 0 20px rgba(168,85,247,0.5)",
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl w-full max-w-sm sm:max-w-md text-white font-medium text-base sm:text-lg transition-all duration-50"
      >
        <img src={google} alt="Google" className="w-6 h-6" />
        <span>Login with Google</span>
      </motion.button>

      {/* Register Link */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="mt-5 text-gray-400 text-sm sm:text-base"
      >
        Don’t have an account?{" "}
        <Link
          to={"/signup"}
          className="text-purple-400 hover:text-pink-400 font-semibold hover:underline transition-all duration-300"
        >
          Register
        </Link>
      </motion.p>
    </div>
  );
};

export default Login;
