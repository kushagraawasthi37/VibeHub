import User from "../models/user.js";

import {
  sendEmail,
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
} from "../utils/mail.js";

import crypto from "crypto";
import bcrypt from "bcrypt";
import { use } from "react";
// -------- REGISTER USER --------

export const registerUser = async (req, res) => {
  try {
    const { email, username, password, name, age } = req.body;

    if (!email || !username || !password || !name || !age) {
      return res.status(400).json("All fields are required");
    }
    // Check if user already exists
    let existingUser = await User.findOne({ $or: [{ email }, { username }] }); //$or is a query operator in MongoDB.It allows you to match documents that satisfy at least one condition from an array of conditions.Think of it like a logical OR in programming: condition1 || condition2.
    if (existingUser) {
      return res.status(400).json({ message: "User already exist.Login Now" });
    }

    // Generate verification token
    const unHashedToken = crypto.randomBytes(20).toString("hex");

    //Yeh unHashedToken ko SHA-256 algorithm se hash karta hai.
    // Yaani hum original token ko store nahi karte — uska hashed version save karte hain (for security).
    const hashedToken = crypto
      .createHash("sha256")
      .update(unHashedToken)
      .digest("hex");
    const tokenExpiry = Date.now() + 15 * 60 * 1000; //3 mins

    //Create  a temp user until Email verification not saved
    const tempUser = new User({
      email,
      username,
      name,
      age,
      password,
      emailVerificationToken: hashedToken,
      emailVerificationExpiry: tokenExpiry,
      isEmailVerified: false,
    });

    await tempUser.save();

    // Send verification email
    // Use FRONTEND_URL from .env
    const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${unHashedToken}`;

    const emailContent = emailVerificationMailgenContent(
      username,
      verificationURL
    );

    await sendEmail({
      email,
      subject: "Verify Your Email",
      html: `<p>${emailContent.body.intro}</p>
             <p>${emailContent.body.action.instructions}</p>
             <a href="${verificationURL}" style="color:#fff; background:#22BC66; padding:10px 20px; text-decoration:none;">Verify Email</a>
             <p>${emailContent.body.outro}</p>`,
    });

    res.status(201).json({
      message:
        "Email verification link sent successfully check your inbox or spam",
    });
  } catch (err) {
    // console.error(err);
    res.status(500).json({
      message: "Something went wrong. Please try again.",
    });
  }
};

// -------- EMAIL VERIFICATION --------
export const verifyEmail = async (req, res) => {
  try {
    const token = req.params.token;
    //Convert this token into hashed token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpiry: { $gt: Date.now() }, //$gt stands for “greater than”.It is used in queries to find documents where a field’s value is greater than a specified value.
    });

    if (!user) {
      return res.status(403).json({
        message: "Invalid or expired verification link.",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    //Wo jo temp user banaya hai usko save kardo
    await user.save();

    return res.status(201).json({
      message: "Email verified successfully. You can now login.",
      user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Something went wrong. Please try again.",
    });
  }
};

// -------- LOGIN --------
export const loginUser = async (req, res) => {
  try {
    // Debug: login
    console.log("⚡ Login route hit");

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
    // Debug: log email before processing
    // console.log("Email received from form:", `"${email}"`);

    const emailInput = email?.toLowerCase().trim();
    // console.log("Normalized email:", `"${emailInput}"`);

    // Find user in DB
    const user = await User.findOne({ email: emailInput }).select("+password");
    console.log("Found user:", user);

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    if (!user.isEmailVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email first." });
    }

    const isMatch = await user.isPasswordCorrect(password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(403).json({ message: "Incorrect password." });
    }

    //Sab sahi hai login kr skta hai aab cookie set krdo
    const isProd = process.env.NODE_ENV === "production";

    const accessToken = user.generateAccessToken();
    res.cookie("token", accessToken, {
      httpOnly: true, // prevents JS access
      secure: process.env.NODE_ENV === "production", // only HTTPS in prod
      sameSite: isProd ? "strict" : "none",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });

    // httpOnly:true
    //Prevents JavaScript in the browser from accessing the cookie.
    //Improves security by protecting the cookie from XSS (cross-site scripting) attacks.
    //Browser can still send the cookie automatically on every request to your server.

    return res
      .status(200)
      .json({ message: "Login successful!", user, accessToken });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login error" });
  }
};

export const googleAuth = async (req, res) => {
  try {
    // console.log("google auth hit");
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ message: "Email and name are required" });
    }

    let user = await User.findOne({ email }); // use 'let' so it can be reassigned

    if (!user) {
      user = await User.create({
        email,
        name,
        provider: "google", // mark user as Google-based
        isEmailVerified: true,
      });
    }

    // console.log(user.name);

    const isProd = process.env.NODE_ENV === "production";
    const accessToken = user.generateAccessToken();

    console.log(isProd);
    res.cookie("token", accessToken, {
      httpOnly: true, // prevents JS access
      secure: isProd, // HTTPS only in prod
      sameSite: isProd ? "strict" : "lax", // prevents CSRF
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });

    res.status(200).json({
      message: "User login successful",
      user,
      token: accessToken, // changed to match generated token
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: "Google authentication failed" });
  }
};

export const afterGoogleAuthDetails = async (req, res) => {
  try {
    const { password, username } = req.body;
    if (!password || !username) {
      return res
        .status(400)
        .json({ message: "password and username must required" });
    }
    const token = req.token;
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }

    const hashedPassowrd = await bcrypt.hash(password, 10);

    user.password = hashedPassowrd;
    user.username = username;

    await user.save();
    return res.status(201).json({
      message: "password and username updated sucessfully",
      user,
      token,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong.Cant update details now" });
  }
};

// -------- LOGOUT --------
export const logoutUser = (req, res) => {
  try {
    res.cookie("token", "", { maxAge: 1 }); // maxAge: 1  → Sets the cookie to expire in 1 millisecond.
    return res
      .status(200)
      .json({ message: "You have logged out successfully." });
  } catch (error) {
    res.status(500).json({ message: "Logout error" });
  }
};

// -------- FORGOT PASSWORD ---------
export const sendForgotPasswordEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(403).json({ message: "Email not found." });
    }

    // Generate token
    const unHashedToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(unHashedToken)
      .digest("hex");
    const tokenExpiry = Date.now() + 15 * 60 * 1000; // 3 mins tak valid rahega

    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = tokenExpiry;
    await user.save();

    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${unHashedToken}`;
    const emailContent = forgotPasswordMailgenContent(user.username, resetURL);

    await sendEmail({
      email: user.email,
      subject: "Reset Your Password",
      html: `<p>${emailContent.body.intro}</p>
             <p>${emailContent.body.action.instructions}</p>
             <a href="${resetURL}" style="color:#fff; background:#FF0000; padding:10px 20px; text-decoration:none;">Reset Password</a>
             <p>${emailContent.body.outro}</p>`,
    });

    console.log(hashedToken);
    return res.status(200).json({
      token: hashedToken,
      message: "Password reset email sent. Check your inbox! or spam",
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

// -------- RESET PASSWORD PAGE --------
export const getResetPasswordPage = async (req, res) => {
  try {
    const token = req.params.token;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      forgotPasswordToken: hashedToken,
      forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(403)
        .json({ message: "Invalid or expired reset link.", token });
    }

    return res.status(200).json({
      message: "",
      userId: user._id,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

// -------- RESET PASSWORD ACTION --------
export const resetForgotPassword = async (req, res) => {
  try {
    const token = req.params.token;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    console.log(hashedToken);
    const user = await User.findOne({
      forgotPasswordToken: hashedToken,
      forgotPasswordExpiry: { $gt: Date.now() },
    });

    console.log(user);

    if (!user) {
      return res
        .status(403)
        .json({ message: "Invalid or expired reset link." });
    }

    user.password = req.body.newPassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save();

    return res.status(200).json({
      message: "Password reset successful. You can now login!",
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};
