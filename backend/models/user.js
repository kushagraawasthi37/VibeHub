import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    avatar: {
      type: String,
    },

    // Basic info
    username: {
      type: String,
      required: function () {
        return this.provider === "email"; // only required for normal signup
      },
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    name: { type: String, trim: true },
    age: { type: Number },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    provider: {
      type: String,
      enum: ["google", "email"],
      default: "email",
    },

    password: {
      type: String,
      required: function () {
        return this.provider === "email"; // only required for normal login
      },
      select: false, // secure: exclude from query by default
    },

    privateAccount: {
      type: Boolean,
      default: false,
    },

    bio: {
      type: String,
    },

    // Verification & tokens
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpiry: { type: Date },
    forgotPasswordToken: { type: String },
    forgotPasswordExpiry: { type: Date },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

//
// ---------------- Password Hash ----------------
userSchema.pre("save", async function (next) {
  // only hash if normal user and password changed
  if (this.provider !== "email" || !this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//
// ---------------- JWT ----------------
userSchema.methods.generateAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};

//
// ---------------- Refresh Token ----------------
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

//
// ---------------- Temporary Token ----------------
userSchema.methods.generateTemporaryToken = function () {
  const unHashedToken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");
  const tokenExpiry = Date.now() + 3 * 60 * 1000; // 3 min
  return { unHashedToken, hashedToken, tokenExpiry };
};

//
// ---------------- Password Verification ----------------
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
