import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send, Bookmark } from "lucide-react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import profileFallback from "../assets/avatar.png";
import axiosInstance from "../contexts/axiosInstance";
import { userDataContext } from "../contexts/UserContext.jsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const PostCard = ({ item = {} }) => {
  const navigate = useNavigate();
  const { userData, getCurrentUser } = useContext(userDataContext);

  const id = item._id;

  // States initialized to 0 or false to avoid flickers
  const [totalLike, setTotalLike] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [totalComment, setTotalComment] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [totalShare, setTotalShare] = useState(0);

  const delay = 0.1;

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
          userLikeResponse,
          userSaveResponse,
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
          axiosInstance.get(`/api/posts/like/user/${id}`, {
            withCredentials: true,
          }),
          axiosInstance.get(`/api/posts/save/user/${id}`, {
            withCredentials: true,
          }),
        ]);

        setTotalLike(likeResponse.data?.likes?.length ?? 0);
        setTotalComment(commentResponse.data?.total ?? 0);
        setTotalShare(shareResponse.data?.shareCount ?? 0);
        setTotalSaved(saveCountResponse.data?.totalSaves ?? 0);
        setIsLiked(!!userLikeResponse.data.isLiked);
        setIsSaved(!!userSaveResponse.data.isSaved);
      } catch (error) {
        console.error("Error fetching post data:", error);
      }
    };

    fetchData();
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
    navigate("/comment");
  };

  return (
    <>
      <motion.div
        key={item?._id}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay }}
        className="w-full max-w-md backdrop-blur-xl bg-gradient-to-b from-white/10 to-white/5 
          border border-white/10 rounded-2xl shadow-lg overflow-hidden hover:shadow-[0_0_25px_rgba(168,85,247,0.2)] 
          transition-all duration-500"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <img
              src={item?.user?.avatar || profileFallback}
              alt="profile"
              className="w-10 h-10 rounded-full border border-purple-500"
            />
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-white">
                {item?.user?.username || "Anonymous"}
              </h3>
              <p className="text-xs text-gray-400">
                {new Date(item.date).toLocaleString()}
              </p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-white">•••</button>
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
          {totalComment > 0 && (
            <p
              onClick={CommentHandler}
              className="text-xs text-gray-400 mt-2 cursor-pointer hover:text-purple-400"
            >
              View all {totalComment} comments
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
                onClick={CommentHandler}
                className="w-6 h-6 cursor-pointer group-hover:text-purple-400 transition"
              />
              <span className="text-xs text-gray-400 mt-0.5 group-hover:text-purple-300 transition">
                {totalComment}
              </span>
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
