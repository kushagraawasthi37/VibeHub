import React, { useState, useEffect, createContext, useRef } from "react";
import axiosInstance from "./axiosInstance";

export const userDataContext = createContext();

const UserContext = ({ children }) => {
  const [userData, setUserData] = useState(undefined);
  const [loadingUser, setLoadingUser] = useState(true);
  const fetchedOnce = useRef(false);
  const failedOnce = useRef(false); // prevent infinite retries for guest users

  const getCurrentUser = async () => {
    // 🧠 If already tried and failed once, don’t retry automatically
    if (failedOnce.current) return;

    try {
      setLoadingUser(true);
      const response = await axiosInstance.get("/api/users/currentuser", {
        withCredentials: true,
      });
      setUserData(response?.data?.user || null);
    } catch (error) {
      failedOnce.current = true; // 🔥 remember failure
      setUserData(null);
      console.warn("No active session, skipping further checks.");
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    // ✅ Only once on mount (even in StrictMode)
    if (!fetchedOnce.current) {
      fetchedOnce.current = true;
      getCurrentUser();
    }
  }, []);

  const value = { userData, setUserData, getCurrentUser, loadingUser };

  return (
    <userDataContext.Provider value={value}>
      {children}
    </userDataContext.Provider>
  );
};

export default UserContext;
