import React, { useContext } from "react";
import { ToastContainer } from "react-toastify";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { userDataContext } from "./contexts/UserContext"; // adjust import if needed
import ProtectedRoute from "./ProtectedRoute";

// ✅ Auth Pages
import Registration from "./Pages/authPages/Registration";
import Login from "./Pages/authPages/Login";
import AfterGoogleAuthDetails from "./Pages/authPages/AfterGoogleAuth";
import ForgotPassword from "./Pages/authPages/ForgetPassword";
import VerifyEmail from "./utils/AuthVerification";
import VerifyResetToken from "./utils/VeriffyResetToken";

// ✅ Post Pages
import CreatePost from "./Pages/postPages/CreatePost";
import EditPostPage from "./Pages/postPages/EditPostPage";
import CommentsSection from "./Pages/postPages/CommentSection";
import SinglePost from "./Pages/userPages/SinglePost";

// ✅ Home & Feed Pages
import HomeFeed from "./Pages/homePages/HomeFeed";
import SavedPosts from "./Pages/homePages/SavedPosts";
import ReelPage from "./Pages/homePages/ReelPage";
import Search from "./Pages/homePages/Search";

// ✅ User Pages
import ProfilePage from "./Pages/userPages/ProfilePage";
import EditProfile from "./Pages/userPages/EditProfile";
import DeleteAccountPage from "./Pages/userPages/DeleteAccountPage";
import ConversationPage from "./Pages/userPages/ConversationPage";
import MessagePage from "./Pages/userPages/MessagePage";

const AppContent = () => {
  const { userData } = useContext(userDataContext);
  const location = useLocation();

  // Check if user logged in
  const isLoggedIn = userData && Object.keys(userData).length > 0;

  return (
    <>
      <ToastContainer />

      <Routes>
        {/* 🔓 Public Routes */}
        <Route
          path="/signup"
          element={isLoggedIn ? <Navigate to="/" replace /> : <Registration />}
        />
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to={location.state?.from || "/"} replace />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/verify-email/:token"
          element={isLoggedIn ? <Navigate to="/" replace /> : <VerifyEmail />}
        />
        <Route
          path="/forgetpassword"
          element={
            isLoggedIn ? <Navigate to="/" replace /> : <ForgotPassword />
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            isLoggedIn ? <Navigate to="/" replace /> : <VerifyResetToken />
          }
        />
        <Route
          path="/auth/updateDetails"
          element={
            isLoggedIn ? (
              <Navigate to="/" replace />
            ) : (
              <AfterGoogleAuthDetails />
            )
          }
        />

        {/* 🔒 Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomeFeed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/createpost"
          element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post/:postid"
          element={
            <ProtectedRoute>
              <SinglePost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post/edit/:postid"
          element={
            <ProtectedRoute>
              <EditPostPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/comment/:postId"
          element={
            <ProtectedRoute>
              <CommentsSection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <SavedPosts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <ReelPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/editprofile/:id"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/delete-account/:username/:id"
          element={
            <ProtectedRoute>
              <DeleteAccountPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/conversations"
          element={
            <ProtectedRoute>
              <ConversationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/message/:otherParticipantId"
          element={
            <ProtectedRoute>
              <MessagePage />
            </ProtectedRoute>
          }
        />

        {/* 404 Page */}
        <Route
          path="*"
          element={
            <h1 className="text-center text-white mt-10">404 - Not Found</h1>
          }
        />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
