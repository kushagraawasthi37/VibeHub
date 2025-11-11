import React, { useRef, useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";
import logo from "../../assets/logo.png";
import BottomNavbar from "../../components/BottomNavbar";
import LeftNavbar from "../../components/LeftNavbar";
import axios from "../../contexts/axiosInstance";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import PostCard from "../../components/PostCard";
import LoadingMore from "../../components/LoadingMore";
import { userDataContext } from "../../contexts/UserContext";

const SavedPosts = () => {
  const LIMIT = 4;
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();
  const { userData } = useContext(userDataContext);

  const [content, setContent] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false); // ✅ Added
  const fetching = useRef(false);

  // ✅ Fetch saved posts (paginated)
  const getSavedPosts = async (pageToFetch = page) => {
    if (!userData?._id || fetching.current) return;
    fetching.current = true;
    setLoading(true);

    try {
      const res = await axios.get(
        `/api/users/savedcontent?page=${pageToFetch}&limit=${LIMIT}`,
        { withCredentials: true }
      );

      const newPosts = res.data.posts || [];
      const uniquePosts = newPosts.filter(
        (p) => !content.some((c) => c._id === p._id)
      );

      setContent((prev) => [...prev, ...uniquePosts]);
      setHasMore(res.data.hasMore);
    } catch (err) {
      console.error("Saved posts fetch error:", err);
      toast.error("Failed to load saved posts");
    } finally {
      setLoading(false);
      fetching.current = false;
      setInitialLoaded(true); // ✅ Mark first fetch complete
    }
  };

  // ✅ Reset when user changes
  useEffect(() => {
    if (!userData?._id) return;
    setContent([]);
    setPage(1);
    setHasMore(true);
    setInitialLoaded(false); // ✅ Reset before new user load
  }, [userData?._id]);

  // 📦 Fetch data when page changes
  useEffect(() => {
    if (userData?._id) getSavedPosts(page);
  }, [page, userData?._id]);

  // 🔄 Infinite scroll inside container
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

      {/* Scrollable Saved Posts Section */}
      <div
        ref={scrollContainerRef}
        className="flex-1 w-full sm:ml-24 md:ml-28 overflow-y-scroll overflow-x-hidden scroll-smooth"
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

        {/* Saved Posts List */}
        <motion.div
          layout
          className="flex flex-col items-center gap-6 py-8 sm:py-10 px-4 sm:px-10"
        >
          {content.length > 0
            ? content.map((item) => (
                <PostCard
                  key={item._id}
                  item={item}
                  setContent={setContent}
                  content={content}
                />
              ))
            : initialLoaded &&
              !loading && (
                // ✅ Only show this after first fetch completes
                <p className="text-gray-400 text-sm mt-10">
                  You haven’t saved any posts yet 📭
                </p>
              )}
        </motion.div>

        {/* Loader / End of List */}
        {loading && hasMore && <LoadingMore />}
        {!hasMore && !loading && content.length > 0 && (
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

export default SavedPosts;
