// server.js
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import session from "express-session";
import flash from "connect-flash";
import cors from "cors";
import { fileURLToPath } from "url";
import connectDB from "./db/db.js";
import User from "./models/user.js";

// ESM dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config();

// Connect MongoDB
connectDB();

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";

const app = express();

// ✅ CORS (for React frontend)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173", // React dev server
    credentials: true, // Allow cookies / tokens
  })
);

// ✅ Core middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "public"))); // serve static files if needed
app.set("trust proxy", 1);

// ✅ Session middleware (for flash + login session)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

// ✅ Flash messages (optional)
app.use(flash());

// ✅ Attach flash data to res.locals (optional, for debugging)
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comment", commentRoutes);

// ✅ Fallback route for unknown API paths
app.use("*", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// ✅ Periodic cleanup (temporary users)
setInterval(async () => {
  try {
    const result = await User.deleteMany({
      isEmailVerified: false,
      emailVerificationExpiry: { $lt: Date.now() },
    });
    if (result.deletedCount > 0)
      console.log(`🗑️ Cleaned up ${result.deletedCount} expired temp users`);
  } catch (err) {
    console.error("Cleanup error:", err);
  }
}, 30 * 60 * 1000);

// ✅ Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
