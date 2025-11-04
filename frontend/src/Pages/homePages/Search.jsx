import React, { useState, useEffect } from "react";
import axiosInstance from "../../contexts/axiosInstance";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User } from "lucide-react";
import Loading from "../../components/Loading";
import profile from "../../assets/avatar.png";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Debounce for smooth searching
  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      setMessage("");
      return;
    }

    const delayDebounce = setTimeout(() => {
      handleSearch();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setMessage("");
      const res = await axiosInstance.post("/api/users/search/user", {
        username: query.trim(),
      });
      setUsers(res.data.users);
    } catch (err) {
      if (err.response?.status === 404) {
        setUsers([]);
        setMessage(`No results for "${query}"`);
      } else {
        setMessage("Error fetching users.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-start bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white font-sans relative overflow-hidden px-4 py-6">
      {/* Floating gradient blobs */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.25, scale: 1 }}
        transition={{ duration: 3, repeat: Infinity, repeatType: "mirror" }}
        className="absolute top-[-10%] left-[-10%] w-60 h-60 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl"
      />
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
      />

      {/* Title */}
      <motion.h1
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-3xl sm:text-4xl font-extrabold tracking-wide mt-6 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-lg"
      >
        Search VibeHub Users 🔍
      </motion.h1>

      {/* Search Box */}
      <motion.div
        className="w-full max-w-lg mt-8 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-lg flex items-center gap-3 px-4 py-3 transition-all duration-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Search className="text-purple-400" size={22} />
        <input
          type="text"
          placeholder="Search by username..."
          className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </motion.div>

      {/* Results */}
      <div className="w-full max-w-lg mt-8">
        {loading ? (
          <div className="flex justify-center mt-8">
            <Loading />
          </div>
        ) : message ? (
          <motion.p
            className="text-center text-gray-300 italic mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {message}
          </motion.p>
        ) : (
          <AnimatePresence>
            <motion.div
              layout
              className="flex flex-col gap-4 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {users.map((user, index) => (
                <motion.div
                  key={user._id}
                  onClick={() => navigate(`/profile/${user._id}`)}
                  className="flex items-center gap-3 backdrop-blur-xl bg-white/10 border border-white/20 p-4 rounded-2xl shadow-md cursor-pointer transition-all duration-300 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:bg-white/20"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <motion.img
                    src={user.avatar || profile}
                    alt="avatar"
                    className="w-12 h-12 rounded-full border border-purple-500/40 object-cover"
                    whileHover={{ rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-white text-lg">
                      {user.username}
                    </span>
                    {user.name && (
                      <span className="text-sm text-gray-300">{user.name}</span>
                    )}
                    {user.age && (
                      <span className="text-xs text-gray-400">
                        Age: {user.age}
                      </span>
                    )}
                  </div>
                  <User
                    className="ml-auto text-pink-400 opacity-80"
                    size={20}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
