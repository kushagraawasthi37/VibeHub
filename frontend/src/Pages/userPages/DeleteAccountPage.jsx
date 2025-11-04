import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cone, ShieldAlert, Trash2, XCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../contexts/axiosInstance";
import { toast } from "react-toastify";

const DeleteAccountPage = () => {
  const navigate = useNavigate();
  const { username, id } = useParams();
  const [confirmUserName, setConfirmUserName] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [confirmCheck, setConfirmCheck] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const handleDelete = async () => {
    try {
      console.log(`/api/users/delete-account/${id}`);
      if (!confirmCheck || confirmText !== "DELETE" || !confirmUserName) {
        setShowConfirm(true);
        return;
      }
      setLoading(true);
      const response = await axiosInstance.post(
        `/api/users/delete-account/${id}`,
        { confirmCheck, confirmText, confirmUserName },
        { withCredentials: true }
      );

      toast.success(response.data?.message);

      setTimeout(() => {
        setLoading(false);
        setDone(true);
        setTimeout(() => navigate("/"), 1800);
      }, 1500);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  console.log(id);
  console.log(username);
  console.log(`/api/users/delete-account/${id}`);

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0f0f10] px-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[#18181b] rounded-2xl shadow-[0_0_25px_rgba(168,85,247,0.15)] p-8 w-full max-w-md border border-zinc-800 relative"
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="p-4 bg-red-500/10 rounded-full mb-3">
            <ShieldAlert className="text-red-500 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            Delete Your Account
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Once you delete your account, all your posts, followers, and data
            will be permanently removed.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="text-gray-300 text-sm mb-1 block">
              Enter your username "{username}" to confirm:
            </label>
            <input
              type="text"
              value={confirmUserName}
              onChange={(e) => setConfirmUserName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="your_username"
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm mb-1 block">
              Type <span className="text-red-500 font-semibold">DELETE</span> to
              confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="DELETE"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={confirmCheck}
              onChange={(e) => setConfirmCheck(e.target.checked)}
              className="accent-red-500"
            />
            <span className="text-gray-400 text-sm">
              I understand that this action cannot be undone.
            </span>
          </div>
        </div>

        {/* Delete Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleDelete}
          disabled={loading || done}
          className={`mt-6 w-full flex justify-center items-center gap-2 py-2.5 rounded-lg text-white font-medium transition-colors ${
            loading
              ? "bg-red-800 cursor-wait"
              : done
              ? "bg-green-600"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {loading ? (
            <span className="animate-pulse">Deleting...</span>
          ) : done ? (
            "Account Deleted ✅"
          ) : (
            <>
              <Trash2 className="w-5 h-5" /> Delete Account
            </>
          )}
        </motion.button>
      </motion.div>

      {/* In-page confirm modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 10 }}
              className="bg-[#18181b] border border-zinc-700 rounded-2xl shadow-xl p-6 w-[90%] max-w-sm text-center"
            >
              <XCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-1">
                Incomplete Confirmation
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Please make sure all confirmation steps are completed correctly
                before deleting your account.
              </p>
              <button
                onClick={() => setShowConfirm(false)}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeleteAccountPage;
