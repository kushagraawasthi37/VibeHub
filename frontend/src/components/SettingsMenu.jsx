import React, { useState, useRef, useEffect } from "react";
import { Settings, Trash2, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useContext } from "react";
import { userDataContext } from "../contexts/UserContext";

import axiosInstance from "../contexts/axiosInstance";
import { toast } from "react-toastify";

const SettingsMenu = () => {
  const { id } = useParams();
  const [open, setOpen] = useState(false);
  const { userData } = useContext(userDataContext);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const [isOwner, setIsOwner] = useState(false);
  const { getCurrentUser } = useContext(userDataContext);

  const logoutHandler = async () => {
    try {
      const response = await axiosInstance.get(`/api/auth/logout`, {
        withCredentials: true,
      });

      localStorage.removeItem("authToken");

      console.log(response.data);
      navigate("/login");
      toast.success(response.data);
    } catch (error) {
      console.log(error);
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(errorMessage);
    }
  };

  const checkOwner = async () => {
    try {
      if (!id) return;
      getCurrentUser();
      const response = await axiosInstance.get(`/api/users/owner/${id}`);
      setIsOwner(response.data);
      // console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Close dropdown when clicked outside
  useEffect(() => {
    const fetch = async () => {
      await checkOwner();
    };
    fetch();
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Settings Button */}
      <Settings
        onClick={() => setOpen((prev) => !prev)}
        className="cursor-pointer text-gray-300 hover:text-purple-400 transition-transform duration-300 hover:rotate-90"
      />

      {/* Dropdown Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-44 bg-[#18181b] border border-zinc-700 rounded-xl shadow-lg p-2 z-50"
          >
            {isOwner && (
              <button
                onClick={() => {
                  setOpen(false);
                  navigate(
                    `/profile/delete-account/${userData?.username}/${id}`
                  ); // change route as needed
                }}
                className="w-full flex items-center gap-2 text-red-400 hover:bg-red-500/10 transition-colors duration-200 rounded-lg px-3 py-2 text-sm"
              >
                <Trash2 className="w-4 h-4" /> Delete Account
              </button>
            )}{" "}
            {userData ? (
              <>
                <button
                  onClick={() => {
                    setOpen(false);
                    logoutHandler(); // or handle logout logic
                  }}
                  className="w-full flex items-center gap-2 text-gray-300 hover:text-purple-400 hover:bg-purple-500/10 transition-colors duration-200 rounded-lg px-3 py-2 text-sm"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/login"); // or handle logout logic
                  }}
                  className="w-full flex items-center gap-2 text-gray-300 hover:text-purple-400 hover:bg-purple-500/10 transition-colors duration-200 rounded-lg px-3 py-2 text-sm"
                >
                  <LogOut className="w-4 h-4" /> Login
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsMenu;
