import React from "react";
import { motion } from "framer-motion";
import {
  Home,
  Search,
  PlusSquare,
  PlayCircle,
  User,
  Share2,
  Menu,
} from "lucide-react";
import logo from "../assets/logo.png"; // 🔹 Replace with your VH logo image path
import { useNavigate } from "react-router-dom";

const LeftNavbar = () => {
  const navigate = useNavigate();
  const navItems = [
    { icon: <Home className="w-6 h-6" />, label: "Home", location: "/" },
    {
      icon: <Search className="w-6 h-6" />,
      label: "Search",
      location: "/search",
    },
    {
      icon: <PlusSquare className="w-6 h-6" />,
      label: "Create",
      location: "/createpost",
    },
    {
      icon: <PlayCircle className="w-6 h-6" />,
      label: "Reels",
      location: "/feed",
    },
    {
      icon: <User className="w-6 h-6" />,
      label: "Profile",
      location: "/profile",
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      label: "Share",
      location: "/messages",
    },
    { icon: <Menu className="w-6 h-6" />, label: "Menu", location: "/menu" },
  ];

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="hidden sm:flex fixed top-0 left-0 h-full  sm:w-24 md:w-28 
                 bg-gradient-to-b from-[#0f0c29]/95 via-[#302b63]/90 to-[#24243e]/95
                 backdrop-blur-2xl border-r border-white/10 shadow-[2px_0_25px_rgba(168,85,247,0.25)]
                 flex-col items-center justify-between py-8 z-50"
    >
      <div>
        {/* 🔹 Logo (Animated Glow Logo) */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 150, damping: 10 }}
          className="mb-8"
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

        {/* 🔹 Navigation Buttons */}
        <div className="flex flex-col space-y-6 mt-4">
          {navItems.map((item, index) => (
            <motion.button
              onClick={() => navigate(item.location)}
              key={index}
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center text-gray-300 hover:text-white 
                       transition-all duration-300"
            >
              <motion.div
                whileHover={{
                  scale: 1.1,
                  color: "#a855f7",
                  textShadow: "0 0 10px rgba(168,85,247,0.8)",
                }}
                transition={{ duration: 0.2 }}
              >
                {item.icon}
              </motion.div>
              <span className="text-[10px] sm:text-xs mt-1 opacity-80">
                {item.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
      {/* 🔹 Bottom Accent Line */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "40%" }}
        transition={{ duration: 0.8 }}
        className="h-[3px] rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_10px_#a855f7]"
      />
    </motion.div>
  );
};

export default LeftNavbar;
