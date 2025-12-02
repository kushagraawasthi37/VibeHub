import React from "react";
import { ToastContainer } from "react-toastify";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Auth
import Registration from "./Pages/authPages/Registration";
import Login from "./Pages/authPages/Login";
import AfterGoogleAuthDetails from "./Pages/authPages/AfterGoogleAuth";
import ForgotPassword from "./Pages/authPages/ForgetPassword";
import VerifyEmail from "./utils/AuthVerification";
import VerifyResetToken from "./utils/VeriffyResetToken";

// Post
import CreatePost from "./Pages/postPages/CreatePost";
import EditPostPage from "./Pages/postPages/EditPostPage";
import CommentsSection from "./Pages/postPages/CommentSection";
import SinglePost from "./Pages/userPages/SinglePost";

// Home
import HomeFeed from "./Pages/homePages/HomeFeed";
import SavedPosts from "./Pages/homePages/SavedPosts";
import ReelPage from "./Pages/homePages/ReelPage";
import Search from "./Pages/homePages/Search";

// User
import ProfilePage from "./Pages/userPages/ProfilePage";
import EditProfile from "./Pages/userPages/EditProfile";
import DeleteAccountPage from "./Pages/userPages/DeleteAccountPage";
import ConversationPage from "./Pages/userPages/ConversationPage";
import MessagePage from "./Pages/userPages/MessagePage";

const App = () => {
  return (
    <div>
      <ToastContainer />
      <Router>
        <Routes>
          {/* Post Routes */}
          <Route path="/createpost" element={<CreatePost />} />
          <Route path="/post/:postid" element={<SinglePost />} />
          <Route path="/post/edit/:postid" element={<EditPostPage />} />
          <Route path="/comment/:postId" element={<CommentsSection />} />

          {/* Auth Routes */}
          <Route path="/signup" element={<Registration />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgetpassword" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<VerifyResetToken />} />
          <Route
            path="/auth/updateDetails"
            element={<AfterGoogleAuthDetails />}
          />

          {/* Home */}
          <Route path="/" element={<HomeFeed />} />
          <Route path="/saved" element={<SavedPosts />} />
          <Route path="/feed" element={<ReelPage />} />
          <Route path="/search" element={<Search />} />

          {/* User */}
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/profile/editprofile/:id" element={<EditProfile />} />
          <Route
            path="/profile/delete-account/:username/:id"
            element={<DeleteAccountPage />}
          />
          <Route path="/conversations" element={<ConversationPage />} />
          <Route
            path="/message/:otherParticipantId"
            element={<MessagePage />}
          />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
