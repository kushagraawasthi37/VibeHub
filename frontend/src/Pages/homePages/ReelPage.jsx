import React, { useRef, useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, MessageCircle } from "lucide-react";
import logo from "../../assets/logo.png";
import BottomNavbar from "../../components/BottomNavbar";
import LeftNavbar from "../../components/LeftNavbar";
import ReelVideo from "../../components/ReelVIdeo";
import axios from "../../contexts/axiosInstance";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import SettingsMenu from "../../components/SettingsMenu";
import { userDataContext } from "../../contexts/UserContext";
import LoadingMore from "../../components/LoadingMore";

const ReelPage = () => {
  const LIMIT = 2;
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();
  const { userData } = useContext(userDataContext);

  const [content, setContent] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const fetching = useRef(false);

  const getFeed = async (pageToFetch = page) => {
    if (!userData?._id) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `/api/users/feed?page=${pageToFetch}&limit=${LIMIT}`,
        { withCredentials: true }
      );

      const newPosts = res.data.posts || [];
      const uniquePosts = newPosts.filter(
        (p) => !content.some((c) => c._id === p._id)
      );

      setContent((prev) => [...prev, ...uniquePosts]);
      setHasMore(res.data.hasMore);
    } catch (err) {
      console.error("Feed fetch error:", err);
      toast.error("Failed to load feed");
    } finally {
      setLoading(false);
      fetching.current = false;
    }
  };

  // Reset feed when user changes
  useEffect(() => {
    if (!userData?._id) return;
    setContent([]);
    setPage(1);
    setHasMore(true);
  }, [userData?._id]);

  // Fetch data when page changes
  useEffect(() => {
    if (userData?._id) getFeed(page);
  }, [page, userData?._id]);

  // Infinite scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const bottom =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 10;

      if (bottom && !loading && hasMore) {
        setPage((prev) => prev + 1);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  return (
    <div className="relative flex bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white font-sans min-h-screen overflow-hidden">
      {/* Left Navbar */}
      <div className="hidden sm:flex fixed top-0 left-0 h-screen z-40">
        <LeftNavbar />
      </div>

      {/* Scrollable Reels */}
      <div
        ref={scrollContainerRef}
        className="flex-1 w-full sm:ml-24 md:ml-28 overflow-y-scroll overflow-x-hidden snap-y snap-mandatory scroll-smooth"
        style={{ height: "100vh" }}
      >
        {/* Background Blobs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 0.25, scale: 1 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "mirror" }}
          className="absolute top-[-10%] left-[-10%] w-60 h-60 sm:w-72 sm:h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl"
        />
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
        />

        {/* Reels Section (One reel per screen) */}
        {content.map((item) => (
          <div
            key={item._id}
            className="snap-start w-full h-screen flex items-center justify-center"
          >
            <ReelVideo item={item} />
          </div>
        ))}

        {/* Loading / End */}
        {loading && hasMore && <LoadingMore />}
        {!hasMore && !loading && (
          <p className="text-gray-400 text-sm mt-5 text-center">
            You’ve reached the end 🎉
          </p>
        )}
      </div>

      {/* Bottom Navbar */}
      <div className="fixed bottom-0 left-0 w-full z-50 sm:hidden">
        <BottomNavbar />
      </div>
    </div>
  );
};

export default ReelPage;
