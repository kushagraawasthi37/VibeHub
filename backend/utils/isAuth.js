// utils/middleware.js
import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const isLoggedIn = async (req, res, next) => {
  try {
    // 🧠 Token le from either cookie or header
    const token =
      req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(400).json({ message: "invalid token" });
    }
    // console.log(token);
    // 🔍 Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded token: ", decoded);
    // 🧩 Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(403).json({ message: "User not found." });
    }

    // attach information to user
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ message: "Please log in again." });
  }
};
