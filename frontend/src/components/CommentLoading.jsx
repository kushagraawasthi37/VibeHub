import React from "react";
import { motion } from "framer-motion";

const CommentLoading = () => {
  return (
    <div
      className="w-full h-60 flex flex-col items-center justify-center 
      bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] 
      text-white relative overflow-hidden rounded-t-2xl border-t border-white/20"
    >
      {/* Floating gradient blobs */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.25, scale: 1.1 }}
        transition={{ duration: 3, repeat: Infinity, repeatType: "mirror" }}
        className="absolute top-[-20%] left-[-20%] w-40 h-40 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl"
      ></motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.25, scale: 1.1 }}
        transition={{
          duration: 3,
          delay: 1,
          repeat: Infinity,
          repeatType: "mirror",
        }}
        className="absolute bottom-[-20%] right-[-20%] w-40 h-40 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl"
      ></motion.div>

      {/* Loader */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1.1, opacity: 1, rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        className="w-12 h-12 border-4 border-t-transparent border-purple-500 rounded-full animate-spin"
      ></motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, repeat: Infinity, repeatType: "mirror" }}
        className="mt-4 text-gray-300 text-base"
      >
        Loading Comments...
      </motion.p>
    </div>
  );
};

export default CommentLoading;
