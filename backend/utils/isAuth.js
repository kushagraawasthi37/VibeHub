import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const isLoggedIn = async (req, res, next) => {
  try {
    console.log(
      "\n====================== AUTH DEBUG START ======================"
    );

    // 🔍 1. Show incoming request path & method
    console.log(`➡️  Route: ${req.method} ${req.originalUrl}`);
    console.log("➡️  Time:", new Date().toLocaleString());

    // 🔍 2. Check what headers you actually received
    console.log("📩  Request Headers:", req.headers);

    // 🔍 3. Check cookies
    console.log("🍪  Cookies Received:", req.cookies);

    // Extract token from cookie or Authorization header
    const tokenFromCookie = req.cookies?.token;
    const authHeader = req.header("Authorization");

    console.log("👀  Raw Authorization Header:", authHeader);
    console.log("👀  Cookie Token:", tokenFromCookie);

    const tokenFromHeader = authHeader?.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "").trim()
      : null;

    console.log("🔎  Extracted Header Token:", tokenFromHeader);

    const token = tokenFromCookie || tokenFromHeader;

    // 🔍 4. Final token decision
    console.log("🎯  Final Token Used:", token);

    if (!token) {
      console.log("❌ Token not found — NO header or cookie.");
      console.log(
        "======================= AUTH DEBUG END =======================\n"
      );
      return res.status(401).json({ message: "Unauthorized: Token missing" });
    }

    // 🔍 5. Verify token validity
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      console.log("✅ Token Decoded Successfully:", decoded);
    } catch (verifyError) {
      console.log("❌ Token verification failed:", verifyError.message);
      console.log(
        "======================= AUTH DEBUG END =======================\n"
      );
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    // 🔍 6. Fetch user by decoded.id
    const user = await User.findById(decoded.id);

    if (!user) {
      console.log("❌ User not found for decoded ID:", decoded.id);
      console.log(
        "======================= AUTH DEBUG END =======================\n"
      );
      return res.status(403).json({ message: "Forbidden: User not found" });
    }

    console.log("👤  User Found:", { id: user._id, email: user.email });

    // Attach user & token
    req.user = user;
    req.token = token;

    console.log("✅ Middleware Passed Successfully");
    console.log(
      "======================= AUTH DEBUG END =======================\n"
    );

    next();
  } catch (err) {
    console.log("💥 AUTH MIDDLEWARE CRASH:", err);
    console.log(
      "======================= AUTH DEBUG END =======================\n"
    );

    res.status(500).json({ message: "Server error: Please log in again." });
  }
};
