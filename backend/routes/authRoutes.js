import express from "express";
import {
  getResetPasswordPage,
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  sendForgotPasswordEmail,
  resetForgotPassword,
  googleAuth,
  afterGoogleAuthDetails,
} from "../controllers/authController.js";

import {
  userRegistorValidator,
  userLoginValidator,
} from "../validators/userValidator.js";

import { validationResult } from "express-validator";
import { isLoggedIn } from "../utils/isAuth.js";

const router = express.Router();

// -------- GET PAGES --------
router.get("/reset-password/:token", getResetPasswordPage);

// -------- REGISTRATION --------
router.post("/register", userRegistorValidator(), (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((err) => err.msg)
      .join(", ");

    return res.status(401).json({ message });
  }

  // ✅ all good → call controller
  registerUser(req, res);
});

router.post("/googleauth", googleAuth);
router.post("/googleauth/details", isLoggedIn, afterGoogleAuthDetails);

// -------- EMAIL VERIFICATION --------
router.get("/verify-email/:token", verifyEmail);

// -------- LOGIN --------
router.post("/login", loginUser);

// -------- LOGOUT --------
router.get("/logout", logoutUser);

// -------- FORGOT PASSWORD --------
router.post("/forgot-password", sendForgotPasswordEmail);

router.get("/reset-password/:token", getResetPasswordPage);

// -------- RESET PASSWORD --------
router.post("/reset-password/:token", resetForgotPassword);

export default router;
