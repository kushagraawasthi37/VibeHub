import React from "react";
import { ToastContainer, toast } from "react-toastify";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Registration from "./Pages/authPages/Registration";
import Login from "./Pages/authPages/Login";
import AfterGoogleAuthDetails from "./Pages/authPages/AfterGoogleAuth";
import ForgotPassword from "./Pages/authPages/ForgetPassword";
import ResetPassword from "./Pages/authPages/ResetPassword";
import VerifyEmail from "./utils/AuthVerification";
import Loader from "./components/Loader";
import VerifyResetToken from "./utils/VeriffyResetToken";

const App = () => {
  return (
    <div>
      <ToastContainer />
      <Router>
        <Routes>
          <Route path="/" element={<Loader />} />
          <Route path="/signup" element={<Registration />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgetpassword" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<VerifyResetToken />} />
          <Route
            path="/auth/updateDetails"
            element={<AfterGoogleAuthDetails />}
          />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
