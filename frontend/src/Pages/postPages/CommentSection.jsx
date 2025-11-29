// CommentsSection.jsx
import React, { useEffect, useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../contexts/axiosInstance.js";
import { userDataContext } from "../../contexts/UserContext.jsx";
import { toast } from "react-toastify";
import { Pencil, Trash2, Heart, Send, X } from "lucide-react";
import Loading from "../../components/Loading.jsx";

const CommentsSection = ({ postId, isOpen, onClose, embedded = false }) => {
  const { userData } = useContext(userDataContext);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [commentLikes, setCommentLikes] = useState({});

  // fetch comments
  const getComments = async () => {
    if (!postId) return;
    try {
      const res = await axiosInstance.get(`/api/comment/allcomment/${postId}`);
      const commentsList = res?.data?.comments || [];
      setComments(commentsList);
      await fetchAllCommentLikes(commentsList);
    } catch (err) {
      console.log("getComments err", err);
    }
  };

  useEffect(() => {
    if (isOpen) getComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, isOpen]);

  const fetchAllCommentLikes = async (commentsList) => {
    try {
      const likesData = {};
      await Promise.all(
        commentsList.map(async (c) => {
          const res = await axiosInstance.get(`/api/comment/all/${c._id}`);
          likesData[c._id] = {
            totalLikes: res.data.totalLikes,
            likedByUser: res.data.likes?.some(
              (like) => like.likedBy?._id === userData?._id
            ),
          };
        })
      );
      setCommentLikes(likesData);
    } catch (err) {
      console.log("Failed to fetch comment likes", err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!userData) return toast.error("Please login to comment!");
    if (!newComment.trim()) return;
    try {
      setLoading(true);
      await axiosInstance.post(`/api/comment/add/${postId}`, {
        content: newComment,
      });
      setNewComment("");
      getComments();
    } catch (err) {
      console.log("add comment err", err);
      toast.error("Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.post(`/api/comment/delete/${id}`);
      getComments();
    } catch (err) {
      console.log("delete err", err);
      toast.error("Delete failed");
    }
  };

  const handleEdit = async (id) => {
    try {
      await axiosInstance.post(`/api/comment/edit/${id}`, {
        content: editText,
      });
      setEditId(null);
      setEditText("");
      getComments();
    } catch (err) {
      console.log("edit err", err);
      toast.error("Edit failed");
    }
  };

  const handleLike = async (id) => {
    if (!userData) return toast.error("Login to like comments!");
    try {
      await axiosInstance.post(`/api/comment/like/${id}`);
      getComments();
    } catch (err) {
      console.log("like err", err);
      toast.error("Like failed");
    }
  };

  // choose classes based on embedded mode
  const overlayClass = embedded
    ? "absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
    : "fixed inset-0 bg-black/60 backdrop-blur-sm z-40";

  const sheetClass = embedded
    ? `absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460]
       text-white rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto shadow-xl touch-pan-y`
    : `fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460]
       text-white rounded-t-3xl p-5 max-h-[55vh] overflow-y-auto shadow-xl touch-pan-y`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* overlay */}
          <motion.div
            className={overlayClass}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* bottom sheet */}
          <motion.div
            key="comments-popup"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(e, info) => {
              if (info.offset.y > 120) onClose();
            }}
            className={sheetClass}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* drag handle */}
            <div className="flex justify-center mb-3">
              <div className="w-12 h-1.5 bg-gray-500/60 rounded-full" />
            </div>

            {/* header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Comments 💬
              </h2>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="text-gray-400 hover:text-white transition"
                aria-label="Close comments"
              >
                <X size={22} />
              </button>
            </div>

            {/* add comment */}
            {userData && (
              <form
                onSubmit={handleAddComment}
                className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex flex-col space-y-2 mb-4"
              >
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="bg-transparent text-white placeholder-gray-400 resize-none outline-none"
                  rows={2}
                />
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.96 }}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  {loading ? <Loading text={"Posting"} /> : "Post"}
                </motion.button>
              </form>
            )}

            {/* comment list */}
            <div className="space-y-3">
              {comments.length === 0 ? (
                <p className="text-gray-400 text-center italic">
                  No comments yet...
                </p>
              ) : (
                comments.map((c) => (
                  <motion.div
                    key={c._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 border border-white/10 rounded-xl p-3"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-pink-400">
                        {c?.owner?.username || "Unknown User"}
                      </h4>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleLike(c._id)}
                            className={`transition ${
                              commentLikes[c._id]?.likedByUser
                                ? "text-red-500"
                                : "hover:text-pink-400 text-gray-400"
                            }`}
                            aria-label="Like comment"
                          >
                            <Heart size={18} />
                          </button>
                          <span className="text-xs text-gray-400">
                            {commentLikes[c._id]?.totalLikes || 0}
                          </span>
                        </div>

                        {userData?._id === c?.owner?._id && (
                          <>
                            <button
                              onClick={() => {
                                setEditId(c._id);
                                setEditText(c.content);
                              }}
                              className="hover:text-purple-400 transition"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(c._id)}
                              className="hover:text-red-500 transition"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {editId === c._id ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="bg-white/10 p-2 rounded-md text-white outline-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(c._id)}
                            className="text-sm text-green-400 hover:underline"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="text-sm text-gray-400 hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-200">{c.content}</p>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommentsSection;
