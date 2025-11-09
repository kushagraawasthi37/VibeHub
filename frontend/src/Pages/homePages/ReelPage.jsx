import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, MessageCircle } from "lucide-react";
import logo from "../../assets/logo.png";
import LeftNavbar from "../../components/LeftNavbar";
import BottomNavbar from "../../components/BottomNavbar";
import Loader from "../../components/Loader";
import ReelVideo from "../../components/ReelVIdeo";
import { toast } from "react-toastify";
import axiosInstance from "../../contexts/axiosInstance";
import { useNavigate } from "react-router-dom";
import SettingsMenu from "../../components/SettingsMenu.jsx";
import { userDataContext } from "../../contexts/UserContext.jsx";

const ReelPage = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const { userData } = useContext(userDataContext);
  const navigate = useNavigate();

  const getFeed = async () => {
    if (!userData) return;
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/users/feed", {
        withCredentials: true,
      });
      console.log(response.data.posts);
      setContent(response.data.posts || []);
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
    <div className="relative flex bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white font-sans h-screen w-screen overflow-hidden m-0 p-0">
      {/* ✅ Fixed Left Navbar */}
      <div className="hidden sm:flex fixed top-0 left-0 h-screen z-40">
        <LeftNavbar />
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          {/* ✅ Main Scrollable Reels Area */}
          <div
            className="flex-1 flex flex-col items-center w-full sm:ml-24 md:ml-28
         overflow-y-hidden overflow-x-hidden scroll-smooth m-0 p-0"
            style={{ height: "100vh" }}
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

            {/* ✅ Mobile Top Navbar */}
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

              <div className="flex space-x-5 text-gray-300">
                <div>
                  <Bookmark
                    onClick={() => {
                      if (!userData)
                        return toast.error("Login to view saved videos");
                      navigate("/saved");
                    }}
                    className={`w-6 h-6 cursor-pointer transition text-yellow-400 fill-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]`}
                  />
                  <span className="text-xs text-gray-400 mt-0.5 group-hover:text-yellow-300 transition">
                    Saved
                  </span>
                </div>

                <MessageCircle
                  onClick={() => {
                    if (!userData)
                      return toast.error("Login to open conversations");
                    navigate("/conversations");
                  }}
                  className="w-6 h-6 cursor-pointer hover:text-purple-400 transition"
                />
                <SettingsMenu />
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
                content.map((item) => <ReelVideo key={item._id} item={item} />)
              )}
            </div>
          </div>
        </>
      )}

      {/* ✅ Fixed Bottom Navbar */}
      <div className="fixed bottom-0 left-0 w-full z-50 sm:hidden">
        <BottomNavbar />
      </div>
    </div>
  );
};

export default ReelPage;
