import React from "react";
import { motion } from "framer-motion";

const Loading = () => {
  return (
    <div className="flex items-center justify-center gap-3 text-white">
      <motion.div
        className="w-6 h-6 border-4 border-t-transparent border-purple-400 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
      />
      <motion.span
        className="text-sm sm:text-base bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent font-semibold"
        animate={{
          opacity: [0.6, 1, 0.6],
        }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        Loading...
      </motion.span>
    </div>
  );
};

export default Loading;
