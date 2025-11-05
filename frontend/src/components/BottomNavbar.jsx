import React, { useContext, useEffect, useCallback, Suspense } from "react";
import { motion } from "framer-motion";
import { Home, Search, PlusSquare, PlayCircle, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userDataContext } from "../contexts/UserContext";
import { toast } from "react-toastify";

// Lazy load icons to reduce bundle size if needed (optional)
// Here, using them directly as they are small SVG components

const BottomNavbar = React.memo(() => {
  const navigate = useNavigate();
  const { userData, getCurrentUser } = useContext(userDataContext);

  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  const handleNavigateHome = useCallback(() => navigate("/"), [navigate]);
  const handleNavigateSearch = useCallback(
    () => navigate("/search"),
    [navigate]
  );
  const handleNavigateFeed = useCallback(() => navigate("/feed"), [navigate]);
  const handleCreateClick = useCallback(() => {
    if (!userData) {
      toast.error("Login for uploading post");
      return;
    }
    navigate("/createpost");
  }, [userData, navigate]);
  const handleProfileClick = useCallback(() => {
    if (!userData) {
      toast.error("Login for profile");
      return;
    }
    navigate(`/profile/${userData._id}`);
  }, [userData, navigate]);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="fixed bottom-0 left-0 w-full bg-gradient-to-r from-[#1a1533]/90 via-[#2a2459]/90 to-[#1a1533]/90 backdrop-blur-2xl border-t border-white/10 shadow-[0_-2px_15px_rgba(168,85,247,0.3)] flex items-center justify-around py-3 sm:py-4 z-50 sm:hidden"
    >
      {[
        { label: "Home", Icon: Home, onClick: handleNavigateHome },
        { label: "Search", Icon: Search, onClick: handleNavigateSearch },
        { label: "Create", Icon: PlusSquare, onClick: handleCreateClick },
        { label: "Reels", Icon: PlayCircle, onClick: handleNavigateFeed },
        { label: "Profile", Icon: User, onClick: handleProfileClick },
      ].map(({ label, Icon, onClick }) => (
        <motion.button
          key={label}
          onClick={onClick}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 250 }}
          className="flex flex-col items-center text-gray-300 hover:text-white transition-all duration-100"
        >
          <motion.div
            whileHover={{
              background:
                "linear-gradient(90deg, rgba(168,85,247,1) 0%, rgba(236,72,153,1) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 8px rgba(236,72,153,0.6))",
            }}
            transition={{ duration: 0.25 }}
          >
            <Icon className="w-6 h-6" />
          </motion.div>
          <span className="text-[10px] sm:text-xs mt-1">{label}</span>
        </motion.button>
      ))}
    </motion.div>
  );
});

// If you want to lazy load this component in the main App or wherever used:
// const LazyBottomNavbar = React.lazy(() => import('./BottomNavbar'));
// Then wrap with <Suspense fallback={<div>Loading...</div>}> in the parent component.

export default BottomNavbar;
