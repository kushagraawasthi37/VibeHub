import React, { useState } from "react";
import { motion } from "framer-motion";
import logo from "../../assets/logo.png";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/Loading";
import axiosInstance from "../../contexts/axiosInstance";
import LeftNavbar from "../../components/LeftNavbar";
import BottomNavbar from "../../components/BottomNavbar";
import { ArrowLeft } from "lucide-react";

const CreatePost = () => {
  const navigater = useNavigate();
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  // onChange handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (videoFile) {
        toast.error("You can upload either an image or a video, not both!");
        return;
      }
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (imageFile) {
        toast.error("You can upload either an image or a video, not both!");
        return;
      }
      setVideoFile(file);
      setPreviewVideo(URL.createObjectURL(file));
    }
  };

  const createPost = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("content", content);
      if (imageFile) formData.append("imageContent", imageFile);
      if (videoFile) formData.append("videoContent", videoFile);

      const response = await axiosInstance.post("/api/posts/post", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      toast.success(response.data.message);
      navigater("/");
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setContent("");
      setPreviewImage(null);
      setPreviewVideo(null);
      setImageFile(null);
      setVideoFile(null);
      setLoading(false);
    }
  };

  return (
    <>
      <LeftNavbar />
      <BottomNavbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white font-sans relative overflow-hidden px-4 py-10">
        {/* Floating Gradient Blobs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.25, scale: 1 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "mirror" }}
          className="absolute top-[-10%] left-[-10%] w-60 h-60 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl"
        ></motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.25, scale: 1 }}
          transition={{
            duration: 3,
            delay: 1,
            repeat: Infinity,
            repeatType: "mirror",
          }}
          className="absolute bottom-[-10%] right-[-10%] w-60 h-60 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl"
        ></motion.div>

        {/* 🔙 Back Button */}
        <motion.button
          onClick={() => navigater("/")}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="absolute top-6 left-6 sm:left-26 flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl border border-white/20 text-white font-medium shadow-md"
        >
          <ArrowLeft size={20} />
          Back
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-center space-x-3 mb-6"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
            Create a Post
          </h1>
          <motion.img
            src={logo}
            alt="logo"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-[0_0_15px_#a855f7]"
            initial={{ rotate: -15, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, type: "spring" }}
          />
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 p-6 rounded-2xl shadow-xl flex flex-col space-y-4"
        >
          {/* Text content */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="4"
            placeholder="What's on your mind?"
            className="p-3 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300 resize-none"
          />

          {/* Image Upload */}
          <div className="flex flex-col items-center justify-center border-2 border-purple-400 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="imageInput"
              onChange={handleImageChange}
            />
            <label htmlFor="imageInput" className="cursor-pointer text-center">
              {previewImage ? (
                <motion.img
                  src={previewImage}
                  alt="Preview"
                  className="w-full rounded-lg object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-sm sm:text-base text-gray-300"
                >
                  📷 Click to upload image
                </motion.div>
              )}
            </label>
          </div>

          {/* Video Upload */}
          <div className="flex flex-col items-center justify-center border-2 border-pink-400 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer">
            <input
              type="file"
              accept="video/*"
              className="hidden"
              id="videoInput"
              onChange={handleVideoChange}
            />
            <label htmlFor="videoInput" className="cursor-pointer text-center">
              {previewVideo ? (
                <motion.video
                  src={previewVideo}
                  controls
                  className="w-full rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-sm sm:text-base text-gray-300"
                >
                  🎥 Click to upload video
                </motion.div>
              )}
            </label>
          </div>

          {/* Post Button */}
          <motion.button
            onClick={createPost}
            whileHover={{
              scale: 1.05,
              background:
                "linear-gradient(90deg, rgba(168,85,247,1) 0%, rgba(236,72,153,1) 100%)",
              boxShadow: "0 0 20px rgba(168,85,247,0.7)",
            }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-full mt-2 bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-lg font-semibold text-base sm:text-lg shadow-md transition-all duration-300"
          >
            {loading ? <Loading /> : "Post Now 🚀"}
          </motion.button>
        </motion.div>
      </div>
    </>
  );
};

export default CreatePost;
