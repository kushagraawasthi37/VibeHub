import React, { useState } from "react";
import { createContext } from "react";
import axiosInstance from "./axiosInstance";
import { toast } from "react-toastify";

export const userDataContext = createContext();
const UserContext = ({ children }) => {
  const [userData, setUserData] = useState(undefined);

  const getCurrentUser = async () => {
    try {
      const response = await axiosInstance.get("/api/users/currentuser", {
        withCredentials: true,
      });

      // console.log(response.data?.user);
      setUserData(response.data?.user);
    } catch (error) {
      console.log(error.message);
      // toast.error("Login again");
    }
  };

  useState(() => {
    const fetchData = async () => {
      await getCurrentUser();
    };

    fetchData();
  }, []);
  const value = { userData, getCurrentUser };
  return (
    <div>
      <userDataContext.Provider value={value}>
        {children}
      </userDataContext.Provider>
    </div>
  );
};

export default UserContext;
