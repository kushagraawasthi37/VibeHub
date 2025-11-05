import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../contexts/axiosInstance";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import {
  Send,
  ArrowLeft,
  MoreVertical,
  Trash2,
  LeafyGreen,
} from "lucide-react";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";
import profile from "../../assets/avatar.png";
import BottomNavBar from "../../components/BottomNavbar";
import LeftNavBar from "../../components/LeftNavbar";

const ConversationPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(null); // track which conversation menu is open
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axiosInstance.get("/api/users/getallconversations");
        setConversations(res.data.allConversation || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const handleDeleteConversation = async (conversationId) => {
    try {
      await axiosInstance.delete(
        `/api/users/conversation/delete/${conversationId}`
      );
      toast.success("Conversation deleted successfully 🗑️");
      setConversations((prev) =>
        prev.filter((conv) => conv._id !== conversationId)
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete conversation ❌");
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const other =
      conv.participants?.find(
        (p) => p._id !== JSON.parse(localStorage.getItem("user"))?._id
      ) || conv.participants[0];
    return other.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white flex flex-col items-center justify-start p-4 font-sans">
          {/* Header */}
          <BottomNavBar />
          <LeftNavBar />
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 mt-4 mb-6 w-full max-w-md"
          >
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img src={logo} alt="logo" className="w-10 h-10 rounded-full" />
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Conversations
            </h1>
          </motion.div>

          {/* Search input */}
          <input
            type="text"
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4 w-full max-w-md px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />

          {/* Conversations List */}
          <div className="w-full max-w-md flex flex-col gap-3 overflow-y-auto scrollbar-thin scrollbar-thumb-pink-500 scrollbar-track-transparent relative">
            {filteredConversations.length === 0 ? (
              <p className="text-gray-300 text-center mt-10 italic">
                No conversations found 😅
              </p>
            ) : (
              filteredConversations.map((conv) => {
                const other =
                  conv.participants?.find(
                    (p) =>
                      p._id !== JSON.parse(localStorage.getItem("user"))?._id
                  ) || conv.participants[0];

                return (
                  <motion.div
                    key={conv._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`relative flex items-center justify-between gap-4 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl shadow-md hover:bg-white/20 transition-colors duration-200 overflow-visible ${
                      menuOpen === conv._id ? "z-50" : "z-10"
                    }`}
                  >
                    {/* Left side (profile + info) */}
                    <div
                      onClick={() => navigate(`/message/${other?._id}`)}
                      className="flex items-center gap-4 cursor-pointer w-full"
                    >
                      <img
                        src={other?.avatar || profile}
                        alt={other?.username || "User"}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-lg text-white">
                          {other?.username || "Unknown User"}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Tap to view your conversation 💬
                        </p>
                      </div>
                    </div>

                    {/* Right side 3-dot menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(menuOpen === conv._id ? null : conv._id);
                        }}
                        className="p-2 hover:bg-white/20 rounded-full transition"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-300" />
                      </button>

                      <AnimatePresence>
                        {menuOpen === conv._id && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.2 }}
                            // Make sure dropdown has enough right margin and z-index
                            className="absolute right-0 mt-2 w-40 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg z-50"
                            style={{ overflow: "visible" }} // prevent clipping inside dropdown itself if needed
                          >
                            <button
                              onClick={() => handleDeleteConversation(conv._id)}
                              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/20 rounded-md transition"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Conversation
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ConversationPage;
