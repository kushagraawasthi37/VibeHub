import { createContext, useState, useRef, useEffect, useCallback } from "react";
import axiosInstance from "./axiosInstance";

export const userDataContext = createContext(null);

const UserContext = ({ children }) => {
  const [userData, setUserData] = useState(undefined);
  const [loadingUser, setLoadingUser] = useState(true);

  const fetchedOnce = useRef(false);
  const failedOnce = useRef(false);

  const getCurrentUser = useCallback(async () => {
    if (failedOnce.current) return;

    try {
      setLoadingUser(true);

      const res = await axiosInstance.get("/api/users/currentuser", {
        withCredentials: true,
      });

      setUserData(res?.data?.user || null);
    } catch {
      failedOnce.current = true;
      setUserData(null);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    if (!fetchedOnce.current) {
      fetchedOnce.current = true;
      getCurrentUser();
    }
  }, [getCurrentUser]);

  return (
    <userDataContext.Provider
      value={{
        userData,
        setUserData,
        loadingUser,
        getCurrentUser,
      }}
    >
      {children}
    </userDataContext.Provider>
  );
};

export default UserContext;
