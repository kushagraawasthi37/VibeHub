import React from "react";
import { motion } from "framer-motion";

function Loader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative flex flex-col items-center"
      >
        {/* Outer glowing ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2.5,
            ease: "linear",
            repeat: Infinity,
          }}
          className="w-24 h-24 rounded-full border-t-4 border-b-4 border-purple-600"
        ></motion.div>

        {/* Inner pulsing core */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.8, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-10 h-10 bg-purple-500 rounded-full shadow-[0_0_25px_5px_rgba(168,85,247,0.8)]"
        ></motion.div>

        {/* Text below */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-10 text-purple-300 tracking-widest text-lg font-semibold select-none"
        >
          Loading Vibes...
        </motion.p>
      </motion.div>
    </div>
  );
}

export default Loader;
