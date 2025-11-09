import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import LeftNavbar from "../../components/LeftNavbar";
import BottomNavbar from "../../components/BottomNavbar";
import { Bookmark } from "lucide-react";
import logo from "../../assets/logo.png";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader.jsx";
import axiosInstance from "../../contexts/axiosInstance.js";
import PostCard from "../../components/PostCard.jsx";

const SavedPosts = () => {
  const navigate = useNavigate();
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // ✅ Fetch saved content
  const fetchSavedContent = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/users/savedcontent", {
        withCredentials: true,
      });
      setSavedPosts(response.data.savedContent || []);
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
    fetchSavedContent();

    // 🌫️ Listen for scroll to adjust header opacity
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex w-full min-h-screen bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      {/* Left Navbar only for sm+ */}
      <div className="hidden sm:block">
        <LeftNavbar />
      </div>
      <BottomNavbar />

      {/* ===== HEADER (Fixed + Full Width + Transparent on Scroll) ===== */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 w-full z-30 backdrop-blur-lg border-b border-white/10 
          flex items-center sm:hidden justify-between px-5 py-4 transition-all duration-500
          ${scrolled ? "bg-[#0a001a]/95 shadow-lg" : "bg-[#0a001a]/60"}`}
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

      {/* ===== MAIN CONTENT ===== */}
      <div
        className="
          flex-1
          px-4 sm:px-8 md:px-12
          pt-24 sm:pt-28
          transition-all duration-500
          border-none sm:border-l-0
        "
      >
        {loading ? (
          <Loader />
        ) : savedPosts.length > 0 ? (
          <motion.div layout className="flex flex-col items-center gap-6 pb-8">
            {savedPosts.map((post) => (
              <PostCard
                key={post._id}
                item={post}
                setContent={setSavedPosts}
                content={savedPosts}
              />
            ))}
          </motion.div>
        ) : (
          <p className="text-center text-gray-400 mt-10">No saved posts yet.</p>
        )}
      </div>
    </div>
  );
};

export default SavedPosts;
