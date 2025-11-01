import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import profile from "../../assets/avatar.png";
import postImg from "../../assets/postImg.png";
import logo from "../../assets/logo.png";
import BottomNavbar from "../../components/BottomNavbar";
import LeftNavbar from "../../components/LeftNavbar";
import axios from "../../contexts/axiosInstance.js";
import { toast } from "react-toastify";
import Loader from "../../components/Loader.jsx";
import PostCard from "../../components/PostCard.jsx";
import { useNavigate } from "react-router-dom";

const HomeFeed = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState([1, 2, 3, 4, 5, 6]);
  const [loading, setLoading] = useState(false);
  const getFeed = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/users/home", {
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
    const fetchData = async () => {
      await getFeed();
    };

    fetchData();
  }, []);
  return (
    <>
      <div className="relative flex bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white font-sans min-h-screen overflow-hidden">
        {/* ✅ Fixed Left Navbar */}
        <div className="hidden sm:flex fixed top-0 left-0 h-screen z-40">
          <LeftNavbar />
        </div>

        {loading ? (
          <Loader />
        ) : (
          <>
            {/* ✅ Main Scrollable Content */}
            <div
              className="flex-1 flex flex-col items-center w-full sm:ml-24 md:ml-28
                   overflow-y-auto overflow-x-hidden pb-24 scroll-smooth"
              style={{
                height: "100vh", // ensures single scroll area
              }}
            >
              {/* Floating background blobs */}
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
                    VibeHub
                  </h1>
                </div>

                <div className="flex space-x-5 text-gray-300">
                  <Heart className="w-6 h-6 cursor-pointer hover:text-pink-500 transition" />
                  <MessageCircle
                    onClick={() => navigate("/messages")}
                    className="w-6 h-6 cursor-pointer hover:text-purple-400 transition"
                  />
                </div>
              </motion.div>

              {/* Feed Section */}
              <div className="flex flex-col items-center mt-5 space-y-6 px-2 sm:px-0 pb-10">
                {content.map((item) => (
                  <PostCard item={item} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* ✅ Fixed Bottom Navbar */}
        <div className="fixed bottom-0 left-0 w-full z-50 sm:hidden">
          <BottomNavbar />
        </div>
      </div>
    </>
  );
};

export default HomeFeed;
