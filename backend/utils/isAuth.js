// utils/middleware.js
import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const isLoggedIn = async (req, res, next) => {
  try {
    // 🧠 Token le from either cookie or header
    // console.log("Hit");
    const token =
      req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      // console.log("token not found");
      return res.status(400).json({ message: "invalid token" });
    }
    // console.log(token);
    // 🔍 Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("decoded token: ", decoded);
    // 🧩 Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log("User not found in authentication");
      return res.status(403).json({ message: "User not found." });
    }

    // console.log("User :", user.username);

    // attach information to user
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ message: "Please log in again." });
  }
};
