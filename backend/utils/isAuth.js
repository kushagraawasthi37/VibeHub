import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const isLoggedIn = async (req, res, next) => {
  try {
    // Extract token from cookie or Authorization header
    const tokenFromCookie = req.cookies?.token;
    const authHeader = req.header("Authorization");
    const tokenFromHeader = authHeader?.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "").trim()
      : null;

    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      console.log("Token not found");
      return res.status(401).json({ message: "Unauthorized: Token missing" });
    }

    // console.log("Token received:", token);

    // Verify token validity
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (verifyError) {
      // console.error("Token verification failed:", verifyError);
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    // Find user by decoded token user ID
    const user = await User.findById(decoded.id);
    if (!user) {
      // console.log("User not found for decoded token");
      return res.status(403).json({ message: "Forbidden: User not found" });
    }

    // Attach user and token to request
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    // console.error("Auth middleware error:", err);
    res.status(500).json({ message: "Server error: Please log in again." });
  }
};
