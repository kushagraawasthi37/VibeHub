import React, { useRef, useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, MessageCircle } from "lucide-react";
import logo from "../../assets/logo.png";
import BottomNavbar from "../../components/BottomNavbar";
import LeftNavbar from "../../components/LeftNavbar";
import axios from "../../contexts/axiosInstance";
import { toast } from "react-toastify";
import PostCard from "../../components/PostCard";
import { useNavigate } from "react-router-dom";
import SettingsMenu from "../../components/SettingsMenu";
import { userDataContext } from "../../contexts/UserContext";

const LoadingMore = () => (
  <div className="w-full flex justify-center py-4">
    <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-8 w-8"></div>
    <style>{`
      .loader { border-top-color: #6366f1; animation: spin 1s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
    `}</style>
  </div>
);

const HomeFeed = () => {
  const LIMIT = 4;
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();
  const { userData } = useContext(userDataContext);

  const [posts, setPost] = useState([]);
  const [content, setContent] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const fetching = useRef(false); // lock to prevent multiple fetches

  // ✅ Fetch one page of posts safely
  const getHome = async (pageToFetch = page) => {
    if (!userData?._id) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `/api/users/home?page=${pageToFetch}&limit=${LIMIT}`,
        { withCredentials: true }
      );

      const newPosts = res.data.posts || [];
      const uniquePosts = newPosts.filter(
        (p) => !content.some((c) => c._id === p._id)
      );

      setPost([...posts, ...res.data.posts]);
      setContent((prev) => [...prev, ...uniquePosts]);
      setHasMore(res.data.hasMore);
    } catch (err) {
      console.error("Feed fetch error:", err);
      toast.error("Failed to load feed");
    } finally {
      setLoading(false);
      fetching.current = false; // unlock fetch after completion
    }
  };

  useEffect(() => {
    console.log("Posts ");
    posts.forEach((item) => {
      console.log(item._id);
    });
    console.log("Content");
    content.forEach((item) => {
      console.log(item._id);
    });
  }, [posts, content]);
  // ✅ Reset feed when userData changes
  useEffect(() => {
    if (!userData?._id) return;
    setContent([]);
    setPage(1);
    setHasMore(true);
  }, [userData?._id]);

  // ✅ Fetch data whenever page changes
  useEffect(() => {
    if (userData?._id) getHome(page);
  }, [page, userData?._id]);

  // ✅ Infinite scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const bottom =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 10;

      // ✅ Only increment if not fetching, still has more
      if (bottom && !fetching.current && hasMore) {
        setPage((prev) => prev + 1); // safe increment
        fetching.current = true; // lock immediately
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMore]);

  return (
    <div className="relative flex bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white font-sans min-h-screen overflow-hidden">
      {/* Left Navbar */}
      <div className="hidden sm:flex fixed top-0 left-0 h-screen z-40">
        <LeftNavbar />
      </div>

      {/* Scrollable Feed */}
      <div
        ref={scrollContainerRef}
        className="flex-1 flex flex-col items-center w-full sm:ml-24 md:ml-28 overflow-y-auto overflow-x-hidden pb-24 scroll-smooth"
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

        {/* Mobile Navbar */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="sticky top-0 sm:hidden backdrop-blur-3xl bg-white/5 border-b border-white/10 p-3 flex items-center justify-between z-20 w-full"
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
            <div>
              <Bookmark
                onClick={() => {
                  if (!userData)
                    return toast.error("Login to view saved videos");
                  navigate("/saved");
                }}
                className="w-6 h-6 cursor-pointer text-yellow-400 fill-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]"
              />
              <span className="text-xs text-gray-400 mt-0.5 transition">
                Saved
              </span>
            </div>
            <MessageCircle
              onClick={() => {
                if (!userData)
                  return toast.error("Login to view conversations");
                navigate("/conversations");
              }}
              className="w-6 h-6 cursor-pointer hover:text-purple-400 transition"
            />
            <SettingsMenu />
          </div>
        </motion.div>

        {/* Feed Section */}
        <div className="flex flex-col items-center mt-5 space-y-6 px-2 sm:px-0 pb-10 w-full max-w-md">
          {content.map((item) => (
            <PostCard key={item._id} item={item} />
          ))}

          {loading && hasMore && <LoadingMore />}

          {!hasMore && !loading && (
            <p className="text-gray-400 text-sm mt-5">
              You’ve reached the end 🎉
            </p>
          )}
        </div>
      </div>

      {/* Bottom Navbar */}
      <div className="fixed bottom-0 left-0 w-full z-50 sm:hidden">
        <BottomNavbar />
      </div>
    </div>
  );
};

export default HomeFeed;
