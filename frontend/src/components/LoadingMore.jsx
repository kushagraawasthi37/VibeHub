// LoadingMore.jsx
import React from "react";

const LoadingMore = () => (
  <div className="w-full flex justify-center py-4">
    <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-8 w-8"></div>
    <style>{`
      .loader {
        border-top-color: #6366f1;  /* Indigo */
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export default LoadingMore;
