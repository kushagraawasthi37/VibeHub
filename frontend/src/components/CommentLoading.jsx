import React from "react";
import { motion } from "framer-motion";

const CommentLoading = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white relative overflow-hidden">
      {/* Floating gradient blobs */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.3, scale: 1.2 }}
        transition={{ duration: 3, repeat: Infinity, repeatType: "mirror" }}
        className="absolute top-[-10%] left-[-10%] w-60 h-60 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl"
      ></motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.3, scale: 1.2 }}
        transition={{
          duration: 3,
          delay: 1,
          repeat: Infinity,
          repeatType: "mirror",
        }}
        className="absolute bottom-[-10%] right-[-10%] w-60 h-60 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl"
      ></motion.div>

      {/* Loader Animation */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1.1, opacity: 1, rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-t-transparent border-purple-500 rounded-full animate-spin shadow-[0_0_25px_rgba(168,85,247,0.6)]"
      ></motion.div>

      {/* Text */}
      <motion.h2
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 1,
          delay: 0.3,
          repeat: Infinity,
          repeatType: "mirror",
        }}
        className="mt-6 text-xl sm:text-2xl font-semibold text-gray-200 tracking-wide"
      >
        Loading VibeHub...
      </motion.h2>
    </div>
  );
};

export default CommentLoading;
