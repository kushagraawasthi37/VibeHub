import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import LeftNavbar from "../../components/LeftNavbar";
import BottomNavbar from "../../components/BottomNavbar";
import { Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import logo from "../../assets/logo.png";
import { userDataContext } from "../../contexts/UserContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader.jsx";
import axiosInstance from "../../contexts/axiosInstance.js";
import PostCard from "../../components/PostCard.jsx";

const SavedPosts = () => {
  const navigate = useNavigate();
  const [savedContent, setSavedContent] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSavedContent = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/users/savedcontent", {
        withCredentials: true,
      });

      setSavedContent(response.data.savedContent);
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
      await fetchSavedContent();
    };

    fetchData();
  }, []);
  return (
    <div className="flex h-screen bg-[#0a001a] text-white overflow-hidden">
      {/* LEFT NAVBAR */}
      <div className="hidden sm:flex w-64 flex-shrink-0 border-r border-white/10">
        <LeftNavbar />
      </div>

      {/* MAIN CONTENT AREA (scrollable feed like Home) */}
      <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600/50 scrollbar-track-transparent pb-24 sm:pb-0">
        {/* HEADER */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="sticky top-0 z-20 bg-[#0a001a]/80 backdrop-blur-lg border-b border-white/10 
                     flex items-center justify-between px-5 py-4"
        >
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="logo"
              className="w-9 h-9 rounded-full shadow-[0_0_10px_#a855f7]"
            />
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Saved Posts
            </h1>
          </div>
        </motion.div>

        {loading ? (
          <Loader />
        ) : (
          <>
            {/* POSTS (Home-style cards) */}
            <div className="flex flex-col items-center gap-6 py-6 px-3 sm:px-0">
              {savedContent.length == 0 ? (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] text-gray-300">
                  <div className="p-6 rounded-full bg-gray-800 shadow-md">
                    <Bookmark className="w-16 h-16 text-purple-400" />
                  </div>
                  <h2 className="text-xl font-semibold mt-4 text-white">
                    No Saved Posts Yet
                  </h2>
                  <p className="text-sm text-gray-400 mt-2 max-w-xs text-center">
                    When you save posts, you’ll see them here. Start exploring
                    and save something you like!
                  </p>
                </div>
              ) : (
                savedContent.map((item, index) => <PostCard item={item.post} />)
              )}
            </div>
          </>
        )}
      </main>

      {/* BOTTOM NAVBAR */}
      <BottomNavbar />
    </div>
  );
};

export default SavedPosts;
