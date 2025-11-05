import React, { useEffect, useState, useRef, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  ArrowLeft,
  MoreVertical,
  Edit2,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../contexts/axiosInstance";
import Loading from "../../components/Loading";
import profilePic from "../../assets/avatar.png";
import { userDataContext } from "../../contexts/UserContext";
import { toast } from "react-toastify";

const MessagePage = () => {
  const { otherParticipantId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [menuOpenId, setMenuOpenId] = useState(null); // which message's menu is open
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");

  const navigate = useNavigate();
  const scrollRef = useRef();
  const menuContainerRef = useRef(null);
  const { userData, getCurrentUser } = useContext(userDataContext);
  const myId = userData?._id?.toString();

  useEffect(() => {
    getCurrentUser();
    fetchMessages();

    // close menus/confirm when clicking outside the message area or menus
    const handleWindowClick = (e) => {
      // if click is outside the menu container, close
      if (!menuContainerRef.current?.contains(e.target)) {
        setMenuOpenId(null);
        setConfirmDeleteId(null);
      }
    };

    window.addEventListener("click", handleWindowClick);
    return () => window.removeEventListener("click", handleWindowClick);
    // eslint-disable-next-line
  }, [otherParticipantId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/api/message/get-message/${otherParticipantId}`
      );
      setMessages(res.data.conversation?.messages || []);
      setOtherUser(res.data.otherUser || null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
      setTimeout(
        () => scrollRef.current?.scrollIntoView({ behavior: "smooth" }),
        50
      );
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    try {
      const res = await axiosInstance.post(
        `/api/message/send/${otherParticipantId}`,
        { message: newMsg }
      );
      setMessages((prev) => [...prev, res.data.newMessage]);
      setNewMsg("");
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    }
  };

  // --------- Edit flow ----------
  const handleStartEdit = (msg) => {
    setMenuOpenId(msg._id); // keep menu open while entering edit mode
    setEditingMessageId(msg._id);
    setEditText(msg.message ?? msg.content ?? "");
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editText.trim()) return toast.warn("Message cannot be empty");
    try {
      const res = await axiosInstance.put(
        `/api/message/edit/${editingMessageId}`,
        { newContent: editText }
      );
      // update locally (preferred)
      const updated = res.data.updatedMessage || res.data.updated || null;
      if (updated) {
        setMessages((prev) =>
          prev.map((m) => (m._id === updated._id ? updated : m))
        );
      } else {
        // fallback: re-fetch
        const { data } = await axiosInstance.get(
          `/api/message/get-message/${otherParticipantId}`
        );
        setMessages(data.conversation.messages || []);
      }
      setEditingMessageId(null);
      setEditText("");
      toast.success("Message updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update message");
    }
  };

  // --------- Delete flow ----------
  // when user clicks Delete: open confirmation inside same menu (do NOT close menu)
  const handleDeleteClick = (messageId) => {
    setConfirmDeleteId(messageId);
    setMenuOpenId(messageId); // ensure menu remains open
  };

  const handleConfirmDelete = async (messageId) => {
    try {
      await axiosInstance.delete(`/api/message/delete/${messageId}`);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      setConfirmDeleteId(null);
      setMenuOpenId(null);
      toast.success("Message deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete message");
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
  };

  // helper to normalize sender id
  const getSenderIdString = (msg) => {
    if (!msg?.senderId) return "";
    if (typeof msg.senderId === "string") return msg.senderId;
    if (msg.senderId?._id) return msg.senderId._id.toString();
    return (msg.senderId?.id || msg.senderId?.toString() || "").toString();
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) return <Loading />;

  return (
    <div className="h-screen w-full flex justify-center items-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white font-sans overflow-x-hidden">
      {/* Main Chat Box */}
      <div
        className="relative w-full max-w-2xl h-[90vh] flex flex-col bg-[#1a1630]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
        style={{ overflow: "visible" }} // allow menus to overflow without page horizontal scroll
      >
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          {/* Header */}
          <motion.div
            initial={{ y: -15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-4"
          >
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <img
                src={otherUser?.avatar || profilePic}
                alt="Profile"
                className="w-9 h-9 rounded-full border border-white/20 object-cover"
              />
              <div>
                <h2 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  {otherUser?.username || "Chat Room"}
                </h2>
              </div>
            </div>
          </motion.div>

          {/* Messages */}
          {/* message list container: vertical scroll only, no horizontal scroll */}
          <div
            ref={menuContainerRef}
            className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-pink-500 scrollbar-track-transparent space-y-3 p-2"
          >
            {messages.map((msg, idx) => {
              const senderIdString = getSenderIdString(msg);
              const isMine = senderIdString === myId;

              // hide avatar for consecutive incoming messages
              const prevSender = messages[idx - 1]
                ? getSenderIdString(messages[idx - 1])
                : null;
              const showAvatar = !isMine && prevSender !== senderIdString;

              return (
                <div
                  key={msg._id}
                  className={`flex items-end gap-2 ${
                    isMine ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Left avatar for incoming */}
                  {!isMine && showAvatar && (
                    <img
                      src={msg.senderId?.avatar || profilePic}
                      alt="sender"
                      className="w-8 h-8 rounded-full border border-white/10 object-cover"
                    />
                  )}

                  {/* Message bubble + menu wrapper */}
                  <div className="relative max-w-[75%] group">
                    {editingMessageId === msg._id ? (
                      <form
                        onSubmit={handleSaveEdit}
                        className="flex items-center gap-2"
                      >
                        <input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full px-3 py-2 rounded-2xl bg-white/10 text-white outline-none"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="p-2 rounded-full bg-green-600"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="p-2 rounded-full bg-white/10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </form>
                    ) : (
                      <>
                        {/* Bubble */}
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.18 }}
                          className={`px-4 py-2 rounded-2xl text-sm sm:text-base break-words shadow-md ${
                            isMine
                              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none"
                              : "bg-white/10 backdrop-blur-md border border-white/20 text-gray-100 rounded-bl-none"
                          } transition-colors duration-150`}
                        >
                          {msg.message ?? msg.content}
                        </motion.div>

                        {/* 3-dot menu (only for owner) */}
                        {isMine && (
                          /* position menu so it doesn't overflow off-screen:
                             - placed to the left of bubble for right-aligned messages */
                          <div
                            className="absolute top-0"
                            style={{
                              // place it to the left of bubble (so it stays inside chat box)
                              right: "calc(100% + 8px)",
                              // for small screens ensure it is not too far left:
                              // if calc pushes it off-screen, it's still inside the parent box because page overflow-x-hidden
                            }}
                          >
                            <div className="flex flex-col items-end z-50">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuOpenId(
                                    menuOpenId === msg._id ? null : msg._id
                                  );
                                  // when opening a new menu, reset any confirm UI
                                  if (menuOpenId !== msg._id)
                                    setConfirmDeleteId(null);
                                }}
                                className="p-2 rounded-full hover:bg-white/10 hover:scale-110 transition duration-100 outline-none shadow-sm focus:ring-2 focus:ring-pink-400"
                                aria-label="message options"
                              >
                                <MoreVertical className="w-5 h-5 text-gray-300" />
                              </button>

                              <AnimatePresence>
                                {menuOpenId === msg._id && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                    transition={{ duration: 0.12 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="mt-2 right-0 w-44 bg-[#211e35]/95 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl shadow-black/60 overflow-hidden z-50 ring-1 ring-pink-500/20"
                                  >
                                    <button
                                      onClick={() => handleStartEdit(msg)}
                                      className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-white/10 text-white transition"
                                    >
                                      <Edit2 className="w-4 h-4 text-purple-400" />
                                      Edit
                                    </button>

                                    {confirmDeleteId === msg._id ? (
                                      <div className="flex flex-col items-center justify-center py-3 space-y-2 w-full">
                                        <p className="text-xs text-gray-300 text-center">
                                          Delete this message?
                                        </p>
                                        <div className="flex gap-3 mt-1">
                                          <button
                                            onClick={() =>
                                              handleConfirmDelete(msg._id)
                                            }
                                            className="px-3 py-1 text-xs bg-red-600 text-white hover:bg-red-700 rounded-lg"
                                          >
                                            Yes
                                          </button>
                                          <button
                                            onClick={handleCancelDelete}
                                            className="px-3 py-1 text-xs bg-white/10 text-white hover:bg-white/20 rounded-lg"
                                          >
                                            No
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() =>
                                          handleDeleteClick(msg._id)
                                        }
                                        className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-white/10 text-red-400 transition"
                                      >
                                        <Trash2 className="w-4 h-4 text-red-400" />
                                        Delete
                                      </button>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Right avatar for my messages (optional show) */}
                  {/* if you want avatar for my messages uncomment below */}
                  {/* {isMine && (
                    <img
                      src={msg.senderId?.avatar || profilePic}
                      alt="me"
                      className="w-8 h-8 rounded-full border border-white/10 object-cover"
                    />
                  )} */}
                </div>
              );
            })}
            <div ref={scrollRef}></div>
          </div>

          {/* Input box */}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 mt-2 bg-white/10 p-2 rounded-xl border border-white/20"
          >
            <input
              type="text"
              placeholder="Type a message..."
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 px-2"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MessagePage;
