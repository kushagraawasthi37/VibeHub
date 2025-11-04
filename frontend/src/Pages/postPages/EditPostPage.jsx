import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../contexts/axiosInstance.js";
import { motion } from "framer-motion";
import {
  FileEdit,
  Camera,
  Video,
  SendHorizontal,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-toastify";

const EditPostPage = () => {
  const { postid } = useParams();
  const navigate = useNavigate();
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleMediaChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === "image") {
      setImage(file);
      setVideo(null);
      setPreview(URL.createObjectURL(file));
    } else {
      setVideo(file);
      setImage(null);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!caption && !image && !video) {
      return setMessage("Please enter a caption or upload a media file.");
    }

    const formData = new FormData();
    formData.append("content", caption);
    if (image) formData.append("imageContent", image);
    if (video) formData.append("videoContent", video);

    try {
      setLoading(true);
      const res = await axios.post(`/api/posts/update/${postid}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      toast.success(res.data.message);
      console.log("Updated Post:", res.data.post);
      setCaption("");
      navigate("/"); // Redirect to home after success (optional)
    } catch (err) {
      console.error("Update error:", err.message);
      toast.error(
        err.response?.data?.message || "Failed to update post. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center bg-[#0d0b1a]"
    >
      <motion.form
        onSubmit={handleSubmit}
        className="bg-[#1a1533]/90 p-8 rounded-2xl shadow-lg border border-white/10 w-[90%] max-w-md space-y-6 text-white relative"
      >
        {/* 🔙 Back Button */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="absolute left-4 top-4 flex items-center gap-1 text-gray-300 hover:text-white transition"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Title */}
        <div className="flex items-center justify-center gap-2 text-lg font-semibold mt-4">
          <FileEdit className="text-blue-400" />
          <span>Edit Post</span>
        </div>

        {/* Caption */}
        <textarea
          placeholder="Update your caption (optional)..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none resize-none focus:border-blue-400"
          rows="4"
        ></textarea>

        {/* Media Preview */}
        {preview && (
          <div className="rounded-xl overflow-hidden border border-white/10">
            {image ? (
              <img src={preview} alt="Preview" className="w-full" />
            ) : (
              <video src={preview} controls className="w-full" />
            )}
          </div>
        )}

        {/* Upload Options */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer text-blue-400 hover:text-blue-300">
            <Camera />
            <span>Image</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleMediaChange(e, "image")}
            />
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-purple-400 hover:text-purple-300">
            <Video />
            <span>Video</span>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => handleMediaChange(e, "video")}
            />
          </label>
        </div>

        {/* Submit Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 py-2 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition"
        >
          {loading ? "Updating..." : <SendHorizontal size={18} />}
          {!loading && <span>Update Post</span>}
        </motion.button>

        {/* Message */}
        {message && (
          <p className="text-center text-sm text-gray-300 mt-2">{message}</p>
        )}
      </motion.form>
    </motion.div>
  );
};

export default EditPostPage;
