import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import {
  Send,
  MessageCircle,
  Bookmark,
  Edit3,
  Trash2,
  Flag,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { ArrowLeft } from "lucide-react";
import axiosInstance from "../../contexts/axiosInstance";
import { userDataContext } from "../../contexts/UserContext";
import { toast } from "react-toastify";
import Loading from "../../components/Loading";
import CommentsSection from "../postPages/CommentSection";
import profileFallback from "../../assets/avatar.png";
import BottomNavbar from "../../components/BottomNavbar";
import LeftNavbar from "../../components/LeftNavbar";

const SinglePostPage = () => {
  const { postid } = useParams();
  const navigate = useNavigate();
  const { userData, getCurrentUser } = useContext(userDataContext);

  const [post, setPost] = useState(null);
  const [totalLike, setTotalLike] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [totalComment, setTotalComment] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [totalShare, setTotalShare] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (!postid) return;
        setLoading(true);
        await getCurrentUser();
        const response = await axiosInstance.get(`/api/posts/post/${postid}`);
        // setPost(res.data.post);
        console.log(response.data.post);
        setPost(response?.data?.post);
        setTotalLike(response?.data?.post?.stats?.likes);
        setTotalComment(response?.data?.post?.stats?.comments);
        setIsLiked(response?.data?.post?.stats?.isLiked);
        setIsSaved(response?.data?.post?.stats?.isSaved);
        setTotalShare(response?.data?.post?.stats?.shares);
        setTotalSaved(response?.data?.post?.stats?.saves);
        setIsOwner(response?.data?.post?.user?._id === userData._id);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postid]);

  const LikeHandler = async () => {
    if (!userData) return toast.error("Login to like");
    setIsLiked((prev) => !prev);
    setTotalLike((prev) => (isLiked ? prev - 1 : prev + 1));

    try {
      await axiosInstance.get(`/api/posts/like/${postid}`);
    } catch {
      setIsLiked((prev) => !prev);
      setTotalLike((prev) => (isLiked ? prev + 1 : prev - 1));
    }
  };

  const SavedHandler = async () => {
    if (!userData) return toast.error("Login to save");
    setIsSaved((prev) => !prev);
    setTotalSaved((prev) => (isSaved ? prev - 1 : prev + 1));
    try {
      await axiosInstance.get(`/api/posts/save/${postid}`);
    } catch {
      setIsSaved((prev) => !prev);
      setTotalSaved((prev) => (isSaved ? prev + 1 : prev - 1));
    }
  };

  const shareHandler = async () => {
    if (!userData) return toast.error("Login to share");
    setTotalShare((prev) => prev + 1);
    try {
      await axiosInstance.get(`/api/posts/share/${postid}`);
    } catch {
      setTotalShare((prev) => (prev > 0 ? prev - 1 : 0));
    }
  };

  const deleteHandler = async () => {
    try {
      setLoading(true);
      await axiosInstance.get(`/api/posts/post-delete/${postid}`);
      toast.success("Post deleted");
      navigate("/");
    } catch (error) {
      toast.error("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const editHandler = () => navigate(`/post/edit/${postid}`);

  if (loading || !post)
    return (
      <div className="flex justify-center items-center h-screen text-white">
        <Loading text="Loading Post..." />
      </div>
    );

  return (
    <>
      <div className="flex w-full min-h-screen bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#0f172a] text-white relative">
        {/* Left Navbar for md and up */}
        <div className="hidden sm:block fixed left-0 top-0 h-full">
          <LeftNavbar />
        </div>

        {/* Main Post Content */}
        <div className="flex-1 flex justify-center items-start w-full sm:ml-[90px] pt-6 pb-20 px-3 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-2xl flex flex-col items-center"
          >
            {/* Header */}
            <div className="flex items-center justify-between w-full mb-6">
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate(`/profile/${post?.user?._id}`)}
              >
                <img
                  src={post?.user?.avatar || profileFallback}
                  alt="profile"
                  className="w-12 h-12 rounded-full border border-purple-500 object-cover"
                />
                <div>
                  <h2 className="font-semibold text-lg">
                    {post?.user?.username}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {new Date(post.date).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowMenu((p) => !p)}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  •••
                </button>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-8 w-44 bg-[#1a1533]/95 border border-white/10 rounded-xl shadow-lg backdrop-blur-xl z-50 p-1"
                    >
                      {isOwner ? (
                        <>
                          <button
                            onClick={editHandler}
                            className="flex items-center gap-2 text-blue-400 text-sm px-4 py-2 hover:bg-white/10 rounded-md w-full text-left"
                          >
                            <Edit3 size={16} /> Edit
                          </button>
                          <button
                            onClick={deleteHandler}
                            className="flex items-center gap-2 text-red-400 text-sm px-4 py-2 hover:bg-white/10 rounded-md w-full text-left"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="flex items-center gap-2 text-red-400 text-sm px-4 py-2 hover:bg-white/10 rounded-md w-full text-left">
                            <Flag size={16} /> Report
                          </button>
                          <button className="flex items-center gap-2 text-green-400 text-sm px-4 py-2 hover:bg-white/10 rounded-md w-full text-left">
                            <ThumbsUp size={16} /> Interested
                          </button>
                          <button className="flex items-center gap-2 text-gray-300 text-sm px-4 py-2 hover:bg-white/10 rounded-md w-full text-left">
                            <ThumbsDown size={16} /> Not Interested
                          </button>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Post Media */}
            {post.imageContent && (
              <motion.img
                src={post.imageContent}
                alt="post"
                className="w-full max-h-[80vh] rounded-xl shadow-xl object-contain mb-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              />
            )}
            {post.videoContent && (
              <motion.video
                src={post.videoContent}
                autoPlay
                muted
                loop
                controls
                className="w-full max-h-[80vh] rounded-xl shadow-xl mb-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              />
            )}

            {/* Caption */}
            {post.content && (
              <p className="w-full text-gray-200 text-base mb-6 leading-relaxed">
                <span className="font-semibold text-white mr-2">
                  {post?.user?.username}
                </span>
                {post.content}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between w-full mb-6">
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-center">
                  {isLiked ? (
                    <AiFillHeart
                      onClick={LikeHandler}
                      className="w-7 h-7 cursor-pointer text-red-500 transition"
                    />
                  ) : (
                    <AiOutlineHeart
                      onClick={LikeHandler}
                      className="w-7 h-7 cursor-pointer text-gray-400 hover:text-pink-500 transition"
                    />
                  )}
                  <span className="text-xs text-gray-400 mt-1">
                    {totalLike} Likes
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <MessageCircle
                    onClick={() => setIsCommentsOpen(true)}
                    className="w-7 h-7 cursor-pointer text-gray-400 hover:text-purple-400 transition"
                  />
                  <span className="text-xs text-gray-400 mt-1">
                    {totalComment} Comments
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <Send
                    onClick={shareHandler}
                    className="w-7 h-7 cursor-pointer text-gray-400 hover:text-blue-400 transition"
                  />
                  <span className="text-xs text-gray-400 mt-1">
                    {totalShare} Shares
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <Bookmark
                  onClick={SavedHandler}
                  className={`w-7 h-7 cursor-pointer transition ${
                    isSaved
                      ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]"
                      : "text-gray-300 hover:text-yellow-400"
                  }`}
                  fill={isSaved ? "currentColor" : "none"}
                />
                <span className="text-xs text-gray-400 mt-1">
                  {isSaved ? "Saved" : `${totalSaved} Saves`}
                </span>
              </div>
            </div>

            {/* Comments Section */}
            <div className="w-full">
              <CommentsSection
                postId={postid}
                isOpen={isCommentsOpen}
                onClose={() => setIsCommentsOpen(false)}
              />
            </div>
          </motion.div>
        </div>

        {/* Bottom Navbar for mobile */}
        <div className="sm:hidden fixed bottom-0 w-full">
          <BottomNavbar />
        </div>
      </div>
    </>
  );
};

export default SinglePostPage;
