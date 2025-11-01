import React, { createContext, useContext } from "react";

export const PostDataContext = createContext();
const PostContext = ({ children }) => {
  
  return (
    <div>
      <PostDataContext.Provider value={value}>
        {children}
      </PostDataContext.Provider>
    </div>
  );
};

export default PostContext;
