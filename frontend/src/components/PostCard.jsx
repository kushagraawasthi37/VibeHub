import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import {
  FiMessageCircle,
  FiSend,
  FiBookmark,
  FiEdit3,
  FiTrash2,
  FiFlag,
  FiThumbsUp,
  FiThumbsDown,
} from "react-icons/fi";
import { userDataContext } from "../contexts/UserContext";
import CommentsSection from "../Pages/postPages/CommentSection";
import profileFallback from "../assets/avatar.png";
import axiosInstance from "../contexts/axiosInstance";
import { toast } from "react-toastify";

const PostCard = ({ item, setContent, content }) => {
  const navigate = useNavigate();
  const { userData } = useContext(userDataContext);

  const [isLiked, setIsLiked] = useState(item?.stats?.isLiked ?? false);
  const [isSaved, setIsSaved] = useState(item?.stats?.isSaved ?? false);
  const [totalLike, setTotalLike] = useState(item?.stats?.likes ?? 0);
  const [totalComment] = useState(item?.stats?.comments ?? 0);
  const [totalSaved, setTotalSaved] = useState(item.stats?.saves ?? 0);
  const [totalShare, setTotalShare] = useState(item?.stats?.shares ?? 0);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  const isOwner = userData?._id === item.user._id;

  const [isFollow, setIsFollow] = useState(
    item.isFollowing !== undefined ? !item.isFollowing && !isOwner : !isOwner
  );

  const handleFollow = async () => {
    if (!userData) {
      toast.error("Login for follow");
      return;
    }
    setIsFollow(false);
    try {
      await axiosInstance.get(`/api/users/follow/${item.user._id}`, {
        withCredentials: true,
      });
      setContent((prev) => prev.filter((p) => p._id !== item._id));
    } catch (error) {
      setIsFollow(true);
      toast.error(error.response?.data?.message || "Error following user");
    }
  };

  const LikeHandler = async () => {
    if (!userData) {
      toast.error("Login to like");
      return;
    }
    setIsLiked((prev) => {
      setTotalLike((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
    try {
      await axiosInstance.get(`/api/posts/like/${item._id}`, {
        withCredentials: true,
      });
    } catch (error) {
      setIsLiked((prev) => {
        setTotalLike((c) => (prev ? c + 1 : c - 1));
        return !prev;
      });
    }
  };

  const SavedHandler = async () => {
    if (!userData) {
      toast.error("Login to save");
      return;
    }
    setIsSaved((prev) => {
      setTotalSaved((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
    try {
      await axiosInstance.get(`/api/posts/save/${item._id}`, {
        withCredentials: true,
      });
    } catch (error) {
      setIsSaved((prev) => {
        setTotalSaved((c) => (prev ? c + 1 : c - 1));
        return !prev;
      });
    }
  };

  const shareHandler = async () => {
    if (!userData) {
      toast.error("Login for share");
      return;
    }
    setTotalShare((prev) => prev + 1);
    try {
      await axiosInstance.get(`/api/posts/share/${item._id}`, {
        withCredentials: true,
      });
    } catch (error) {
      setTotalShare((prev) => (prev > 0 ? prev - 1 : 0));
    }
  };

  const handleMenuAction = (action) => {
    setShowMenu(false);
    if (action === "report") toast.info("Post reported");
    else if (action === "interested") toast.success("Marked as interested");
    else if (action === "not-interested")
      toast.warn("Marked as not interested");
  };

  const editHandler = () => navigate(`/post/edit/${item?._id}`);

  const deleteHandler = async () => {
    setLoading(true);
    try {
      await axiosInstance.get(`/api/posts/post-delete/${item?._id}`, {
        withCredentials: true,
      });
      toast.success("Post deleted successfully");
      setContent((prev) => prev.filter((p) => p._id !== item._id));
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ New: Handle video visibility
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  return (
    <>
      <motion.div
        key={item._id}
        onDoubleClick={() => navigate(`/post/${item._id}`)}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="w-full max-w-md backdrop-blur-xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-2xl shadow-lg overflow-hidden hover:shadow-[0_0_25px_rgba(168,85,247,0.2)] transition-all duration-500"
      >
        <div className="flex items-center justify-between p-3">
          <div
            onClick={() => navigate(`/profile/${item?.user?._id}`)}
            className="flex hover:cursor-pointer items-center gap-3"
          >
            <img
              src={item?.user?.avatar || profileFallback}
              alt="profile"
              className="w-10 h-10 rounded-full border border-purple-500"
            />
            <div className="flex flex-col gap-1">
              <div className="flex gap-1">
                <h3 className="font-semibold text-sm sm:text-base text-white">
                  {item?.user?.username || "Anonymous"}
                </h3>
              </div>
              <p className="text-xs text-gray-400">
                {new Date(item.date).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {!isOwner && isFollow && (
              <button
                onClick={handleFollow}
                className="ml-3 bg-purple-600 hover:bg-purple-700 transition text-white text-xs px-3 py-1 rounded-md"
              >
                Follow
              </button>
            )}
            <button
              className="text-gray-400 hover:text-white text-lg font-bold"
              onClick={() => setShowMenu((prev) => !prev)}
            >
              •••
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 flex flex-col bg-[#1a1533]/95 border border-white/10 rounded-xl shadow-lg backdrop-blur-xl w-44 z-[999] overflow-visible p-1 space-y-1"
                >
                  {isOwner ? (
                    <>
                      <button
                        onClick={editHandler}
                        className="flex items-center gap-2 text-blue-400 text-sm px-4 py-2 hover:bg-white/10 rounded-md transition-all"
                      >
                        <FiEdit3 size={16} /> Edit
                      </button>
                      <button
                        onClick={deleteHandler}
                        className="flex items-center gap-2 text-red-400 text-sm px-4 py-2 hover:bg-white/10 rounded-md transition-all"
                      >
                        <FiTrash2 size={16} /> {loading ? "..." : "Delete"}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleMenuAction("report")}
                        className="flex items-center gap-2 text-red-400 text-sm px-4 py-2 hover:bg-white/10 rounded-md transition-all"
                      >
                        <FiFlag size={16} /> Report
                      </button>
                      <button
                        onClick={() => handleMenuAction("interested")}
                        className="flex items-center gap-2 text-green-400 text-sm px-4 py-2 hover:bg-white/10 rounded-md transition-all"
                      >
                        <FiThumbsUp size={16} /> Interested
                      </button>
                      <button
                        onClick={() => handleMenuAction("not-interested")}
                        className="flex items-center gap-2 text-gray-300 text-sm px-4 py-2 hover:bg-white/10 rounded-md transition-all"
                      >
                        <FiThumbsDown size={16} /> Not Interested
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Media Section */}
        {item.imageContent && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            <img
              src={item.imageContent}
              alt="post"
              className="w-full max-h-[450px] object-cover"
            />
          </motion.div>
        )}

        {item.videoContent && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.4 }}
            className="relative flex justify-center items-center"
          >
            {!isVideoLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-6 h-6 border-2 border-t-transparent border-purple-400 rounded-full animate-spin"></div>
              </div>
            )}
            <video
              src={item.videoContent}
              autoPlay
              muted
              loop
              playsInline
              onLoadedData={() => setIsVideoLoaded(true)}
              className={`w-full max-h-[450px] object-cover transition-opacity duration-500 ${
                isVideoLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </motion.div>
        )}

        <div className="px-3 pb-4 pt-4">
          {item?.content && (
            <p className="text-sm text-gray-300">
              <span className="font-semibold text-white">
                {item?.user?.username}
              </span>{" "}
              {item.content}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between px-3 py-3 text-gray-300">
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center group">
              {isLiked ? (
                <AiFillHeart
                  onClick={LikeHandler}
                  className="w-6 h-6 cursor-pointer text-red-500 transition"
                />
              ) : (
                <AiOutlineHeart
                  onClick={LikeHandler}
                  className="w-6 h-6 cursor-pointer text-gray-400 group-hover:text-pink-500 transition"
                />
              )}
              <span className="text-xs text-gray-400 mt-0.5 group-hover:text-pink-400 transition">
                {totalLike}
              </span>
            </div>
            <div className="flex flex-col items-center group">
              <FiMessageCircle
                onClick={() => setIsCommentsOpen(true)}
                className="w-6 h-6 cursor-pointer group-hover:text-purple-400 transition"
              />
              <span className="text-xs text-gray-400 mt-0.5 group-hover:text-purple-300 transition">
                {totalComment}
              </span>
            </div>
            <div className="flex flex-col items-center group">
              <FiSend
                onClick={shareHandler}
                className="w-6 h-6 cursor-pointer group-hover:text-blue-400 transition"
              />
              <span className="text-xs text-gray-400 mt-0.5 group-hover:text-purple-300 transition">
                {totalShare}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center group">
            <FiBookmark
              onClick={SavedHandler}
              className={`w-6 h-6 cursor-pointer transition ${
                isSaved
                  ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]"
                  : "text-gray-300 hover:text-yellow-400"
              }`}
              fill={isSaved ? "currentColor" : "none"}
            />
            <span className="text-xs text-gray-400 mt-0.5 group-hover:text-yellow-300 transition">
              {isSaved ? "Saved" : totalSaved}
            </span>
          </div>
        </div>
        {isCommentsOpen && (
          <CommentsSection
            postId={item._id}
            isOpen={isCommentsOpen}
            onClose={() => setIsCommentsOpen(false)}
          />
        )}
      </motion.div>
    </>
  );
};

export default PostCard;
