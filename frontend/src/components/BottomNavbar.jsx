import React from "react";
import { motion } from "framer-motion";
import { Home, Search, PlusSquare, PlayCircle, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BottomNavbar = () => {
  const navigate = useNavigate();
  const navItems = [
    { icon: <Home className="w-6 h-6" />, label: "Home", navLocation: "/" },
    {
      icon: <Search className="w-6 h-6" />,
      label: "Search",
      navLocation: "/search",
    },
    {
      icon: <PlusSquare className="w-6 h-6" />,
      label: "Create",
      navLocation: "/createpost",
    },
    {
      icon: <PlayCircle className="w-6 h-6" />,
      label: "Reels",
      navLocation: "/feed",
    },
    {
      icon: <User className="w-6 h-6" />,
      label: "Profile",
      navLocation: "/profile",
    },
  ];

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="fixed -bottom-0 left-0 w-full bg-gradient-to-r from-[#1a1533]/90 via-[#2a2459]/90 to-[#1a1533]/90 
                 backdrop-blur-2xl border-t border-white/10 shadow-[0_-2px_15px_rgba(168,85,247,0.3)] 
                 flex items-center justify-around py-3 sm:py-4 z-50 sm:hidden"
    >
      {navItems.map((item, index) => (
        <motion.button
          onClick={() => navigate(item.navLocation)}
          key={index}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 250 }}
          className="flex flex-col items-center text-gray-300 hover:text-white transition-all duration-100"
        >
          <motion.div
            whileHover={{
              background:
                "linear-gradient(90deg, rgba(168,85,247,1) 0%, rgba(236,72,153,1) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 8px rgba(236,72,153,0.6))",
            }}
            transition={{ duration: 0.25 }}
          >
            {item.icon}
          </motion.div>
          <span className="text-[10px] sm:text-xs mt-1">{item.label}</span>
        </motion.button>
      ))}
    </motion.div>
  );
};

export default BottomNavbar;
