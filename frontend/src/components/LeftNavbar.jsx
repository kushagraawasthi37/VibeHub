import React, { useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  Home,
  Search,
  PlusSquare,
  PlayCircle,
  User,
  Share2,
  Settings,
  LogOut,
  LogIn,
} from "lucide-react";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { userDataContext } from "../contexts/UserContext";

const LeftNavbar = () => {
  const navigate = useNavigate();
  const { userData, getCurrentUser, logoutUser } = useContext(userDataContext);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      await getCurrentUser();
    };
    fetch();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser?.();
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (err) {
      toast.error("Error logging out!");
    }
  };

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="hidden sm:flex fixed top-0 left-0 h-full sm:w-24 md:w-28 
                 bg-gradient-to-b from-[#0f0c29]/95 via-[#302b63]/90 to-[#24243e]/95
                 backdrop-blur-2xl border-r border-white/10 shadow-[2px_0_25px_rgba(168,85,247,0.25)]
                 flex-col items-center justify-between py-8 z-50"
    >
      <div>
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 150, damping: 10 }}
          className="mb-8 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <motion.img
            src={logo}
            alt="VibeHub Logo"
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover shadow-[0_0_15px_rgba(168,85,247,0.6)]"
            animate={{
              boxShadow: [
                "0 0 10px rgba(168,85,247,0.6)",
                "0 0 20px rgba(236,72,153,0.6)",
                "0 0 10px rgba(168,85,247,0.6)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex flex-col space-y-6 mt-4">
          {/* Home */}
          <motion.button
            onClick={() => navigate("/")}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center text-gray-300 hover:text-white transition-all duration-300"
          >
            <motion.div
              whileHover={{
                scale: 1.1,
                color: "#a855f7",
                textShadow: "0 0 10px rgba(168,85,247,0.8)",
              }}
            >
              <Home className="w-6 h-6" />
            </motion.div>
            <span className="text-[10px] sm:text-xs mt-1 opacity-80">Home</span>
          </motion.button>

          {/* Search */}
          <motion.button
            onClick={() => navigate("/search")}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center text-gray-300 hover:text-white transition-all duration-300"
          >
            <motion.div whileHover={{ scale: 1.1, color: "#a855f7" }}>
              <Search className="w-6 h-6" />
            </motion.div>
            <span className="text-[10px] sm:text-xs mt-1 opacity-80">
              Search
            </span>
          </motion.button>

          {/* Create */}
          <motion.button
            onClick={() => {
              if (!userData) return toast.error("Login for uploading post");
              navigate("/createpost");
            }}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center text-gray-300 hover:text-white transition-all duration-300"
          >
            <motion.div whileHover={{ scale: 1.1, color: "#a855f7" }}>
              <PlusSquare className="w-6 h-6" />
            </motion.div>
            <span className="text-[10px] sm:text-xs mt-1 opacity-80">
              Create
            </span>
          </motion.button>

          {/* Reels */}
          <motion.button
            onClick={() => navigate("/feed")}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center text-gray-300 hover:text-white transition-all duration-300"
          >
            <motion.div whileHover={{ scale: 1.1, color: "#a855f7" }}>
              <PlayCircle className="w-6 h-6" />
            </motion.div>
            <span className="text-[10px] sm:text-xs mt-1 opacity-80">
              Reels
            </span>
          </motion.button>

          {/* Profile */}
          <motion.button
            onClick={() => {
              if (!userData) return toast.error("Login for profile");
              navigate(`/profile/${userData?._id}`);
            }}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center text-gray-300 hover:text-white transition-all duration-300"
          >
            <motion.div whileHover={{ scale: 1.1, color: "#a855f7" }}>
              <User className="w-6 h-6" />
            </motion.div>
            <span className="text-[10px] sm:text-xs mt-1 opacity-80">
              Profile
            </span>
          </motion.button>

          {/* Message */}
          <motion.button
            // onClick={() => navigate("/messages")}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center text-gray-300 hover:text-white transition-all duration-300"
          >
            <motion.div whileHover={{ scale: 1.1, color: "#a855f7" }}>
              <Share2 className="w-6 h-6" />
            </motion.div>
            <span className="text-[10px] sm:text-xs mt-1 opacity-80">
              Message
            </span>
          </motion.button>
        </div>
      </div>

      {/* Settings Menu Button */}
      <div className="relative">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex flex-col items-center text-gray-300 hover:text-white transition-all duration-300"
        >
          <motion.div
            whileHover={{
              rotate: 90,
              scale: 1.1,
              color: "#a855f7",
              textShadow: "0 0 10px rgba(168,85,247,0.8)",
            }}
            transition={{ duration: 0.3 }}
          >
            <Settings className="w-6 h-6" />
          </motion.div>
          <span className="text-[10px] sm:text-xs mt-1 opacity-80">Menu</span>
        </motion.button>

        {/* Animated Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-10 left-8 md:left-10 bg-[#1e1b3a] border border-white/10 
                         shadow-[0_0_15px_rgba(168,85,247,0.3)] rounded-xl p-3 w-28 flex flex-col 
                         space-y-2 text-sm text-gray-200 z-50"
            >
              {userData ? (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center gap-2 hover:text-pink-400 transition-all"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-2 hover:text-green-400 transition-all"
                >
                  <LogIn className="w-4 h-4" /> Login
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default LeftNavbar;
