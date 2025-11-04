import React, { useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Send,
  Bookmark,
  Edit3,
  Trash2,
  Flag,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import profileFallback from "../assets/avatar.png";
import axiosInstance from "../contexts/axiosInstance";
import { userDataContext } from "../contexts/UserContext.jsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading.jsx";
import CommentsSection from "../Pages/postPages/CommentSection.jsx";

const PostCard = (props) => {
  const item = props.item;
  const navigate = useNavigate();
  const { userData, getCurrentUser } = useContext(userDataContext);
  const id = item._id;
  // console.log(item);

  // States initialized to 0 or false to avoid flickers
  const [totalLike, setTotalLike] = useState(0);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false); // 🔹 menu toggle
  const [isLiked, setIsLiked] = useState(false);
  const [totalComment, setTotalComment] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [totalShare, setTotalShare] = useState(0);
  const [isFollow, setIsFollow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const delay = 0.1;

  // console.log(item.user._id);
  // Optimized data fetching with parallel requests
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        // Ensure current user data is loaded (ideally call this once in app, here just for example)
        await getCurrentUser();

        // Parallel API calls to fetch all necessary data
        const [
          likeResponse,
          commentResponse,
          shareResponse,
          saveCountResponse,
        ] = await Promise.all([
          axiosInstance.get(`/api/posts/alllike/${id}`, {
            withCredentials: true,
          }),
          axiosInstance.get(`/api/comment/allcomment/${id}`, {
            withCredentials: true,
          }),
          axiosInstance.get(`/api/posts/sharecount/${id}`, {
            withCredentials: true,
          }),
          axiosInstance.get(`/api/posts/savecount/${id}`, {
            withCredentials: true,
          }),
        ]);

        setTotalLike(likeResponse.data?.likes?.length ?? 0);
        setTotalComment(commentResponse.data?.total ?? 0);
        setTotalShare(shareResponse.data?.shareCount ?? 0);
        setTotalSaved(saveCountResponse.data?.totalSaves ?? 0);
      } catch (error) {
        console.error("Error fetching post data:", error);
      }
    };

    fetchData();
  }, [id]);

  const checkOwner = async () => {
    try {
      if (!id) return;
      getCurrentUser();
      const response = await axiosInstance.get(`/api/posts/owner/${id}`);
      setIsOwner(response.data.isOwner);
      // console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        await checkOwner();
        await getCurrentUser();
        const [userIsfollowsResponse, userLikeResponse, userSaveResponse] =
          await Promise.all([
            await axiosInstance.get(`/api/users/isfollower/${item.user._id}`, {
              withCredentials: true,
            }),
            axiosInstance.get(`/api/posts/like/user/${id}`, {
              withCredentials: true,
            }),
            axiosInstance.get(`/api/posts/save/user/${id}`, {
              withCredentials: true,
            }),
          ]);

        setIsFollow(userIsfollowsResponse.data.isFollows);
        setIsLiked(!!userLikeResponse.data.isLiked);
        setIsSaved(!!userSaveResponse.data.isSaved);
      } catch (error) {
        console.log(error.message);
      }
    };

    fetch();
  }, [id]);

  // Handlers with optimistic UI updates

  const LikeHandler = async () => {
    if (!userData) {
      toast.error("Login to like");
      return;
    }
    // Optimistic UI update
    setIsLiked((prev) => {
      setTotalLike((prevCount) => (prev ? prevCount - 1 : prevCount + 1));
      return !prev;
    });

    try {
      await axiosInstance.get(`/api/posts/like/${id}`, {
        withCredentials: true,
      });
    } catch (error) {
      // Revert UI on error
      setIsLiked((prev) => {
        setTotalLike((prevCount) => (prev ? prevCount + 1 : prevCount - 1));
        return !prev;
      });
      console.error("Like error:", error);
    }
  };

  const SavedHandler = async () => {
    if (!userData) {
      toast.error("Login to save");
      return;
    }
    // Optimistic UI update
    setIsSaved((prev) => {
      setTotalSaved((prevCount) => (prev ? prevCount - 1 : prevCount + 1));
      return !prev;
    });

    try {
      await axiosInstance.get(`/api/posts/save/${id}`, {
        withCredentials: true,
      });
    } catch (error) {
      // Revert UI on error
      setIsSaved((prev) => {
        setTotalSaved((prevCount) => (prev ? prevCount + 1 : prevCount - 1));
        return !prev;
      });
      console.error("Save error:", error);
    }
  };

  const shareHandler = async () => {
    if (!userData) {
      toast.error("Login for share");
      return;
    }
    setTotalShare((prev) => prev + 1); // optimistic update

    try {
      await axiosInstance.get(`/api/posts/share/${id}`, {
        withCredentials: true,
      });
    } catch (error) {
      setTotalShare((prev) => (prev > 0 ? prev - 1 : 0)); // revert count
      console.error("Share error:", error);
    }
  };

  const CommentHandler = () => {
    navigate(`/comment/${id}`);
  };

  const followHandler = async () => {
    try {
      if (!userData) {
        toast.error("Login for follow");
        return;
      }
      setIsFollow((prev) => !prev);
      const response = await axiosInstance.get(
        `/api/users/follow/${item?.user?._id}`
      );

      console.log(response);
      setIsFollow((prev) => !prev);
    } catch (error) {
      console.log(error);
      setIsFollow((prev) => !prev);
    }
  };

  // 🔹 menu options
  const handleMenuAction = (action) => {
    setShowMenu(false);
    if (action === "report") toast.info("Post reported");
    else if (action === "interested") toast.success("Marked as interested");
    else if (action === "not-interested")
      toast.warn("Marked as not interested");
  };

  const editHandler = async () => {
    try {
      navigate(`/post/edit/${item?._id}`);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteHandler = async () => {
    try {
      setLoading(false);
      // if (!item?.id) return;
      console.log(item._id);
      const response = await axiosInstance.get(
        `/api/posts/post-delete/${item?._id}`,
        {
          withCredentials: true,
        }
      );
      toast.success("post deleted successfully");
    } catch (error) {
      console.log(error);
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(errorMessage);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        key={item?._id}
        onDoubleClick={() => navigate(`/post/${id}`)}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay }}
        className="w-full max-w-md backdrop-blur-xl bg-gradient-to-b from-white/10 to-white/5   border border-white/10 rounded-2xl shadow-lg overflow-hidden hover:shadow-[0_0_25px_rgba(168,85,247,0.2)]  transition-all duration-500"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3">
          <div
            onClick={() => navigate(`/profile/${item?.user?._id}`)}
            className="flex   hover:cursor-pointer items-center gap-3"
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
            {" "}
            {!isFollow && (
              <button
                onClick={followHandler}
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
            {/* 🔹 Animated Dropdown Menu */}
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 flex flex-col bg-[#1a1533]/95 border border-white/10 
      rounded-xl shadow-lg backdrop-blur-xl w-44 z-[999] overflow-visible p-1 space-y-1"
                >
                  {isOwner ? (
                    <>
                      {/* EDIT BUTTON */}
                      <button
                        onClick={editHandler}
                        className="flex items-center gap-2 text-blue-400 text-sm px-4 py-2 hover:bg-white/10 rounded-md transition-all"
                      >
                        <Edit3 size={16} /> Edit
                      </button>

                      {/* DELETE BUTTON */}
                      <button
                        onClick={deleteHandler}
                        className="flex items-center gap-2 text-red-400 text-sm px-4 py-2 hover:bg-white/10 rounded-md transition-all"
                      >
                        <Trash2 size={16} /> {loading ? <Loading /> : "Delete"}
                      </button>
                    </>
                  ) : (
                    <>
                      {/* REPORT */}
                      <button
                        onClick={() => handleMenuAction("report")}
                        className="flex items-center gap-2 text-red-400 text-sm px-4 py-2 hover:bg-white/10 rounded-md transition-all"
                      >
                        <Flag size={16} /> Report
                      </button>

                      {/* INTERESTED */}
                      <button
                        onClick={() => handleMenuAction("interested")}
                        className="flex items-center gap-2 text-green-400 text-sm px-4 py-2 hover:bg-white/10 rounded-md transition-all"
                      >
                        <ThumbsUp size={16} /> Interested
                      </button>

                      {/* NOT INTERESTED */}
                      <button
                        onClick={() => handleMenuAction("not-interested")}
                        className="flex items-center gap-2 text-gray-300 text-sm px-4 py-2 hover:bg-white/10 rounded-md transition-all"
                      >
                        <ThumbsDown size={16} /> Not Interested
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
            className="relative"
          >
            <video
              src={item.videoContent}
              autoPlay
              muted
              loop
              className="w-full max-h-[450px] object-cover"
            />
          </motion.div>
        )}

        {/* Caption */}
        <div className="px-5 pb-4">
          {item?.content && (
            <p className="text-sm text-gray-300">
              <span className="font-semibold text-white">
                {item?.user?.username}
              </span>{" "}
              {item.content}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-5 py-3 text-gray-300">
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
              <MessageCircle
                // onClick={CommentHandler}
                onClick={() => setIsCommentsOpen(true)}
                className="w-6 h-6 cursor-pointer group-hover:text-purple-400 transition"
              />
              <span className="text-xs text-gray-400 mt-0.5 group-hover:text-purple-300 transition">
                {totalComment}
              </span>
              <CommentsSection
                postId={item._id}
                isOpen={isCommentsOpen}
                onClose={() => setIsCommentsOpen(false)}
              />
            </div>

            <div className="flex flex-col items-center group">
              <Send
                onClick={shareHandler}
                className="w-6 h-6 cursor-pointer group-hover:text-blue-400 transition"
              />
              <span className="text-xs text-gray-400 mt-0.5 group-hover:text-purple-300 transition">
                {totalShare}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center group">
            <Bookmark
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
      </motion.div>
    </>
  );
};

export default PostCard;
