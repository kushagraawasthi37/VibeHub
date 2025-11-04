import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import LeftNavbar from "../../components/LeftNavbar";
import BottomNavbar from "../../components/BottomNavbar";
import logo from "../../assets/logo.png";
import ReelVIdeo from "../../components/ReelVIdeo";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import axiosInstance from "../../contexts/axiosInstance";

const ReelPage = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);

  const getFeed = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/users/feed", {
        withCredentials: true,
      });
      setContent(response.data.posts);
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

  useEffect(() => {
    getFeed();
  }, []);

  return (
    <div className="relative flex bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white min-h-screen overflow-hidden">
      {/* ✅ Fixed Left Navbar */}
      <div className="hidden sm:flex fixed top-0 left-0 h-screen z-40">
        <LeftNavbar />
      </div>

      {/* ✅ Reels Feed Area */}
      <div className="flex-1 flex flex-col items-center w-full sm:ml-24 md:ml-28 relative">
        {/* Floating Background Blobs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 0.25, scale: 1 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "mirror",
          }}
          className="absolute top-[-10%] left-[-10%] w-60 h-60 sm:w-72 sm:h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl"
        ></motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 0.25, scale: 1 }}
          transition={{
            duration: 3,
            delay: 1,
            repeat: Infinity,
            repeatType: "mirror",
          }}
          className="absolute bottom-[-10%] right-[-10%] w-60 h-60 sm:w-72 sm:h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl"
        ></motion.div>

        {/* Mobile Top Navbar */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="sticky top-0 sm:hidden backdrop-blur-3xl bg-white/5 border-b border-white/10 
                     p-3 flex items-center justify-between z-20 w-full"
        >
          <div className="flex items-center space-x-3">
            <img
              src={logo}
              alt="logo"
              className="w-9 h-9 rounded-full shadow-[0_0_10px_#a855f7]"
            />
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Reels
            </h1>
          </div>
        </motion.div>

        {/* ✅ Reels Section with smooth snap */}
        <div
          className="w-full h-[calc(100vh-4.5rem)] sm:h-screen snap-y snap-mandatory overflow-y-scroll 
                     scrollbar-hide scroll-smooth pb-24 sm:pb-0"
        >
          {loading ? (
            <Loader />
          ) : (
            content.map((item) => <ReelVIdeo key={item._id} item={item} />)
          )}
        </div>
      </div>

      {/* ✅ Fixed Bottom Navbar */}
      <div className="fixed bottom-0 left-0 w-full z-50 sm:hidden">
        <BottomNavbar />
      </div>
    </div>
  );
};

export default ReelPage;
